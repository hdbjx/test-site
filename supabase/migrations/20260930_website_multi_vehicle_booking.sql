-- Every Detail website multi-vehicle booking v1
-- Requires the app's job_vehicles and job_rigs migrations to already be installed.
-- Safe to re-run.

begin;

do $$
begin
  if to_regclass('public.job_vehicles') is null then
    raise exception 'public.job_vehicles is required. Run the multi-vehicle app migration first.';
  end if;
  if to_regclass('public.job_rigs') is null then
    raise exception 'public.job_rigs is required. Run the multi-rig app migration first.';
  end if;
end $$;

-- Return enough simultaneously available rigs for a website appointment.
-- This is the multi-rig counterpart to ed_slot_rig and uses the same staff,
-- availability, buffer, lead-tech, solo-tech and tow-qualified rules.
create or replace function public.ed_slot_rigs_v4(
  p_start timestamptz,
  p_minutes int,
  p_crew int,
  p_rig_count int,
  p_exclude_job uuid default null
) returns uuid[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s public.booking_settings%rowtype;
  v_end timestamptz := p_start + make_interval(mins => p_minutes);
  w_start timestamptz;
  w_end timestamptz;
  v_free_staff int := 0;
  v_free_leads int := 0;
  v_free_solo int := 0;
  v_free_towers int := 0;
  v_unassigned_crew int := 0;
  v_norig_jobs int := 0;
  v_rigs uuid[] := array[]::uuid[];
  v_tow_rigs int := 0;
begin
  if p_rig_count < 1 or p_crew < 1 or p_minutes < 1 then return null; end if;

  select * into s from public.booking_settings where id = true;
  w_start := p_start - make_interval(mins => s.buffer_minutes);
  w_end := v_end + make_interval(mins => s.buffer_minutes);

  with free_staff as (
    select p.*
    from public.profiles p
    where p.active
      and p.counts_for_capacity
      and public.ed_staff_available_v3(p.id, p_start, v_end)
      and not exists (
        select 1
        from public.job_assignments ja
        join public.jobs j on j.id = ja.job_id
        where ja.staff_id = p.id
          and j.status <> 'cancelled'
          and j.id is distinct from p_exclude_job
          and j.scheduled_start < w_end
          and j.scheduled_end > w_start
      )
  )
  select count(*),
         count(*) filter (where can_lead_jobs),
         count(*) filter (where can_work_solo and can_lead_jobs),
         count(*) filter (where can_tow_trailer)
  into v_free_staff, v_free_leads, v_free_solo, v_free_towers
  from free_staff;

  select coalesce(sum(greatest(j.crew_required - (
           select count(*) from public.job_assignments ja where ja.job_id = j.id
         ), 0)), 0)
  into v_unassigned_crew
  from public.jobs j
  where j.status <> 'cancelled'
    and j.id is distinct from p_exclude_job
    and j.scheduled_start < w_end
    and j.scheduled_end > w_start;

  if v_free_staff - v_unassigned_crew < p_crew then return null; end if;
  if p_crew <= 1 and v_free_solo < 1 then return null; end if;
  if p_crew > 1 and v_free_leads < 1 then return null; end if;

  -- Legacy/unassigned jobs without any rig reservation still consume one rig.
  select count(*) into v_norig_jobs
  from public.jobs j
  where j.status <> 'cancelled'
    and j.id is distinct from p_exclude_job
    and j.rig_id is null
    and not exists (select 1 from public.job_rigs jr where jr.job_id = j.id)
    and j.scheduled_start < w_end
    and j.scheduled_end > w_start;

  with free_rigs as (
    select r.id, r.requires_tow_qualified, r.sort_order, r.created_at
    from public.rigs r
    where r.active
      and not exists (
        select 1
        from public.job_rigs jr
        join public.jobs j on j.id = jr.job_id
        where jr.rig_id = r.id
          and j.status <> 'cancelled'
          and j.id is distinct from p_exclude_job
          and j.scheduled_start < w_end
          and j.scheduled_end > w_start
      )
      and not exists (
        -- Compatibility for a legacy job whose primary rig has not been mirrored.
        select 1 from public.jobs j
        where j.rig_id = r.id
          and j.status <> 'cancelled'
          and j.id is distinct from p_exclude_job
          and j.scheduled_start < w_end
          and j.scheduled_end > w_start
          and not exists (select 1 from public.job_rigs jr where jr.job_id = j.id and jr.rig_id = r.id)
      )
  ), selected as (
    select * from free_rigs
    order by requires_tow_qualified asc, sort_order, created_at
    offset v_norig_jobs
    limit p_rig_count
  )
  select coalesce(array_agg(id order by requires_tow_qualified asc, sort_order, created_at), array[]::uuid[]),
         count(*) filter (where requires_tow_qualified)
  into v_rigs, v_tow_rigs
  from selected;

  if coalesce(array_length(v_rigs, 1), 0) < p_rig_count then return null; end if;
  if v_tow_rigs > v_free_towers then return null; end if;

  return v_rigs;
end;
$$;

create or replace function public.get_open_slots_multi(
  p_from date,
  p_to date,
  p_minutes int,
  p_crew int,
  p_rigs int
) returns table (slot_start timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s public.booking_settings%rowtype;
  v_today date;
  v_last date;
  v_min_start timestamptz;
  d date;
  m int;
  m_end int;
  st timestamptz;
  en timestamptz;
  v_override text;
begin
  select * into s from public.booking_settings where id = true;
  v_today := (now() at time zone s.timezone)::date;
  v_last := least(p_to, v_today + s.max_days_ahead);
  v_min_start := now() + make_interval(hours => s.min_notice_hours);
  m_end := 24 * 60;

  d := greatest(p_from, v_today);
  while d <= v_last loop
    m := 0;
    while m + p_minutes <= m_end loop
      st := (d::timestamp + make_interval(mins => m)) at time zone s.timezone;
      en := st + make_interval(mins => p_minutes);

      if st >= v_min_start and public.ed_planning_window_key(st, en) is not null then
        v_override := public.ed_master_override_status(st, en);
        if v_override = 'open'
           or (v_override is null and public.ed_slot_rigs_v4(st, p_minutes, p_crew, p_rigs) is not null) then
          slot_start := st;
          return next;
        end if;
      end if;

      m := m + s.slot_step_minutes;
    end loop;
    d := d + 1;
  end loop;
end;
$$;

-- Atomic website booking for one or two vehicle lines. The API supplies pricing,
-- duration and crew values from the server-side catalog, never from browser totals.
create or replace function public.book_multi_vehicle_job(
  p_client_id uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_start timestamptz,
  p_lines jsonb,
  p_notes text default null,
  p_source text default 'website'
) returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  s public.booking_settings%rowtype;
  v_count int;
  v_minutes int;
  v_crew int;
  v_price numeric;
  v_end timestamptz;
  v_override text;
  v_rigs uuid[];
  v_job uuid;
  v_primary jsonb;
  v_line jsonb;
  v_index int := 0;
  v_vehicle_id text;
  v_vehicle_label text;
  v_vehicle_size text;
  v_service_name text;
  v_line_price numeric;
begin
  perform pg_advisory_xact_lock(hashtext('every_detail_booking'));

  if p_client_id is null then raise exception 'client_required'; end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then raise exception 'invalid_vehicle_lines'; end if;

  v_count := jsonb_array_length(p_lines);
  if v_count < 1 or v_count > 2 then raise exception 'invalid_vehicle_count'; end if;

  select max((x->>'minutes')::int),
         max((x->>'crew')::int) + greatest(v_count - 1, 0),
         sum((x->>'price')::numeric)
  into v_minutes, v_crew, v_price
  from jsonb_array_elements(p_lines) x;

  if coalesce(v_minutes, 0) < 1 or coalesce(v_crew, 0) < 1 or v_price is null then
    raise exception 'invalid_vehicle_lines';
  end if;

  v_end := p_start + make_interval(mins => v_minutes);
  select * into s from public.booking_settings where id = true;

  if p_start < now() + make_interval(hours => s.min_notice_hours)
     or p_start > now() + make_interval(days => s.max_days_ahead + 1)
     or public.ed_planning_window_key(p_start, v_end) is null then
    raise exception 'slot_unavailable';
  end if;

  v_override := public.ed_master_override_status(p_start, v_end);
  if v_override = 'closed' then raise exception 'slot_unavailable'; end if;

  -- Website bookings reserve one rig by default. Managers can add a second rig later.
  v_rigs := public.ed_slot_rigs_v4(p_start, v_minutes, v_crew, 1);
  if v_override is distinct from 'open' and v_rigs is null then
    raise exception 'slot_unavailable';
  end if;

  -- Every saved vehicle in the request must belong to the canonical client.
  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    v_vehicle_id := nullif(trim(v_line->>'vehicle_id'), '');
    if v_vehicle_id is not null and not exists (
      select 1 from public.vehicles v where v.id = v_vehicle_id and v.client_id = p_client_id
    ) then
      raise exception 'vehicle_not_owned';
    end if;
  end loop;

  v_primary := p_lines->0;

  insert into public.jobs (
    customer_name, vehicle, vehicle_size, service_name, address,
    scheduled_start, scheduled_end, crew_required, status, notes,
    phone, email, source, client_id, vehicle_id, rig_id, price
  ) values (
    trim(p_customer_name),
    case when v_count = 1 then coalesce(nullif(trim(v_primary->>'vehicle_label'), ''), 'Vehicle') else v_count::text || ' vehicles' end,
    nullif(trim(v_primary->>'vehicle_size'), ''),
    case when v_count = 1 then coalesce(nullif(trim(v_primary->>'service_name'), ''), 'Detail') else v_count::text || '-vehicle appointment' end,
    p_address,
    p_start,
    v_end,
    v_crew,
    'booked',
    case
      when v_override = 'open' and v_rigs is null then concat_ws(E'\n', nullif(trim(p_notes), ''), '[MASTER AVAILABILITY FORCE OPEN: capacity/rig needs manager review]')
      else nullif(trim(p_notes), '')
    end,
    p_phone,
    nullif(lower(trim(p_email)), ''),
    p_source,
    p_client_id,
    nullif(trim(v_primary->>'vehicle_id'), ''),
    case when v_rigs is null then null else v_rigs[1] end,
    v_price
  ) returning id into v_job;

  -- Replace the compatibility row created by the jobs trigger with the exact lines.
  delete from public.job_vehicles where job_id = v_job;

  v_index := 0;
  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    v_vehicle_id := nullif(trim(v_line->>'vehicle_id'), '');
    v_vehicle_label := coalesce(nullif(trim(v_line->>'vehicle_label'), ''), 'Vehicle');
    v_vehicle_size := nullif(trim(v_line->>'vehicle_size'), '');
    v_service_name := coalesce(nullif(trim(v_line->>'service_name'), ''), 'Detail');
    v_line_price := (v_line->>'price')::numeric;

    insert into public.job_vehicles (
      job_id, vehicle_id, vehicle_label, vehicle_size, service_name, price, sort_order
    ) values (
      v_job, v_vehicle_id, v_vehicle_label, v_vehicle_size, v_service_name, v_line_price, v_index
    );
    v_index := v_index + 1;
  end loop;

  if v_rigs is not null then
    insert into public.job_rigs(job_id, rig_id)
    select v_job, unnest(v_rigs)
    on conflict (job_id, rig_id) do nothing;
  end if;

  update public.clients
  set address = p_address, updated_at = now()
  where id = p_client_id
    and nullif(trim(p_address), '') is not null
    and coalesce(address, '') is distinct from p_address;

  return v_job;
end;
$$;

revoke execute on function public.ed_slot_rigs_v4(timestamptz,int,int,int,uuid) from public, anon, authenticated;
revoke execute on function public.get_open_slots_multi(date,date,int,int,int) from public, anon, authenticated;
revoke execute on function public.book_multi_vehicle_job(uuid,text,text,text,text,timestamptz,jsonb,text,text) from public, anon, authenticated;

grant execute on function public.ed_slot_rigs_v4(timestamptz,int,int,int,uuid) to service_role;
grant execute on function public.get_open_slots_multi(date,date,int,int,int) to service_role;
grant execute on function public.book_multi_vehicle_job(uuid,text,text,text,text,timestamptz,jsonb,text,text) to service_role;

-- Do not let a phone-only website match replace a trusted existing client email.
-- Existing email is only filled when blank. This closes the account-linking risk
-- from changing the email on a phone-matched contact.
create or replace function public.upsert_website_contact(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_address text default null,
  p_source text default 'website'
) returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(p_full_name), '');
  v_phone text := nullif(trim(p_phone), '');
  v_phone_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_phone_key text;
  v_email text := nullif(lower(trim(p_email)), '');
  v_address text := nullif(trim(p_address), '');
  v_source text := coalesce(nullif(trim(p_source), ''), 'website');
  v_client uuid;
  v_first text;
  v_last text;
begin
  if v_name is null or length(v_phone_digits) < 10 then raise exception 'contact_identity_required'; end if;

  v_phone_key := right(v_phone_digits, 10);
  v_first := split_part(v_name, ' ', 1);
  v_last := nullif(trim(substr(v_name, length(v_first) + 1)), '');

  select c.id into v_client
  from public.clients c
  where right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 10) = v_phone_key
  order by c.updated_at desc nulls last, c.id
  limit 1
  for update;

  if v_client is null and v_email is not null then
    select c.id into v_client
    from public.clients c
    where lower(trim(coalesce(c.email, ''))) = v_email
    order by c.updated_at desc nulls last, c.id
    limit 1
    for update;
  end if;

  if v_client is null then
    insert into public.clients (full_name, first_name, last_name, phone, email, address, source)
    values (v_name, v_first, v_last, v_phone, v_email, v_address, v_source)
    returning id into v_client;
  else
    update public.clients
    set full_name = v_name,
        first_name = v_first,
        last_name = v_last,
        phone = v_phone,
        email = case when nullif(trim(coalesce(email, '')), '') is null then v_email else email end,
        address = coalesce(v_address, address),
        source = coalesce(nullif(source, ''), v_source),
        updated_at = now()
    where id = v_client;
  end if;

  return v_client;
end;
$$;

revoke all on function public.upsert_website_contact(text,text,text,text,text) from public;
grant execute on function public.upsert_website_contact(text,text,text,text,text) to service_role;

commit;

notify pgrst, 'reload schema';
