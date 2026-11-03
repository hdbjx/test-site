-- Every Detail: meet at van = appointment − (drive from 223 Coventry Rd + 20 min).
-- Run AFTER 20261102_meet_at_van_default.sql. Safe to re-run.
--
-- • The website looks up the drive (Google, with traffic for that time) and
--   saves it on the job with ed_set_auto_meet(). New website bookings get it at
--   once; /api/cron/meet-times fills in everything else every 15 minutes.
-- • Until a drive time is known, a job uses the old 25-minute default.
-- • A meet time someone sets by hand is never changed (meet_at_auto = false).

begin;

alter table public.jobs
  add column if not exists meet_at_auto boolean not null default true,
  add column if not exists drive_minutes integer,
  add column if not exists drive_from_address text;

-- Existing jobs: anything that isn't the 25-minute default was set by hand.
update public.jobs
set meet_at_auto = (meet_at_time is null or meet_at_time = scheduled_start - interval '25 minutes')
where scheduled_start > now() - interval '1 day'
  and status::text not in ('complete', 'cancelled');

create or replace function public.ed_auto_meet_time(p_start timestamptz, p_drive int)
returns timestamptz language sql immutable as $$
  select case when p_drive is null then p_start - interval '25 minutes'
              else p_start - make_interval(mins => p_drive + 20) end
$$;

create or replace function public.ed_default_meet_at()
returns trigger language plpgsql as $$
declare v_system boolean := coalesce(current_setting('ed.meet_auto', true), '') = 'on';
begin
  if new.scheduled_start is null then return new; end if;

  if tg_op = 'INSERT' then
    -- The Team App sends its own 25-minute default; treat that as automatic too.
    new.meet_at_auto := new.meet_at_time is null or new.meet_at_time = new.scheduled_start - interval '25 minutes';
    if new.meet_at_auto then new.meet_at_time := public.ed_auto_meet_time(new.scheduled_start, new.drive_minutes); end if;
    return new;
  end if;

  -- Someone changed the meet time themselves: leave it alone from now on.
  if not v_system and new.meet_at_time is distinct from old.meet_at_time then
    new.meet_at_auto := false;
    return new;
  end if;

  -- New address: the drive has to be looked up again.
  if new.address is distinct from old.address and not v_system then
    new.drive_minutes := null;
  end if;

  if new.meet_at_auto and (new.scheduled_start is distinct from old.scheduled_start
                           or new.drive_minutes is distinct from old.drive_minutes) then
    new.meet_at_time := public.ed_auto_meet_time(new.scheduled_start, new.drive_minutes);
  end if;
  return new;
end $$;

drop trigger if exists ed_default_meet_at on public.jobs;
create trigger ed_default_meet_at
before insert or update of scheduled_start, meet_at_time, address, drive_minutes on public.jobs
for each row execute function public.ed_default_meet_at();

-- Website (service role) saves a looked-up drive time on a job.
create or replace function public.ed_set_auto_meet(p_job_id uuid, p_drive_minutes int, p_address text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v_meet timestamptz;
begin
  perform set_config('ed.meet_auto', 'on', true);
  update public.jobs
    set drive_minutes = greatest(0, p_drive_minutes),
        drive_from_address = p_address,
        meet_at_time = case when meet_at_auto then public.ed_auto_meet_time(scheduled_start, greatest(0, p_drive_minutes)) else meet_at_time end
    where id = p_job_id
    returning meet_at_time into v_meet;
  perform set_config('ed.meet_auto', 'off', true);
  return v_meet;
end $$;
revoke all on function public.ed_set_auto_meet(uuid, int, text) from public, anon, authenticated;
grant execute on function public.ed_set_auto_meet(uuid, int, text) to service_role;

-- Upcoming jobs still on the default get their real meet time on the next run.
update public.jobs
set meet_at_time = public.ed_auto_meet_time(scheduled_start, drive_minutes)
where meet_at_auto and meet_at_time is null and scheduled_start > now()
  and status::text not in ('complete', 'cancelled');

commit;

-- Every 15 minutes, same secret as the other website crons.
do $$
declare v_jobid bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then
    select jobid into v_jobid from cron.job where jobname = 'every-detail-meet-times' limit 1;
    if v_jobid is not null then perform cron.unschedule(v_jobid); end if;
    perform cron.schedule(
      'every-detail-meet-times',
      '*/15 * * * *',
      $cron$
      select net.http_get(
        url := 'https://www.everydetail.co/api/cron/meet-times',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (
            select decrypted_secret from vault.decrypted_secrets
            where name = 'customer_reminder_cron_secret'
            order by created_at desc limit 1
          )
        ),
        timeout_milliseconds := 60000
      );
      $cron$
    );
  end if;
end $$;
