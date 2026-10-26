-- ═══════════════════════════════════════════════════════════════════════════
-- Every Detail — website accounts + live availability + instant booking
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Touches nothing the iOS app already uses except one policy fix (section 0).
-- New objects are all prefixed or clearly named; existing functions are unchanged.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ───────────────────────────────────────────────────────────────────────────
-- 0. SECURITY FIX — Detail+ memberships were readable by ANY signed-in user.
--    Once customers can sign in, that would expose every member's plan/price/notes.
--    Staff (anyone with an active profile) keep read access.
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists "Technicians can view Detail Plus memberships" on public.detail_plus_memberships;
drop policy if exists "Staff can view Detail Plus memberships" on public.detail_plus_memberships;
create policy "Staff can view Detail Plus memberships" on public.detail_plus_memberships
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));


-- ───────────────────────────────────────────────────────────────────────────
-- 1. BOOKING SETTINGS — one row. Managers can edit from the app or SQL editor.
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.booking_settings (
  id                boolean primary key default true check (id),
  timezone          text    not null default 'America/New_York',
  buffer_minutes    int     not null default 30,   -- travel/setup gap kept around every job
  min_notice_hours  int     not null default 24,   -- earliest a customer can book or cancel online
  max_days_ahead    int     not null default 30,   -- furthest out a customer can book
  slot_step_minutes int     not null default 30,   -- start times offered every N minutes
  day_start         time    not null default '07:00',
  day_end           time    not null default '20:00',
  -- How regular_working_hours.weekday is numbered by the app:
  --   'pg'  = 0 Sunday … 6 Saturday
  --   'ios' = 1 Sunday … 7 Saturday
  --   'iso' = 1 Monday … 7 Sunday
  weekday_base      text    not null default 'pg' check (weekday_base in ('pg','ios','iso')),
  updated_at        timestamptz not null default now()
);
insert into public.booking_settings (id) values (true) on conflict (id) do nothing;

alter table public.booking_settings enable row level security;
drop policy if exists "Managers manage booking settings" on public.booking_settings;
create policy "Managers manage booking settings" on public.booking_settings
  for all to authenticated using (public.is_manager()) with check (public.is_manager());
drop policy if exists "Staff view booking settings" on public.booking_settings;
create policy "Staff view booking settings" on public.booking_settings
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

-- Speeds up overlap checks
create index if not exists jobs_schedule_idx on public.jobs (scheduled_start, scheduled_end) where status <> 'cancelled';
create index if not exists job_assignments_staff_idx on public.job_assignments (staff_id);


-- ───────────────────────────────────────────────────────────────────────────
-- 2. AVAILABILITY ENGINE (internal helpers)
-- ───────────────────────────────────────────────────────────────────────────

-- Converts a date to the app's weekday numbering.
create or replace function public.ed_weekday(p_date date)
returns int language sql stable set search_path = public as $$
  select case (select weekday_base from public.booking_settings)
           when 'ios' then extract(dow from p_date)::int + 1
           when 'iso' then extract(isodow from p_date)::int
           else extract(dow from p_date)::int
         end
$$;

-- Is this staff member scheduled to work for the whole window?
-- Order: an "unavailable" exception wins, then an "available" exception, then regular hours.
create or replace function public.ed_staff_working(p_staff uuid, p_start timestamptz, p_end timestamptz)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  tz text := (select timezone from public.booking_settings);
  d  date := (p_start at time zone tz)::date;
  t1 time := (p_start at time zone tz)::time;
  t2 time := (p_end   at time zone tz)::time;
begin
  if (p_end at time zone tz)::date <> d then
    return false; -- jobs don't span midnight
  end if;

  if exists (
    select 1 from public.availability_exceptions e
    where e.staff_id = p_staff and e.exception_date = d and e.exception_type = 'unavailable'
      and (e.all_day or (e.start_time < t2 and e.end_time > t1))
  ) then
    return false;
  end if;

  if exists (
    select 1 from public.availability_exceptions e
    where e.staff_id = p_staff and e.exception_date = d and e.exception_type = 'available'
      and (e.all_day or (e.start_time <= t1 and e.end_time >= t2))
  ) then
    return true;
  end if;

  return exists (
    select 1 from public.regular_working_hours h
    where h.staff_id = p_staff
      and h.weekday = public.ed_weekday(d)
      and h.is_available
      and (h.start_time is null or h.start_time <= t1)
      and (h.end_time   is null or h.end_time   >= t2)
  );
