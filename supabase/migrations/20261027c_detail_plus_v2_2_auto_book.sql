-- ============================================================================
-- Detail+ v2.2 — auto-booking (run AFTER v2 and v2.1)
--
-- Per plan on/off switch. When a Detail+ job is marked complete, every plan on
-- that job with auto-booking on gets its next visit booked automatically:
--
--   target   = the completed appointment's date + the plan rhythm, at the same
--              time of day as that appointment
--   search   = open slots within ±7 days of the target (detail_plus_settings
--              .auto_book_window_days), using the same live capacity engine as
--              the website (get_open_slots_multi)
--   choice   = the slot closest to the target, where one day away counts the
--              same as 3 hours off the usual time — so a client who is always
--              booked at 9 AM stays at 9 AM a day later rather than moving to
--              3 PM on the same day
--   booking  = book_multi_vehicle_job (atomic lock + capacity re-check), source
--              'detail_plus_auto', at the plan's per-visit price
--
-- Two vehicles on the same job with the same rhythm are booked together as one
-- two-vehicle appointment. Nothing is booked if a future Detail+ visit already
-- exists for that client/vehicle. The client gets the normal booking
-- confirmation email (queued for the website's job-reminders worker), and the
-- result is written to the plan so the Team App shows what happened.
-- Completing the job never fails because of auto-booking.
-- Safe to run more than once.
-- ============================================================================

begin;

alter table public.detail_plus_memberships
  add column if not exists auto_book boolean not null default false,
  add column if not exists auto_book_status text,
  add column if not exists auto_book_message text,
  add column if not exists auto_book_at timestamptz,
  add column if not exists auto_book_job_id uuid;

alter table public.detail_plus_settings
  add column if not exists auto_book_window_days int not null default 7;

-- Booking confirmations for auto-booked visits go through the existing customer
-- job email queue (sent by the website's /api/cron/job-reminders worker).
alter table public.customer_job_change_emails drop constraint if exists customer_job_change_emails_event_kind_check;
alter table public.customer_job_change_emails
  add constraint customer_job_change_emails_event_kind_check check (event_kind in ('rescheduled', 'cancelled', 'booked'));
create unique index if not exists customer_job_change_booked_unique
  on public.customer_job_change_emails(job_id, event_kind)
  where event_kind = 'booked' and sent_at is null and discarded_at is null;

-- Weeks between visits for a plan (null = use the free-text frequency).
-- Short label for job names and customer emails. Never the full task list.
create or replace function public.detail_plus_work_label(p_plan text)
returns text language sql immutable set search_path=public as $$
  select case
    when lower(trim(coalesce(p_plan,''))) like 'premium set%' then 'Premium set'
    when lower(trim(coalesce(p_plan,''))) like 'maintenance set%' then 'Maintenance set'
    else 'Membership visit'
  end
$$;

create or replace function public.detail_plus_plan_weeks(m public.detail_plus_memberships)
returns int language sql stable set search_path=public as $$
  select coalesce(m.custom_weeks, (select r.weeks from public.detail_plus_rhythms r where r.id = m.rhythm_id))
$$;

-- Books the next visit for the given plans (1 or 2, same client) after p_job.
-- Returns the new job id, or null. Writes the outcome onto each plan.
create or replace function public.detail_plus_auto_book_plans(p_job_id uuid, p_membership_ids uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
declare
  j public.jobs%rowtype;
  s public.booking_settings%rowtype;
  m public.detail_plus_memberships%rowtype;
  v_tz text;
  v_base_date date;
  v_time time;
  v_weeks int;
  v_target_date date;
  v_target timestamptz;
  v_window int;
  v_lines jsonb := '[]'::jsonb;
  v_crew int;
  v_old_max int;
  v_needed_days int;
  v_slot timestamptz;
  v_new_job uuid;
  v_vehicle_label text;
  v_vehicle_size text;
  v_message text;
  v_tries int := 0;
begin
  select * into j from public.jobs where id = p_job_id;
  if not found or j.client_id is null then return null; end if;
  select * into s from public.booking_settings where id = true;
  v_tz := coalesce(s.timezone, 'America/New_York');
  select coalesce(auto_book_window_days, 7) into v_window from public.detail_plus_settings where id;
  v_window := greatest(1, least(coalesce(v_window, 7), 21));

  v_base_date := (j.scheduled_start at time zone v_tz)::date;
  v_time := (j.scheduled_start at time zone v_tz)::time;

  for m in select * from public.detail_plus_memberships where id = any(p_membership_ids) order by vehicle_id nulls last loop
    v_weeks := public.detail_plus_plan_weeks(m);
    v_target_date := coalesce(
      case when v_weeks is not null then v_base_date + v_weeks * 7 end,
      public.detail_plus_next_due(v_base_date, m.frequency));
    v_vehicle_label := null; v_vehicle_size := null;
    select concat_ws(' ', v.year, v.make, v.model), v.vehicle_size into v_vehicle_label, v_vehicle_size
      from public.vehicles v where v.id = m.vehicle_id;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'vehicle_id', m.vehicle_id,
      'vehicle_label', coalesce(nullif(trim(v_vehicle_label), ''), m.legacy_vehicle_text, j.vehicle, 'Vehicle'),
      'vehicle_size', coalesce(v_vehicle_size, m.vehicle_size),
      'service_name', 'Detail+ · ' || public.detail_plus_work_label(m.plan),
      'price', coalesce(m.service_price, 0),
      'minutes', 75,
      'crew', 2));
  end loop;
  if jsonb_array_length(v_lines) = 0 then return null; end if;

  v_target := (v_target_date + v_time) at time zone v_tz;
  v_crew := 2 + (jsonb_array_length(v_lines) - 1);

  -- Membership visits are booked further out than the public website allows
  -- (e.g. every 6 weeks vs a 30-day booking horizon). Lift the horizon for this
  -- transaction only; it is restored below and never visible to anyone else.
  v_needed_days := (v_target_date + v_window) - (now() at time zone v_tz)::date + 1;
  v_old_max := s.max_days_ahead;
  if v_needed_days > v_old_max then
    update public.booking_settings set max_days_ahead = v_needed_days where id = true;
  end if;

  for v_slot in
    select o.slot_start
    from public.get_open_slots_multi(v_target_date - v_window, v_target_date + v_window, 75, v_crew, 1) o
    where (o.slot_start at time zone v_tz)::date > v_base_date
    order by abs((o.slot_start at time zone v_tz)::date - v_target_date) * 180
           + abs(extract(epoch from ((o.slot_start at time zone v_tz)::time - v_time)) / 60),
             o.slot_start
    limit 5
  loop
    v_tries := v_tries + 1;
    begin
      v_new_job := public.book_multi_vehicle_job(
        j.client_id, coalesce(j.customer_name, 'Client'), coalesce(j.phone, ''), coalesce(j.email, ''),
        j.address, v_slot, v_lines, 'Auto-booked Detail+ visit', 'detail_plus_auto');
      exit;
    exception when others then
      if sqlerrm not like '%slot_unavailable%' then raise; end if;
    end;
  end loop;

  if v_needed_days > v_old_max then
    update public.booking_settings set max_days_ahead = v_old_max where id = true;
  end if;

  if v_new_job is not null then
    v_message := 'Booked ' || to_char(v_slot at time zone v_tz, 'Dy Mon FMDD "at" FMHH12:MI AM');
    if nullif(trim(j.email), '') is not null then
      insert into public.customer_job_change_emails (job_id, event_kind, customer_name, email, address, service_name, vehicle, scheduled_start)
      select nj.id, 'booked', nj.customer_name, nj.email, nj.address, nj.service_name, nj.vehicle, nj.scheduled_start
      from public.jobs nj where nj.id = v_new_job
      on conflict do nothing;
    end if;
    update public.detail_plus_memberships
      set auto_book_status = 'booked', auto_book_message = v_message, auto_book_at = now(), auto_book_job_id = v_new_job
      where id = any(p_membership_ids);
  else
    v_message := 'No opening within ' || v_window || ' days of ' || to_char(v_target_date, 'Mon FMDD') || '. Book this visit by hand.';
    update public.detail_plus_memberships
      set auto_book_status = 'no_opening', auto_book_message = v_message, auto_book_at = now(), auto_book_job_id = null
      where id = any(p_membership_ids);
  end if;
  return v_new_job;
end $$;
revoke all on function public.detail_plus_auto_book_plans(uuid, uuid[]) from public, anon, authenticated;

-- Runs when a job is marked complete.
create or replace function public.detail_plus_auto_book_on_complete()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  r record;
  v_ids uuid[];
  v_weeks int;
  v_done uuid[] := '{}';
  v_pair uuid;
begin
  if new.client_id is null then return new; end if;

  -- Detail+ plans on this job with auto-booking on, one per vehicle line.
  create temporary table if not exists _dp_auto(membership_id uuid primary key, weeks int, has_future boolean) on commit drop;
  delete from _dp_auto;
  insert into _dp_auto(membership_id, weeks, has_future)
  select distinct on (m.id) m.id,
    coalesce(m.custom_weeks, (select rr.weeks from public.detail_plus_rhythms rr where rr.id = m.rhythm_id)),
    exists (
      select 1 from public.jobs f
      where f.client_id = new.client_id and f.id <> new.id
        and coalesce(f.status::text,'') not in ('cancelled','complete')
        and f.scheduled_start > new.scheduled_start
        and (
          (lower(coalesce(f.service_name,'')) like 'detail+%' and (m.vehicle_id is null or f.vehicle_id = m.vehicle_id))
          or exists (select 1 from public.job_vehicles fv where fv.job_id = f.id
                     and lower(coalesce(fv.service_name,'')) like 'detail+%'
                     and (m.vehicle_id is null or fv.vehicle_id = m.vehicle_id))
        ))
  from public.job_vehicles jv
  join lateral (
    select * from public.detail_plus_memberships dm
    where dm.client_id = new.client_id
      and (dm.vehicle_id = jv.vehicle_id or dm.vehicle_id is null)
      and lower(coalesce(dm.status,'')) = 'active'
    order by (dm.vehicle_id is not distinct from jv.vehicle_id) desc, dm.updated_at desc nulls last
    limit 1
  ) m on true
  where jv.job_id = new.id
    and (lower(coalesce(jv.service_name,'')) like 'detail+%' or lower(coalesce(new.service_name,'')) like 'detail+%')
    and m.auto_book;

  update public.detail_plus_memberships dm
    set auto_book_status = 'already_booked', auto_book_message = 'Next visit was already on the schedule.', auto_book_at = now(), auto_book_job_id = null
    from _dp_auto a where a.membership_id = dm.id and a.has_future;
  delete from _dp_auto where has_future;

  -- Same rhythm → one appointment (max two vehicles per appointment).
  for r in select membership_id, weeks from _dp_auto order by weeks nulls last, membership_id loop
    continue when r.membership_id = any(v_done);
    select a.membership_id into v_pair from _dp_auto a
      where a.membership_id <> r.membership_id and not (a.membership_id = any(v_done))
        and a.weeks is not distinct from r.weeks
      order by a.membership_id limit 1;
    v_ids := array_remove(array[r.membership_id, v_pair], null);
    v_done := v_done || v_ids;
    begin
      perform public.detail_plus_auto_book_plans(new.id, v_ids);
    exception when others then
      update public.detail_plus_memberships
        set auto_book_status = 'error', auto_book_message = left('Auto-book failed: ' || sqlerrm, 300), auto_book_at = now(), auto_book_job_id = null
        where id = any(v_ids);
    end;
    v_pair := null;
  end loop;
  return new;
exception when others then
  -- Never block completing a job.
  raise warning 'Detail+ auto-book skipped for job %: %', new.id, sqlerrm;
  return new;
end $$;

drop trigger if exists detail_plus_auto_book on public.jobs;
create trigger detail_plus_auto_book
after update of status on public.jobs
for each row
when (new.status::text = 'complete' and old.status::text is distinct from 'complete')
execute function public.detail_plus_auto_book_on_complete();

-- Team App save: adds the auto_book switch (everything else as v2.1).
create or replace function public.manager_save_detail_plus_plan(p_membership_id uuid, p_plan jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_id uuid := p_membership_id;
  v_client uuid := nullif(p_plan->>'client_id','')::uuid;
  v_vehicle text := nullif(p_plan->>'vehicle_id','');
  v_size text := nullif(p_plan->>'vehicle_size','');
  v_rhythm text := nullif(p_plan->>'rhythm_id','');
  v_weeks int := nullif(p_plan->>'custom_weeks','')::int;
  v_tasks text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p_plan->'task_ids','[]'::jsonb)) x), '{}');
  v_custom_tasks jsonb := coalesce(p_plan->'custom_tasks','[]'::jsonb);
  v_custom numeric := nullif(p_plan->>'custom_price','')::numeric;
  v_status text := coalesce(nullif(trim(p_plan->>'status'),''), 'Active');
  q jsonb; v_price numeric; v_ids text[];
