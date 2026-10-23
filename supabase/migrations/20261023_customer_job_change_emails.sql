-- Every Detail customer lifecycle emails: reschedules + cancellations
-- Queues customer emails from job changes regardless of which app made the edit.
-- Safe to re-run.

begin;

create extension if not exists pgcrypto;

create table if not exists public.customer_job_change_emails (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_kind text not null check (event_kind in ('rescheduled', 'cancelled')),
  customer_name text,
  email text not null,
  address text,
  service_name text,
  vehicle text,
  previous_scheduled_start timestamptz,
  scheduled_start timestamptz,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  discarded_at timestamptz,
  attempt_count integer not null default 0,
  last_error text,
  provider_message_id text
);

alter table public.customer_job_change_emails add column if not exists discarded_at timestamptz;

drop index if exists public.customer_job_change_reschedule_unique;
drop index if exists public.customer_job_change_cancel_unique;

create unique index customer_job_change_reschedule_unique
  on public.customer_job_change_emails(job_id, event_kind, scheduled_start)
  where event_kind = 'rescheduled' and sent_at is null and discarded_at is null;

create unique index customer_job_change_cancel_unique
  on public.customer_job_change_emails(job_id, event_kind)
  where event_kind = 'cancelled' and sent_at is null and discarded_at is null;

create index if not exists customer_job_change_email_queue_idx
  on public.customer_job_change_emails(created_at)
  where sent_at is null and discarded_at is null;

create or replace function public.ed_queue_customer_job_change_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Cancellation wins if a schedule change and cancellation happen in one write.
  if new.status::text = 'cancelled'
     and old.status::text is distinct from 'cancelled'
     and nullif(trim(coalesce(new.email, '')), '') is not null then

    delete from public.customer_job_change_emails q
    where q.job_id = new.id
      and q.sent_at is null
      and q.discarded_at is null
      and q.claimed_at is null;

    insert into public.customer_job_change_emails (
      job_id,
      event_kind,
      customer_name,
      email,
      address,
      service_name,
      vehicle,
      previous_scheduled_start,
      scheduled_start
    ) values (
      new.id,
      'cancelled',
      new.customer_name,
      new.email,
      new.address,
      new.service_name,
      new.vehicle,
      old.scheduled_start,
      new.scheduled_start
    )
    on conflict do nothing;

    return new;
  end if;

  if new.scheduled_start is distinct from old.scheduled_start
     and new.status::text <> 'cancelled'
     and nullif(trim(coalesce(new.email, '')), '') is not null then

    delete from public.customer_job_change_emails q
    where q.job_id = new.id
      and q.event_kind = 'rescheduled'
      and q.sent_at is null
      and q.discarded_at is null
      and q.claimed_at is null;

    insert into public.customer_job_change_emails (
      job_id,
      event_kind,
      customer_name,
      email,
      address,
      service_name,
      vehicle,
      previous_scheduled_start,
      scheduled_start
    ) values (
      new.id,
      'rescheduled',
      new.customer_name,
      new.email,
      new.address,
      new.service_name,
      new.vehicle,
      old.scheduled_start,
      new.scheduled_start
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ed_customer_job_change_email on public.jobs;

create trigger trg_ed_customer_job_change_email
after update of scheduled_start, status on public.jobs
for each row
execute function public.ed_queue_customer_job_change_email();

create or replace function public.claim_customer_job_change_emails(p_limit int default 25)
returns table (
  id uuid,
  job_id uuid,
  event_kind text,
  customer_name text,
  email text,
  address text,
  service_name text,
  vehicle text,
  previous_scheduled_start timestamptz,
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
    select q.id
    from public.customer_job_change_emails q
    where q.sent_at is null
      and q.discarded_at is null
      and (
        q.claimed_at is null
        or q.claimed_at < now() - interval '30 minutes'
      )
    order by q.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 25), 100))
  ), claimed as (
    update public.customer_job_change_emails q
    set claimed_at = now(),
        attempt_count = q.attempt_count + 1,
        last_error = null
    from candidates c
    where q.id = c.id
    returning
      q.id,
      q.job_id,
      q.event_kind,
      q.customer_name,
      q.email,
      q.address,
      q.service_name,
      q.vehicle,
      q.previous_scheduled_start,
      q.scheduled_start
  )
  select * from claimed;
end;
$$;

create or replace function public.finish_customer_job_change_email(
  p_event_id uuid,
  p_sent boolean,
  p_provider_message_id text default null,
  p_error text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_sent then
    update public.customer_job_change_emails q
    set sent_at = now(),
        claimed_at = null,
        provider_message_id = p_provider_message_id,
        last_error = null
    where q.id = p_event_id;
  else
    update public.customer_job_change_emails q
    set claimed_at = null,
        last_error = left(coalesce(p_error, 'Email send failed'), 1000)
    where q.id = p_event_id;
  end if;
end;
$$;

create or replace function public.discard_customer_job_change_email(
  p_event_id uuid,
  p_reason text default 'Stale lifecycle email event'
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update public.customer_job_change_emails q
  set claimed_at = null,
      discarded_at = now(),
      last_error = left(coalesce(p_reason, 'Stale lifecycle email event'), 1000)
  where q.id = p_event_id
    and q.sent_at is null;
end;
$$;

alter table public.customer_job_change_emails enable row level security;
revoke all on table public.customer_job_change_emails from anon, authenticated;
revoke execute on function public.claim_customer_job_change_emails(int) from public, anon, authenticated;
revoke execute on function public.finish_customer_job_change_email(uuid, boolean, text, text) from public, anon, authenticated;
revoke execute on function public.discard_customer_job_change_email(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_customer_job_change_emails(int) to service_role;
grant execute on function public.finish_customer_job_change_email(uuid, boolean, text, text) to service_role;
grant execute on function public.discard_customer_job_change_email(uuid, text) to service_role;

commit;
