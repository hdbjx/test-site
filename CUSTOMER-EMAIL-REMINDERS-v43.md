# Customer appointment reminder emails

v43 adds one automatic customer email reminder roughly 24 hours before a booked/assigned job.

## 1. Run the migration

Run `supabase/migrations/20261005_customer_job_email_reminders.sql` in the production Supabase project.

It adds three reminder bookkeeping columns to `jobs` plus two service-role-only RPCs. The claim RPC is concurrency-safe and prevents duplicate sends. If an appointment is rescheduled after its reminder was sent, the changed start time can receive a new reminder.

## 2. Add CRON_SECRET to Vercel

Create a long random value in the production Vercel environment:

`CRON_SECRET=<long-random-secret>`

Keep the existing `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `INTERNAL_NOTIFY_EMAIL`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` values.

Redeploy after adding the variable.

## 3. Schedule the endpoint

Call this production endpoint every 15 minutes:

`GET /api/cron/job-reminders`

with this header:

`Authorization: Bearer <CRON_SECRET>`

The route itself is protected. Do not put CRON_SECRET in browser code.

If using Supabase Cron, create an HTTP cron invocation in the Supabase dashboard for every 15 minutes and configure it to call the production URL with the Authorization header above. The website code does not hard-code the production domain or secret.

## Behavior

- Eligible statuses: `booked` and `assigned`
- Requires a customer email
- Primary target: about 24 hours before scheduled start
- Recovery window: 20 hours through 24 hours 15 minutes before start
- Maximum 25 reminders per invocation
- Failed sends release their claim and can retry on the next invocation
- Successful sends record both the send timestamp and the scheduled start they correspond to
- Cancelled/completed jobs are not eligible
- Rescheduling to a different start time makes the new appointment eligible for a fresh reminder
- Reminder contains appointment time, vehicle, service, address, arrival expectations, and reply instructions

## Test before enabling cron

Create a test job with `scheduled_start` between 20 and 24 hours 15 minutes from now and a test email address. Then invoke the endpoint once with the CRON_SECRET authorization header. Confirm the email arrives and verify these fields on the job:

- `customer_reminder_email_sent_at` is populated
- `customer_reminder_email_for` equals the current `scheduled_start`
- `customer_reminder_email_claimed_at` is null after completion

Invoke the endpoint again. The same appointment should not send a second email.
