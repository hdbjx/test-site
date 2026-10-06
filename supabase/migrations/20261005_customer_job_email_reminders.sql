-- Every Detail customer appointment email reminders
-- Adds an idempotent claim/send/finalize workflow for the website reminder worker.
-- Safe to re-run.

begin;

alter table public.jobs
  add column if not exists customer_reminder_email_sent_at timestamptz,
  add column if not exists customer_reminder_email_for timestamptz,
  add column if not exists customer_reminder_email_claimed_at timestamptz;

create index if not exists jobs_customer_email_reminder_idx
  on public.jobs (scheduled_start)
  where status in ('booked', 'assigned') and email is not null;

-- Atomically claims jobs entering the reminder window. A stale claim is released
-- after 30 minutes. If a job is rescheduled after a reminder was sent, the new
-- scheduled_start is eligible for its own reminder.
create or replace function public.claim_customer_email_reminders(p_limit int default 25)
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
begin
  return query
  with candidates as (
    select j.id
    from public.jobs j
    where j.status in ('booked', 'assigned')
      and nullif(trim(j.email), '') is not null
      -- Send approximately 24 hours ahead. The wider lower bound lets the
      -- system recover from a temporarily missed cron run without sending a
      -- reminder on the morning of the appointment.
      and j.scheduled_start > now() + interval '20 hours'
      and j.scheduled_start <= now() + interval '24 hours 15 minutes'
      and (
        j.customer_reminder_email_sent_at is null
        or j.customer_reminder_email_for is distinct from j.scheduled_start
      )
      and (
        j.customer_reminder_email_claimed_at is null
        or j.customer_reminder_email_claimed_at < now() - interval '30 minutes'
      )
    order by j.scheduled_start asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 25), 100))
  ), claimed as (
    update public.jobs j
    set customer_reminder_email_claimed_at = now()
    from candidates c
    where j.id = c.id
    returning j.id, j.customer_name, j.email, j.address, j.service_name, j.vehicle, j.scheduled_start
  )
  select c.id, c.customer_name, c.email, c.address, c.service_name, c.vehicle, c.scheduled_start
  from claimed c;
end;
$$;

create or replace function public.finish_customer_email_reminder(
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
    set customer_reminder_email_sent_at = now(),
        customer_reminder_email_for = p_scheduled_start,
        customer_reminder_email_claimed_at = null
    where id = p_job_id
      and scheduled_start = p_scheduled_start;
  else
    update public.jobs
    set customer_reminder_email_claimed_at = null
    where id = p_job_id
      and scheduled_start = p_scheduled_start;
  end if;
end;
$$;

-- These functions are backend-only. The website service-role client can call
-- them, while browser users cannot.
revoke execute on function public.claim_customer_email_reminders(int) from public, anon, authenticated;
revoke execute on function public.finish_customer_email_reminder(uuid, timestamptz, boolean) from public, anon, authenticated;
grant execute on function public.claim_customer_email_reminders(int) to service_role;
grant execute on function public.finish_customer_email_reminder(uuid, timestamptz, boolean) to service_role;

commit;
