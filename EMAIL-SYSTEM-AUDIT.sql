-- ============================================================
-- EVERY DETAIL CUSTOMER EMAIL SYSTEM AUDIT
-- Read only. Safe to run in Supabase SQL Editor.
--
-- This audits database infrastructure and the recommended customer lifecycle.
-- The "website_code_status" column reflects the V98 code audit. SQL cannot
-- determine whether a specific website build has already been deployed.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CUSTOMER EMAIL LIFECYCLE MATRIX
-- ------------------------------------------------------------
with lifecycle(
  email_key,
  customer_moment,
  trigger,
  priority,
  website_code_status,
  v98_design_status,
  recommendation
) as (
  values
    ('booking_confirmation',
     'Immediately after a website booking',
     'Website booking API',
     'critical',
     'HAVE',
     'REDESIGNED',
     'Keep. This is the first post-booking customer touchpoint.'),

    ('quote_request_ack',
     'Immediately after a quote request',
     'Website lead API',
     'high',
     'HAVE',
     'REDESIGNED',
     'Keep. Use human acknowledgment rather than generic form-received language.'),

    ('detailplus_request_ack',
     'Immediately after a Detail+ request',
     'Website lead API',
     'high',
     'HAVE',
     'REDESIGNED',
     'Keep. V98 reflects the actual cadence, coverage and vehicle in the email.'),

    ('appointment_24h_reminder',
     'Roughly 24 hours before the appointment',
     'job-reminders cron + claim_customer_email_reminders()',
     'critical',
     'HAVE',
     'REDESIGNED',
     'Keep. Practical prep email before the personal day-of confirmation.'),

    ('appointment_day_of',
     'Morning/day of appointment after crew assignment',
     'job-reminders cron + claim_customer_day_of_email_confirmations()',
     'critical',
     'HAVE',
     'REDESIGNED',
     'Keep. This is the personal Wiley/Rex style team confirmation.'),

    ('post_job_complete',
     'Shortly after a completed detail',
     'after-job-followups cron',
     'critical',
     'HAVE',
     'REFINED',
     'Keep. Receipt, transformation photos, review ask and rebook/Detail+ modules belong here.'),

    ('gift_card_request',
     'After a gift card order/request',
     'Gift card API',
     'medium',
     'HAVE',
     'REDESIGNED',
     'Keep.'),

    ('gift_card_activated',
     'When a gift card is activated',
     'Gift card activation API',
     'medium',
     'HAVE',
     'REDESIGNED',
     'Keep.'),

    ('gift_card_sent_confirmation',
     'After a recipient gift card is delivered',
     'Gift card activation API',
     'medium',
     'HAVE',
     'REDESIGNED',
     'Keep.'),

    ('reschedule_confirmation',
     'Whenever an appointment time/date is changed',
     'Job schedule change',
     'critical',
     'HAVE IN V98',
     'REDESIGNED',
     'Run the V98 customer_job_change_emails migration, then the existing job-reminders cron sends it.'),

    ('cancellation_confirmation',
     'Whenever a customer appointment is cancelled',
     'Job status changes to cancelled',
     'critical',
     'HAVE IN V98',
     'REDESIGNED',
     'Run the V98 customer_job_change_emails migration, then the existing job-reminders cron sends it.'),

    ('account_email_confirmation',
     'Customer creates an account',
     'Supabase Auth',
     'medium',
     'EXTERNAL',
     'DESIGNED IN V98',
     'Paste supabase/email-templates/confirmation.html into the hosted Supabase Auth template.'),

    ('account_password_reset',
     'Customer requests a password reset',
     'Supabase Auth',
     'medium',
     'EXTERNAL',
     'DESIGNED IN V98',
     'Paste supabase/email-templates/recovery.html into the hosted Supabase Auth template.'),

    ('detailplus_welcome',
     'When a Detail+ membership is actually activated',
     'Membership activation',
     'high',
     'MISSING',
     'NOT BUILT',
     'Build when membership activation has a reliable database event. Do not send from the initial request.'),

    ('detailplus_change_or_cancel',
     'When membership cadence/status changes',
     'Membership update',
     'medium',
     'MISSING',
     'NOT BUILT',
     'Build with the membership lifecycle so customers always know their current plan.')
)
select *
from lifecycle
order by
  case priority when 'critical' then 1 when 'high' then 2 when 'medium' then 3 else 4 end,
  email_key;


-- ------------------------------------------------------------
-- 2. CORE DATABASE INFRASTRUCTURE
-- One row, easy to screenshot/paste back.
-- ------------------------------------------------------------
select
  exists(select 1 from pg_extension where extname = 'pg_cron') as pg_cron_installed,
  exists(select 1 from pg_extension where extname = 'pg_net') as pg_net_installed,

  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='jobs'
      and column_name='customer_reminder_email_sent_at'
  ) as reminder_columns_installed,

  exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='claim_customer_email_reminders'
  ) as reminder_claim_function_installed,

  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='jobs'
      and column_name='customer_day_of_email_sent_at'
  ) as day_of_columns_installed,

  exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='claim_customer_day_of_email_confirmations'
  ) as day_of_claim_function_installed,

  to_regclass('public.after_job_followups') is not null as after_job_followups_table_installed,

  exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='claim_after_job_followup'
  ) as after_job_claim_function_installed,

  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relname='jobs'
      and not t.tgisinternal
      and pg_get_triggerdef(t.oid) ilike '%ed_create_after_job_followup%'
  ) as after_job_completion_trigger_installed,

  to_regclass('public.customer_job_change_emails') is not null as job_change_email_queue_installed,

  exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='claim_customer_job_change_emails'
  ) as job_change_claim_function_installed,

  exists(
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relname='jobs'
      and not t.tgisinternal
      and t.tgname='trg_ed_customer_job_change_email'
  ) as job_change_trigger_installed,

  to_regclass('public.gift_card_orders') is not null as gift_card_orders_installed,
  to_regclass('public.gift_cards') is not null as gift_cards_installed;


