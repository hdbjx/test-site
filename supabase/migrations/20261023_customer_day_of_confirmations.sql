-- Every Detail same-day customer confirmation emails
-- Adds a separate idempotent claim/send/finalize workflow for the morning-of email.
-- Safe to re-run.

begin;

alter table public.jobs
  add column if not exists customer_day_of_email_sent_at timestamptz,
  add column if not exists customer_day_of_email_for timestamptz,
  add column if not exists customer_day_of_email_claimed_at timestamptz;

create index if not exists jobs_customer_day_of_email_idx
  on public.jobs (scheduled_start)
  where status in ('booked', 'assigned') and email is not null;

-- Claims same-day jobs only after 6:30 AM in the booking timezone. A job must
-- already have at least one assigned staff member so the email can identify the
-- customer's actual crew. If staffing is added later that morning, the next cron
-- run can claim the job. We stop within 15 minutes of the appointment to avoid a
-- late "confirmation" arriving as the crew is already pulling up.
create or replace function public.claim_customer_day_of_email_confirmations(p_limit int default 25)
returns table (
  id uuid,
  customer_name text,
  email text,
  address text,
  service_name text,
  vehicle text,
  scheduled_start timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_timezone text := coalesce((select timezone from public.booking_settings where id = true), 'America/New_York');
  v_local_now timestamp;
begin
  v_local_now := now() at time zone v_timezone;

  if v_local_now::time < time '06:30' then
    return;
  end if;

  return query
  with candidates as (
    select j.id
    from public.jobs j
    where j.status in ('booked', 'assigned')
      and nullif(trim(j.email), '') is not null
      and (j.scheduled_start at time zone v_timezone)::date = v_local_now::date
      and j.scheduled_start > now() + interval '15 minutes'
      and exists (
        select 1
        from public.job_assignments ja
        join public.profiles p on p.id = ja.staff_id
        where ja.job_id = j.id
          and nullif(trim(p.full_name), '') is not null
      )
      and (
        j.customer_day_of_email_sent_at is null
        or j.customer_day_of_email_for is distinct from j.scheduled_start
      )
      and (
        j.customer_day_of_email_claimed_at is null
        or j.customer_day_of_email_claimed_at < now() - interval '30 minutes'
      )
    order by j.scheduled_start asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 25), 100))
  ), claimed as (
    update public.jobs j
    set customer_day_of_email_claimed_at = now()
    from candidates c
    where j.id = c.id
    returning j.id, j.customer_name, j.email, j.address, j.service_name, j.vehicle, j.scheduled_start
  )
  select c.id, c.customer_name, c.email, c.address, c.service_name, c.vehicle, c.scheduled_start
  from claimed c;
end;
$$;

create or replace function public.finish_customer_day_of_email_confirmation(
  p_job_id uuid,
  p_scheduled_start timestamptz,
  p_sent boolean
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_sent then
    update public.jobs
    set customer_day_of_email_sent_at = now(),
        customer_day_of_email_for = p_scheduled_start,
        customer_day_of_email_claimed_at = null
    where id = p_job_id
      and scheduled_start = p_scheduled_start;
  else
    update public.jobs
    set customer_day_of_email_claimed_at = null
    where id = p_job_id
      and scheduled_start = p_scheduled_start;
  end if;
end;
$$;

revoke execute on function public.claim_customer_day_of_email_confirmations(int) from public, anon, authenticated;
revoke execute on function public.finish_customer_day_of_email_confirmation(uuid, timestamptz, boolean) from public, anon, authenticated;
grant execute on function public.claim_customer_day_of_email_confirmations(int) to service_role;
grant execute on function public.finish_customer_day_of_email_confirmation(uuid, timestamptz, boolean) to service_role;

commit;