begin
  if auth.uid() is null or not public.is_manager() then raise exception 'Manager access required.'; end if;
  if v_client is null then raise exception 'Choose the client.'; end if;
  if v_size is null and v_vehicle is not null then select vehicle_size into v_size from public.vehicles where id = v_vehicle; end if;
  if public.detail_plus_vehicle_key(v_size) is null then raise exception 'Choose the vehicle type.'; end if;
  if v_weeks is not null and (v_weeks < 1 or v_weeks > 52) then raise exception 'Custom rhythm must be 1 to 52 weeks.'; end if;

  q := public.detail_plus_plan_quote(v_size, v_rhythm, v_weeks, v_tasks, v_custom_tasks);
  if q is null then raise exception 'Pick a rhythm and at least one task.'; end if;
  if v_custom is not null and v_custom <= 0 then raise exception 'Custom price must be more than $0.'; end if;
  v_price := coalesce(v_custom, (q->>'perVisit')::numeric);
  v_ids := array(select jsonb_array_elements_text(q->'taskIds'));

  if v_id is null then
    if exists (select 1 from public.detail_plus_memberships m where m.client_id = v_client and m.vehicle_id is not distinct from v_vehicle) then
      raise exception 'This client and vehicle already have a Detail+ plan. Open it to edit.';
    end if;
    insert into public.detail_plus_memberships (client_id, vehicle_id, status, start_date)
    values (v_client, v_vehicle, v_status, (now() at time zone 'America/New_York')::date)
    returning id into v_id;
  elsif not exists (select 1 from public.detail_plus_memberships where id = v_id) then
    raise exception 'Detail+ plan not found.';
  end if;

  update public.detail_plus_memberships set
    client_id = v_client,
    vehicle_id = v_vehicle,
    vehicle_size = public.detail_plus_vehicle_label(v_size),
    rhythm_id = q->>'rhythmId',
    custom_weeks = nullif(q->>'customWeeks','')::int,
    task_ids = v_ids,
    custom_tasks = q->'customTasks',
    quote_subtotal = (q->>'subtotal')::numeric,
    quote_discount_pct = (q->>'discountPct')::int,
    minimum_applied = (q->>'minimumApplied')::boolean and v_custom is null,
    custom_price = v_custom is not null,
    service_price = v_price,
    frequency = q->>'rhythmLabel',
    plan = coalesce(public.detail_plus_plan_summary(v_ids, q->'customTasks'), 'Custom plan'),
    status = v_status,
    auto_book = case when p_plan ? 'auto_book' then coalesce((p_plan->>'auto_book')::boolean, false) else auto_book end,
    next_detail_date = case when p_plan ? 'next_detail_date' then nullif(p_plan->>'next_detail_date','')::date else next_detail_date end,
    last_detail_date = case when p_plan ? 'last_detail_date' then nullif(p_plan->>'last_detail_date','')::date else last_detail_date end,
    special_requests = case when p_plan ? 'special_requests' then nullif(trim(p_plan->>'special_requests'),'') else special_requests end,
    notes = case when p_plan ? 'notes' then nullif(trim(p_plan->>'notes'),'') else notes end,
    legacy_vehicle_text = coalesce((select concat_ws(' ', v.year, v.make, v.model) from public.vehicles v where v.id = v_vehicle), legacy_vehicle_text),
    plan_updated_at = now(),
    plan_updated_by = auth.uid()
  where id = v_id;

  return jsonb_build_object('id', v_id, 'quote', q, 'perVisit', v_price);
end $$;
revoke all on function public.manager_save_detail_plus_plan(uuid, jsonb) from public, anon;
grant execute on function public.manager_save_detail_plus_plan(uuid, jsonb) to authenticated;

commit;
