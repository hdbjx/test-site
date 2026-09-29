-- Every Detail unified sellable-capacity engine v3
-- Makes website availability use the same operational inputs as Master Availability.
-- Adds trailer-towing capability. Safe to re-run.

begin;

alter table public.profiles
  add column if not exists can_tow_trailer boolean not null default false;

alter table public.rigs
  add column if not exists requires_tow_qualified boolean not null default false;

-- Current operating rule: only Wiley and Grady may tow the trailer.
update public.profiles
set can_tow_trailer = (split_part(lower(trim(full_name)), ' ', 1) in ('wiley', 'grady'))
where active = true;

-- Trailer rigs require a tow-qualified crew member. Other rigs do not.
update public.rigs
set requires_tow_qualified = (lower(name) like '%trailer%');

-- Is an availability entry active on a given local date?
create or replace function public.ed_availability_entry_applies(
  p_start_date date,
  p_end_date date,
  p_repeat_type text,
  p_repeat_until date,
  p_date date
) returns boolean
language sql immutable set search_path = public as $$
  select
    p_date >= p_start_date
    and (p_repeat_until is null or p_date <= p_repeat_until)
    and (
      (coalesce(p_repeat_type, 'none') = 'none' and p_date <= p_end_date)
      or (p_repeat_type = 'weekly' and mod((p_date - p_start_date), 7) = 0)
      or (p_repeat_type = 'biweekly' and mod((p_date - p_start_date), 14) = 0)
    )
$$;

-- availability_entries is exception-style: unavailable blocks capacity; preferred is informational.
create or replace function public.ed_staff_available_v3(
  p_staff uuid,
  p_start timestamptz,
  p_end timestamptz
) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  tz text := (select timezone from public.booking_settings where id = true);
  d date := (p_start at time zone tz)::date;
  t1 time := (p_start at time zone tz)::time;
  t2 time := (p_end at time zone tz)::time;
begin
  if (p_end at time zone tz)::date <> d then return false; end if;

  return not exists (
    select 1
    from public.availability_entries e
    where e.staff_id = p_staff
      and e.status = 'unavailable'
      and public.ed_availability_entry_applies(
        e.start_date, e.end_date, e.repeat_type, e.repeat_until, d
      )
      and (
        e.all_day
        or (e.start_time is not null and e.end_time is not null and e.start_time < t2 and e.end_time > t1)
      )
  );
end $$;

-- Standard Master Availability selling windows.
create or replace function public.ed_planning_window_key(
  p_start timestamptz,
  p_end timestamptz
) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  tz text := (select timezone from public.booking_settings where id = true);
  d date := (p_start at time zone tz)::date;
  t1 time := (p_start at time zone tz)::time;
  t2 time := (p_end at time zone tz)::time;
  dow int := extract(dow from d)::int;
begin
  if (p_end at time zone tz)::date <> d then return null; end if;

  if dow in (0, 6) then
    if t1 >= time '09:00' and t2 <= time '13:00' then return 'morning'; end if;
    if t1 >= time '13:00' and t2 <= time '17:00' then return 'afternoon'; end if;
    return null;
  end if;

  if t1 >= time '16:00' and t2 <= time '20:00' then return 'after-school'; end if;
  return null;
end $$;

-- Window override wins over day override. NULL means automatic mode.
create or replace function public.ed_master_override_status(
  p_start timestamptz,
  p_end timestamptz
) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  tz text := (select timezone from public.booking_settings where id = true);
  d date := (p_start at time zone tz)::date;
  k text := public.ed_planning_window_key(p_start, p_end);
  v text;
begin
  if k is null then return 'closed'; end if;

  select o.status into v
  from public.master_availability_overrides o
  where o.date = d and o.window_key = k
  limit 1;

  if v is not null then return v; end if;

  select o.status into v
  from public.master_availability_overrides o
  where o.date = d and o.window_key = 'day'
  limit 1;

  return v;
end $$;

-- Choose a usable rig for an automatic booking. Non-tow rigs are preferred.
-- If the only free rig is the trailer, at least one free capacity crew member must be tow-qualified.
create or replace function public.ed_slot_rig(
  p_start timestamptz, p_minutes int, p_crew int, p_exclude_job uuid default null
) returns uuid
language plpgsql stable security definer set search_path = public as $$
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
  v_rig uuid;
begin
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

  -- Jobs not fully assigned still reserve their missing crew.
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

  -- Jobs with no rig assigned still reserve one rig.
  select count(*) into v_norig_jobs
  from public.jobs j
  where j.status <> 'cancelled'
    and j.id is distinct from p_exclude_job
    and j.rig_id is null
    and j.scheduled_start < w_end
    and j.scheduled_end > w_start;

  -- Prefer a free van/non-tow rig. Offset accounts for unassigned-rig jobs.
  select r.id into v_rig
  from public.rigs r
  where r.active
    and not r.requires_tow_qualified
    and not exists (
      select 1 from public.jobs j
      where j.rig_id = r.id
        and j.status <> 'cancelled'
        and j.id is distinct from p_exclude_job
        and j.scheduled_start < w_end
        and j.scheduled_end > w_start
    )
  order by r.sort_order, r.created_at
  offset v_norig_jobs
  limit 1;

  if v_rig is not null then return v_rig; end if;

  -- If a reserved no-rig job consumed the non-tow rig, reduce the remaining reservation count.
  v_norig_jobs := greatest(v_norig_jobs - (
    select count(*) from public.rigs r
    where r.active and not r.requires_tow_qualified
      and not exists (
        select 1 from public.jobs j
        where j.rig_id = r.id and j.status <> 'cancelled'
          and j.id is distinct from p_exclude_job
          and j.scheduled_start < w_end and j.scheduled_end > w_start
      )
  ), 0);

  if v_free_towers < 1 then return null; end if;

  select r.id into v_rig
  from public.rigs r
  where r.active
    and r.requires_tow_qualified
    and not exists (
      select 1 from public.jobs j
      where j.rig_id = r.id
        and j.status <> 'cancelled'
        and j.id is distinct from p_exclude_job
        and j.scheduled_start < w_end
        and j.scheduled_end > w_start
    )
  order by r.sort_order, r.created_at
  offset v_norig_jobs
  limit 1;

  return v_rig;
