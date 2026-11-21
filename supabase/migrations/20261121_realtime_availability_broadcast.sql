-- Realtime availability for the website booking calendar.
--
-- Any change to a table that feeds get_open_slots_multi sends a Realtime
-- broadcast on the public topic "availability" (event "changed"). The website
-- listens and quietly re-fetches open times, so a slot booked in Van HQ, the
-- Team App, or another browser disappears from everyone's calendar within a
-- second.
--
-- The payload only names the table that changed — no customer, job, or staff
-- data leaves the database. Statement-level triggers keep it to one ping per
-- write, and broadcast failures are swallowed so a booking can never fail
-- because of Realtime.

create or replace function public.ed_broadcast_availability_changed()
returns trigger
language plpgsql
security definer
set search_path = public, realtime
as $$
begin
  begin
    perform realtime.send(
      jsonb_build_object('table', tg_table_name, 'at', now()),
      'changed',
      'availability',
      false
    );
  exception when others then
    null;
  end;
  return null;
end;
$$;

revoke execute on function public.ed_broadcast_availability_changed() from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'jobs',
    'job_assignments',
    'job_rigs',
    'job_vehicles',
    'availability_entries',
    'master_availability_overrides',
    'booking_settings',
    'company_settings',
    'rigs',
    'profiles'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists ed_availability_broadcast on public.%I', t);
      execute format(
        'create trigger ed_availability_broadcast
           after insert or update or delete on public.%I
           for each statement execute function public.ed_broadcast_availability_changed()',
        t
      );
    end if;
  end loop;
end;
$$;