-- ------------------------------------------------------------
-- 3. EMAIL CRON JOBS
-- Look for duplicate reminder/after-job schedules too.
-- ------------------------------------------------------------
select
  jobid,
  jobname,
  schedule,
  active,
  command
from cron.job
where lower(coalesce(jobname,'')) like '%email%'
   or lower(coalesce(jobname,'')) like '%reminder%'
   or lower(coalesce(jobname,'')) like '%followup%'
   or lower(coalesce(command,'')) like '%job-reminders%'
   or lower(coalesce(command,'')) like '%after-job-followups%'
order by jobname, jobid;


-- ------------------------------------------------------------
-- 4. CRON SECRET CHECK
-- Does not reveal the secret itself.
-- ------------------------------------------------------------
select
  name,
  created_at,
  case
    when nullif(trim(decrypted_secret), '') is not null then 'OK'
    else 'EMPTY'
  end as secret_status
from vault.decrypted_secrets
where name = 'customer_reminder_cron_secret'
order by created_at desc;


-- ------------------------------------------------------------
-- 5. TODAY'S APPOINTMENTS + EMAIL STATE
-- ------------------------------------------------------------
select
  j.id as job_id,
  j.customer_name,
  j.email,
  j.status::text as status,
  j.service_name,
  j.vehicle,
  j.scheduled_start at time zone 'America/New_York' as appointment_eastern,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', p.full_name,
        'lead', coalesce(p.can_lead_jobs,false)
      )
      order by coalesce(p.can_lead_jobs,false) desc, p.full_name
    ) filter (where p.id is not null),
    '[]'::jsonb
  ) as assigned_team,
  j.customer_reminder_email_sent_at,
  j.customer_reminder_email_for,
  j.customer_day_of_email_sent_at,
  j.customer_day_of_email_for,
  j.customer_day_of_email_claimed_at
from public.jobs j
left join public.job_assignments ja on ja.job_id=j.id
left join public.profiles p on p.id=ja.staff_id
where (j.scheduled_start at time zone 'America/New_York')::date
    = (now() at time zone 'America/New_York')::date
group by
  j.id,
  j.customer_name,
  j.email,
  j.status,
  j.service_name,
  j.vehicle,
  j.scheduled_start,
  j.customer_reminder_email_sent_at,
  j.customer_reminder_email_for,
  j.customer_day_of_email_sent_at,
  j.customer_day_of_email_for,
  j.customer_day_of_email_claimed_at
order by j.scheduled_start;


-- ------------------------------------------------------------
-- 6. RECENT AUTOMATED APPOINTMENT EMAILS
-- ------------------------------------------------------------
select
  j.id as job_id,
  j.customer_name,
  j.email,
  j.scheduled_start at time zone 'America/New_York' as appointment_eastern,
  j.customer_reminder_email_sent_at as reminder_24h_sent_at,
  j.customer_day_of_email_sent_at as day_of_sent_at
from public.jobs j
where j.customer_reminder_email_sent_at is not null
   or j.customer_day_of_email_sent_at is not null
order by greatest(
  coalesce(j.customer_reminder_email_sent_at, '-infinity'::timestamptz),
  coalesce(j.customer_day_of_email_sent_at, '-infinity'::timestamptz)
) desc
limit 30;


-- ------------------------------------------------------------
-- 7. RECENT AFTER-JOB EMAILS
-- ------------------------------------------------------------
select
  f.id as followup_id,
  f.job_id,
  j.customer_name,
  j.email,
  f.status,
  f.scheduled_for,
  f.sent_at,
  f.attempt_count,
  f.last_error,
  f.provider_message_id
from public.after_job_followups f
join public.jobs j on j.id=f.job_id
order by coalesce(f.sent_at, f.updated_at, f.scheduled_for) desc
limit 30;


-- ------------------------------------------------------------
-- 8. RECENT WEBSITE CRON RESPONSES
-- ------------------------------------------------------------
select
  id,
  status_code,
  timed_out,
  error_msg,
  created,
  content
from net._http_response
where content::text ilike '%reminder%'
   or content::text ilike '%claimed%'
   or content::text ilike '%sent%'
   or content::text ilike '%follow%'
order by created desc
limit 30;


-- ------------------------------------------------------------
-- 9. RECENT RESCHEDULE / CANCELLATION EMAIL EVENTS (V98)
-- ------------------------------------------------------------
select
  q.id as event_id,
  q.job_id,
  q.event_kind,
  q.customer_name,
  q.email,
  q.previous_scheduled_start at time zone 'America/New_York' as previous_time_eastern,
  q.scheduled_start at time zone 'America/New_York' as scheduled_time_eastern,
  q.created_at,
  q.sent_at,
  q.discarded_at,
  q.attempt_count,
  q.last_error,
  q.provider_message_id
from public.customer_job_change_emails q
order by q.created_at desc
limit 30;