end $$;

-- Website slot list. Manager Close always closes. Manager Force Open bypasses automatic capacity.
create or replace function public.get_open_slots(
  p_from date, p_to date, p_minutes int, p_crew int
) returns table (slot_start timestamptz)
language plpgsql stable security definer set search_path = public as $$
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
        if v_override = 'open' or (v_override is null and public.ed_slot_rig(st, p_minutes, p_crew) is not null) then
          slot_start := st;
          return next;
        end if;
      end if;

      m := m + s.slot_step_minutes;
    end loop;
    d := d + 1;
  end loop;
end $$;

-- Atomic website booking. Re-checks the same shared capacity immediately before insert.
create or replace function public.book_job(
  p_client_id uuid,
  p_vehicle_id text,
  p_vehicle_label text,
  p_vehicle_size text,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_service_name text,
  p_start timestamptz,
  p_minutes int,
  p_crew int,
  p_price numeric,
  p_notes text default null,
  p_source text default 'website'
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  s public.booking_settings%rowtype;
  v_rig uuid;
  v_client uuid := p_client_id;
  v_job uuid;
  v_end timestamptz := p_start + make_interval(mins => p_minutes);
  v_override text;
begin
  perform pg_advisory_xact_lock(hashtext('every_detail_booking'));
  select * into s from public.booking_settings where id = true;

  if p_start < now() + make_interval(hours => s.min_notice_hours)
     or p_start > now() + make_interval(days => s.max_days_ahead + 1)
     or public.ed_planning_window_key(p_start, v_end) is null then
    raise exception 'slot_unavailable';
  end if;

  v_override := public.ed_master_override_status(p_start, v_end);
  if v_override = 'closed' then raise exception 'slot_unavailable'; end if;

  v_rig := public.ed_slot_rig(p_start, p_minutes, p_crew);
  if v_override is distinct from 'open' and v_rig is null then
    raise exception 'slot_unavailable';
  end if;

  if v_client is null then
    insert into public.clients (full_name, first_name, last_name, phone, email, address, source)
    values (
      trim(p_customer_name),
      split_part(trim(p_customer_name), ' ', 1),
      nullif(trim(substr(trim(p_customer_name), length(split_part(trim(p_customer_name), ' ', 1)) + 1)), ''),
      p_phone, nullif(lower(trim(p_email)), ''), p_address, p_source
    ) returning id into v_client;
  elsif p_vehicle_id is not null
     and not exists (select 1 from public.vehicles v where v.id = p_vehicle_id and v.client_id = v_client) then
    raise exception 'vehicle_not_owned';
  end if;

  insert into public.jobs (
    customer_name, vehicle, vehicle_size, service_name, address,
    scheduled_start, scheduled_end, crew_required, status, notes,
    phone, email, source, client_id, vehicle_id, rig_id, price
  ) values (
    trim(p_customer_name), p_vehicle_label, p_vehicle_size, p_service_name, p_address,
    p_start, v_end, p_crew, 'booked',
    case
      when v_override = 'open' and v_rig is null then concat_ws(E'\n', nullif(trim(p_notes), ''), '[MASTER AVAILABILITY FORCE OPEN: capacity/rig needs manager review]')
      else nullif(trim(p_notes), '')
    end,
    p_phone, nullif(lower(trim(p_email)), ''), p_source, v_client, p_vehicle_id, v_rig, p_price
  ) returning id into v_job;

  if p_client_id is not null and nullif(trim(p_address), '') is not null then
    update public.clients set address = p_address, updated_at = now()
    where id = v_client and coalesce(address, '') is distinct from p_address;
  end if;

  return v_job;
end $$;

-- Keep these server-only. The website calls them using the service-role client.
revoke execute on function public.ed_availability_entry_applies(date,date,text,date,date) from public, anon, authenticated;
revoke execute on function public.ed_staff_available_v3(uuid,timestamptz,timestamptz) from public, anon, authenticated;
revoke execute on function public.ed_planning_window_key(timestamptz,timestamptz) from public, anon, authenticated;
revoke execute on function public.ed_master_override_status(timestamptz,timestamptz) from public, anon, authenticated;
revoke execute on function public.ed_slot_rig(timestamptz,int,int,uuid) from public, anon, authenticated;
revoke execute on function public.get_open_slots(date,date,int,int) from public, anon, authenticated;
revoke execute on function public.book_job(uuid,text,text,text,text,text,text,text,text,timestamptz,int,int,numeric,text,text) from public, anon, authenticated;

grant execute on function public.get_open_slots(date,date,int,int) to service_role;
grant execute on function public.book_job(uuid,text,text,text,text,text,text,text,text,timestamptz,int,int,numeric,text,text) to service_role;
grant execute on function public.ed_slot_rig(timestamptz,int,int,uuid) to service_role;

commit;

-- Verification: these should show Wiley + Grady as tow-qualified and the trailer as tow-required.
select full_name, counts_for_capacity, can_lead_jobs, can_work_solo, can_tow_trailer
from public.profiles where active = true order by full_name;
select id, name, active, requires_tow_qualified from public.rigs order by sort_order, name;