end $$;

-- Returns a free rig for this slot, or NULL if the slot can't be booked.
-- A slot is open when, for the job length plus the buffer on both sides:
--   • enough working technicians are not already assigned to an overlapping job
--     (overlapping jobs that aren't fully staffed still reserve their missing crew), and
--   • at least one active rig is free (overlapping jobs with no rig also use one up).
create or replace function public.ed_slot_rig(
  p_start timestamptz, p_minutes int, p_crew int, p_exclude_job uuid default null
) returns uuid language plpgsql stable security definer set search_path = public as $$
declare
  s        public.booking_settings%rowtype;
  v_end    timestamptz := p_start + make_interval(mins => p_minutes);
  w_start  timestamptz;
  w_end    timestamptz;
  v_free_staff int;
  v_unassigned_crew int;
  v_norig_jobs int;
  v_free_rigs int;
  v_rig uuid;
begin
  select * into s from public.booking_settings;
  w_start := p_start - make_interval(mins => s.buffer_minutes);
  w_end   := v_end   + make_interval(mins => s.buffer_minutes);

  -- Staff who keep a schedule, are working the whole job, and aren't on another job then.
  select count(*) into v_free_staff
  from public.profiles p
  where p.active
    and (exists (select 1 from public.regular_working_hours h where h.staff_id = p.id)
         or exists (select 1 from public.availability_exceptions e where e.staff_id = p.id))
    and public.ed_staff_working(p.id, p_start, v_end)
    and not exists (
      select 1 from public.job_assignments ja
      join public.jobs j on j.id = ja.job_id
      where ja.staff_id = p.id
        and j.status <> 'cancelled'
        and j.id is distinct from p_exclude_job
        and j.scheduled_start < w_end and j.scheduled_end > w_start
    );

  -- Crew still owed to overlapping jobs that aren't fully staffed yet
  select coalesce(sum(greatest(j.crew_required
           - (select count(*) from public.job_assignments ja where ja.job_id = j.id), 0)), 0)
    into v_unassigned_crew
  from public.jobs j
  where j.status <> 'cancelled'
    and j.id is distinct from p_exclude_job
    and j.scheduled_start < w_end and j.scheduled_end > w_start;

  if v_free_staff - v_unassigned_crew < p_crew then
    return null;
  end if;

  select count(*) into v_norig_jobs
  from public.jobs j
  where j.status <> 'cancelled'
    and j.id is distinct from p_exclude_job
    and j.rig_id is null
    and j.scheduled_start < w_end and j.scheduled_end > w_start;

  select count(*) into v_free_rigs
  from public.rigs r
  where r.active
    and not exists (
      select 1 from public.jobs j
      where j.rig_id = r.id and j.status <> 'cancelled'
        and j.id is distinct from p_exclude_job
        and j.scheduled_start < w_end and j.scheduled_end > w_start
    );

  if v_free_rigs - v_norig_jobs < 1 then
    return null;
  end if;

  select r.id into v_rig
  from public.rigs r
  where r.active
    and not exists (
      select 1 from public.jobs j
      where j.rig_id = r.id and j.status <> 'cancelled'
        and j.id is distinct from p_exclude_job
        and j.scheduled_start < w_end and j.scheduled_end > w_start
    )
  order by r.sort_order, r.created_at
  limit 1;

  return v_rig;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. PUBLIC BOOKING API — called by the website's server (service role only).
--    Price, duration and crew come from the server, never from the browser.
-- ───────────────────────────────────────────────────────────────────────────

-- Open start times between two dates for a job of p_minutes needing p_crew technicians.
create or replace function public.get_open_slots(p_from date, p_to date, p_minutes int, p_crew int)
returns table (slot_start timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  s        public.booking_settings%rowtype;
  v_today  date;
  v_last   date;
  v_min_start timestamptz;
  d        date;
  m        int;
  m_end    int;
  st       timestamptz;
begin
  select * into s from public.booking_settings;
  v_today := (now() at time zone s.timezone)::date;
  v_last  := least(p_to, v_today + s.max_days_ahead);
  v_min_start := now() + make_interval(hours => s.min_notice_hours);
  m_end := extract(epoch from s.day_end)::int / 60;

  d := greatest(p_from, v_today);
  while d <= v_last loop
    m := extract(epoch from s.day_start)::int / 60;
    while m + p_minutes <= m_end loop
      st := (d::timestamp + make_interval(mins => m)) at time zone s.timezone;
      if st >= v_min_start and public.ed_slot_rig(st, p_minutes, p_crew) is not null then
        slot_start := st;
        return next;
      end if;
      m := m + s.slot_step_minutes;
    end loop;
    d := d + 1;
  end loop;
end $$;

-- Books a job atomically. Raises 'slot_unavailable' if someone else got there first.
-- p_client_id NULL = guest: a new clients row is created (source 'website').
create or replace function public.book_job(
  p_client_id     uuid,
  p_vehicle_id    text,
  p_vehicle_label text,
  p_vehicle_size  text,
  p_customer_name text,
  p_phone         text,
  p_email         text,
  p_address       text,
  p_service_name  text,
  p_start         timestamptz,
  p_minutes       int,
  p_crew          int,
  p_price         numeric,
  p_notes         text default null,
  p_source        text default 'website'
) returns uuid language plpgsql volatile security definer set search_path = public as $$
declare
  s       public.booking_settings%rowtype;
  v_rig   uuid;
  v_client uuid := p_client_id;
  v_job   uuid;
begin
  -- One booking at a time, so two people can never take the same slot.
  perform pg_advisory_xact_lock(hashtext('every_detail_booking'));
  select * into s from public.booking_settings;

  if p_start < now() + make_interval(hours => s.min_notice_hours)
     or p_start > now() + make_interval(days => s.max_days_ahead + 1) then
    raise exception 'slot_unavailable';
  end if;

  v_rig := public.ed_slot_rig(p_start, p_minutes, p_crew);
  if v_rig is null then
    raise exception 'slot_unavailable';
  end if;

  if v_client is null then
    insert into public.clients (full_name, first_name, last_name, phone, email, address, source)
    values (
      trim(p_customer_name),
      split_part(trim(p_customer_name), ' ', 1),
      nullif(trim(substr(trim(p_customer_name), length(split_part(trim(p_customer_name), ' ', 1)) + 1)), ''),
      p_phone, nullif(lower(trim(p_email)), ''), p_address, p_source
    )
    returning id into v_client;
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
    p_start, p_start + make_interval(mins => p_minutes), p_crew, 'booked', nullif(trim(p_notes), ''),
    p_phone, nullif(lower(trim(p_email)), ''), p_source, v_client, p_vehicle_id, v_rig, p_price
  )
  returning id into v_job;

  -- Keep the client's saved address current
  if p_client_id is not null and nullif(trim(p_address), '') is not null then
    update public.clients set address = p_address, updated_at = now()
    where id = v_client and coalesce(address, '') is distinct from p_address;
  end if;

  return v_job;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 4. CUSTOMER ACCOUNT API — called with the signed-in customer's session.
--    Staff logins are excluded, matching get_my_client_identity().
-- ───────────────────────────────────────────────────────────────────────────

-- Links (or creates) the client record for the signed-in customer. Requires a confirmed email.
create or replace function public.ensure_my_client(p_full_name text default null, p_phone text default null)
returns uuid language plpgsql volatile security definer set search_path = public, auth as $$
declare
  v_email  text;
  v_client uuid;
  v_name   text;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.active) then
    raise exception 'staff_account';
  end if;

  select lower(u.email) into v_email
  from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null;
  if v_email is null then raise exception 'email_not_confirmed'; end if;

  select client_id into v_client from public.client_accounts where user_id = auth.uid();
  if v_client is not null then return v_client; end if;

  -- Existing client with this confirmed email → link it (same rule as get_my_client_identity)
  select c.id into v_client from public.clients c
  where lower(trim(c.email)) = v_email order by c.created_at asc limit 1;

  if v_client is null then
    v_name := coalesce(nullif(trim(p_full_name), ''), split_part(v_email, '@', 1));
    insert into public.clients (full_name, first_name, last_name, phone, email, source)
    values (
      v_name,
      split_part(v_name, ' ', 1),
      nullif(trim(substr(v_name, length(split_part(v_name, ' ', 1)) + 1)), ''),
      nullif(trim(p_phone), ''), v_email, 'website'
    )
    returning id into v_client;
  end if;

  insert into public.client_accounts (user_id, client_id) values (auth.uid(), v_client)
  on conflict do nothing;
  return v_client;
