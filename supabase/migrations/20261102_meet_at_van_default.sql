-- Every Detail: every job gets a "meet at van" time, 25 minutes before the
-- customer appointment, unless someone set one. Covers website bookings,
-- Detail+ auto-booking and Van HQ, the same way the Team App does it.
-- When the appointment moves and the meet time was still the default, the meet
-- time moves with it. A meet time someone set by hand is never touched.
-- Safe to re-run.

begin;

create or replace function public.ed_default_meet_at()
returns trigger language plpgsql as $$
begin
  if new.scheduled_start is null then return new; end if;
  if tg_op = 'INSERT' then
    if new.meet_at_time is null then
      new.meet_at_time := new.scheduled_start - interval '25 minutes';
    end if;
  elsif new.scheduled_start is distinct from old.scheduled_start
        and new.meet_at_time is not distinct from old.meet_at_time
        and (old.meet_at_time is null or old.meet_at_time = old.scheduled_start - interval '25 minutes') then
    new.meet_at_time := new.scheduled_start - interval '25 minutes';
  end if;
  return new;
end $$;

drop trigger if exists ed_default_meet_at on public.jobs;
create trigger ed_default_meet_at
before insert or update of scheduled_start on public.jobs
for each row execute function public.ed_default_meet_at();

-- Upcoming jobs that came in without one.
update public.jobs
set meet_at_time = scheduled_start - interval '25 minutes'
where meet_at_time is null
  and scheduled_start > now()
  and status::text not in ('complete', 'cancelled');

commit;
