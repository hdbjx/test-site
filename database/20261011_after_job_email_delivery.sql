-- Every Detail after-job email delivery worker
-- Run AFTER the Van HQ AFTER-JOB-FOLLOWUP.sql migration.
-- This migration intentionally does NOT infer prior Google reviews from checkout activity.
-- Until the review-tracking sheet is synced, new follow-ups default include_review=true
-- and Van HQ can override it before send.

alter table public.after_job_followups
  add column if not exists claimed_at timestamptz,
  add column if not exists provider_message_id text;

-- IMPORTANT: the earlier Van HQ migration backfilled historical completed jobs.
-- The sender did not exist yet, so prevent those historical rows from suddenly emailing.
update public.after_job_followups
set status = 'cancelled',
    updated_at = now(),
    last_error = 'Cancelled at email-worker deployment: historical pre-worker row.'
where status in ('scheduled','queued','failed','sending')
  and sent_at is null;

-- Replace the completion trigger with clean defaults. Payment/review/signature UI
-- activity is not consulted. Review stays ON until the sheet is synced to Supabase.
create or replace function public.ed_create_after_job_followup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_detail_plus boolean := false;
begin
  if new.status = 'complete'
     and (tg_op = 'INSERT' or old.status is distinct from 'complete' or old.completed_at is distinct from new.completed_at) then
    v_is_detail_plus := coalesce(new.service_name, '') ~* 'detail\s*\+|detail\s+plus';

    insert into public.after_job_followups (
      job_id, status, include_receipt, include_review, include_detail_plus, scheduled_for
    ) values (
      new.id,
      'scheduled',
      true,
      true,
      not v_is_detail_plus,
      coalesce(new.completed_at, now()) + interval '15 minutes'
    )
    on conflict (job_id) do nothing;
  end if;
  return new;
end;
$$;

-- Atomic worker claim. SKIP LOCKED prevents duplicate sends if cron overlaps.
create or replace function public.claim_after_job_followups(p_limit integer default 15)
returns table (
  id uuid,
  job_id uuid,
  include_receipt boolean,
  include_review boolean,
  include_detail_plus boolean,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with due as (
    select f.id
    from public.after_job_followups f
    where (f.status in ('scheduled','queued','failed')
           or (f.status = 'sending' and f.claimed_at < now() - interval '15 minutes'))
      and f.sent_at is null
      and f.scheduled_for <= now()
      and f.attempt_count < 3
    order by
      case when f.status = 'queued' then 0 else 1 end,
      f.scheduled_for,
      f.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 15), 50))
  ), claimed as (
    update public.after_job_followups f
    set status = 'sending',
        claimed_at = now(),
        attempt_count = f.attempt_count + 1,
        last_error = null,
        updated_at = now()
    from due
    where f.id = due.id
    returning f.*
  )
  select c.id, c.job_id, c.include_receipt, c.include_review,
         c.include_detail_plus, c.attempt_count
  from claimed c;
end;
$$;

create or replace function public.finish_after_job_followup(
  p_followup_id uuid,
  p_sent boolean,
  p_error text default null,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.after_job_followups
  set status = case
        when p_sent then 'sent'
        when attempt_count >= 3 then 'failed'
        else 'scheduled'
      end,
      sent_at = case when p_sent then now() else sent_at end,
      provider_message_id = case when p_sent then p_provider_message_id else provider_message_id end,
      last_error = case when p_sent then null else left(coalesce(p_error, 'Unknown send failure'), 1500) end,
      claimed_at = null,
      scheduled_for = case
        when p_sent then scheduled_for
        when attempt_count >= 3 then scheduled_for
        else now() + interval '10 minutes'
      end,
      updated_at = now()
  where id = p_followup_id
    and status = 'sending';
end;
$$;

revoke all on function public.claim_after_job_followups(integer) from public, anon, authenticated;
revoke all on function public.finish_after_job_followup(uuid,boolean,text,text) from public, anon, authenticated;
grant execute on function public.claim_after_job_followups(integer) to service_role;
grant execute on function public.finish_after_job_followup(uuid,boolean,text,text) to service_role;

-- Reuse the same Vault secret already authorizing /api/cron/job-reminders.
-- The website route checks the existing CRON_SECRET environment variable.
do $$
declare
  v_jobid bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then
    select jobid into v_jobid from cron.job where jobname = 'every-detail-after-job-followups' limit 1;
    if v_jobid is not null then perform cron.unschedule(v_jobid); end if;

    perform cron.schedule(
      'every-detail-after-job-followups',
      '*/5 * * * *',
      $cron$
      select net.http_get(
        url := 'https://www.everydetail.co/api/cron/after-job-followups',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'customer_reminder_cron_secret'
            order by created_at desc
            limit 1
          )
        ),
        timeout_milliseconds := 120000
      );
      $cron$
    );
  end if;
end $$;