end $$;

create or replace function public.get_my_account()
returns table (client_id uuid, full_name text, phone text, email text, address text)
language sql stable security definer set search_path = public as $$
  select c.id, c.full_name, c.phone, c.email, c.address
  from public.clients c where c.id = public.my_client_id()
$$;

create or replace function public.update_my_account(p_full_name text, p_phone text, p_address text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_client uuid := public.my_client_id(); v_name text := nullif(trim(p_full_name), '');
begin
  if v_client is null then raise exception 'no_client'; end if;
  update public.clients set
    full_name  = coalesce(v_name, full_name),
    first_name = coalesce(split_part(v_name, ' ', 1), first_name),
    last_name  = case when v_name is null then last_name
                      else nullif(trim(substr(v_name, length(split_part(v_name, ' ', 1)) + 1)), '') end,
    phone      = nullif(trim(p_phone), ''),
    address    = nullif(trim(p_address), ''),
    updated_at = now()
  where id = v_client;
end $$;

-- Full vehicle profile for the website garage (get_my_client_vehicles is left as-is for the app).
create or replace function public.get_my_garage()
returns table (id text, year int, make text, model text, color text, vehicle_size text,
               pet_hair text, odor_issues text, problem_areas text, is_primary boolean,
               ceramic_installed boolean, recommended_next text)
language sql stable security definer set search_path = public as $$
  select v.id, v.year, v.make, v.model, v.color, v.vehicle_size,
         v.pet_hair, v.odor_issues, v.problem_areas, v.is_primary,
         v.ceramic_installed, v.recommended_next
  from public.vehicles v
  where v.client_id = public.my_client_id()
  order by v.is_primary desc, v.created_at asc
$$;

-- Create (p_id NULL) or update one of the customer's own vehicles. Staff-only fields are never touched.
create or replace function public.save_my_vehicle(
  p_id text, p_year int, p_make text, p_model text, p_color text, p_vehicle_size text,
  p_pet_hair text default null, p_odor_issues text default null, p_problem_areas text default null,
  p_is_primary boolean default false
) returns text language plpgsql volatile security definer set search_path = public as $$
declare v_client uuid := public.my_client_id(); v_id text := p_id;
begin
  if v_client is null then raise exception 'no_client'; end if;

  if v_id is null then
    v_id := 'web_' || replace(gen_random_uuid()::text, '-', '');
    insert into public.vehicles (id, client_id, year, make, model, color, vehicle_size,
                                 pet_hair, odor_issues, problem_areas, is_primary)
    values (v_id, v_client, p_year, nullif(trim(p_make), ''), nullif(trim(p_model), ''), nullif(trim(p_color), ''),
            p_vehicle_size, nullif(trim(p_pet_hair), ''), nullif(trim(p_odor_issues), ''),
            nullif(trim(p_problem_areas), ''),
            coalesce(p_is_primary, false) or not exists (select 1 from public.vehicles where client_id = v_client));
  else
    update public.vehicles set
      year = p_year, make = nullif(trim(p_make), ''), model = nullif(trim(p_model), ''),
      color = nullif(trim(p_color), ''), vehicle_size = p_vehicle_size,
      pet_hair = nullif(trim(p_pet_hair), ''), odor_issues = nullif(trim(p_odor_issues), ''),
      problem_areas = nullif(trim(p_problem_areas), ''),
      is_primary = coalesce(p_is_primary, is_primary), updated_at = now()
    where id = v_id and client_id = v_client;
    if not found then raise exception 'vehicle_not_owned'; end if;
  end if;

  if coalesce(p_is_primary, false) then
    update public.vehicles set is_primary = false where client_id = v_client and id <> v_id and is_primary;
  end if;
  return v_id;
end $$;

-- Remove a vehicle. Vehicles with job or membership history are kept for the crew's records.
create or replace function public.delete_my_vehicle(p_id text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_client uuid := public.my_client_id();
begin
  if v_client is null then raise exception 'no_client'; end if;
  if not exists (select 1 from public.vehicles where id = p_id and client_id = v_client) then
    raise exception 'vehicle_not_owned';
  end if;
  if exists (select 1 from public.jobs where vehicle_id = p_id)
     or exists (select 1 from public.detail_plus_memberships where vehicle_id = p_id)
     or exists (select 1 from public.client_booking_requests where vehicle_id = p_id) then
    raise exception 'vehicle_has_history';
  end if;
  delete from public.vehicles where id = p_id and client_id = v_client;
end $$;

-- Customer cancels their own upcoming job (outside the notice window).
create or replace function public.cancel_my_job(p_job_id uuid)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  v_client uuid := public.my_client_id();
  v_notice int := (select min_notice_hours from public.booking_settings);
begin
  if v_client is null then raise exception 'no_client'; end if;
  update public.jobs
  set status = 'cancelled',
      internal_notes = concat_ws(E'\n', internal_notes, 'Cancelled by customer online ' || to_char(now(), 'YYYY-MM-DD HH24:MI'))
  where id = p_job_id
    and client_id = v_client
    and status in ('booked', 'assigned')
    and scheduled_start > now() + make_interval(hours => v_notice);
  if not found then raise exception 'cannot_cancel'; end if;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 5. PERMISSIONS
--    Supabase grants EXECUTE on new functions to anon + authenticated by default,
--    so revoke first, then grant exactly who may call what.
-- ───────────────────────────────────────────────────────────────────────────
revoke execute on function public.ed_weekday(date)                                  from public, anon, authenticated;
revoke execute on function public.ed_staff_working(uuid, timestamptz, timestamptz)  from public, anon, authenticated;
revoke execute on function public.ed_slot_rig(timestamptz, int, int, uuid)           from public, anon, authenticated;
revoke execute on function public.get_open_slots(date, date, int, int)               from public, anon, authenticated;
revoke execute on function public.book_job(uuid, text, text, text, text, text, text, text, text, timestamptz, int, int, numeric, text, text)
                                                                                     from public, anon, authenticated;
grant  execute on function public.get_open_slots(date, date, int, int)               to service_role;
grant  execute on function public.book_job(uuid, text, text, text, text, text, text, text, text, timestamptz, int, int, numeric, text, text)
                                                                                     to service_role;
grant  execute on function public.ed_slot_rig(timestamptz, int, int, uuid)           to service_role;

revoke execute on function public.ensure_my_client(text, text)                                        from public, anon;
revoke execute on function public.get_my_account()                                                    from public, anon;
revoke execute on function public.update_my_account(text, text, text)                                 from public, anon;
revoke execute on function public.get_my_garage()                                                     from public, anon;
revoke execute on function public.save_my_vehicle(text, int, text, text, text, text, text, text, text, boolean) from public, anon;
revoke execute on function public.delete_my_vehicle(text)                                             from public, anon;
revoke execute on function public.cancel_my_job(uuid)                                                 from public, anon;
grant  execute on function public.ensure_my_client(text, text)                                        to authenticated;
grant  execute on function public.get_my_account()                                                    to authenticated;
grant  execute on function public.update_my_account(text, text, text)                                 to authenticated;
grant  execute on function public.get_my_garage()                                                     to authenticated;
grant  execute on function public.save_my_vehicle(text, int, text, text, text, text, text, text, text, boolean) to authenticated;
grant  execute on function public.delete_my_vehicle(text)                                             to authenticated;
grant  execute on function public.cancel_my_job(uuid)                                                 to authenticated;

commit;

-- Added 2026-09-28: customer account booking/history reader.
create or replace function public.get_my_client_jobs()
returns table (
  id uuid,
  service_name text,
  vehicle text,
  scheduled_start timestamptz,
  status text,
  address text,
  price numeric
)
language sql stable security definer set search_path = public, auth as $$
  select j.id, j.service_name::text, j.vehicle::text, j.scheduled_start,
         j.status::text, j.address::text, j.price
  from public.jobs j
  where j.client_id = public.get_my_client_identity()
  order by j.scheduled_start desc;
$$;
revoke execute on function public.get_my_client_jobs() from public, anon;
grant execute on function public.get_my_client_jobs() to authenticated;
