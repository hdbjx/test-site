# Customer day-of confirmation email

v96 adds a second automatic customer email on the day of the appointment. It is designed to feel like a personal confirmation from Every Detail rather than another generic reminder.

## Customer experience

- Subject: `We're all set for today, FirstName`
- Confirms the appointment is set on Every Detail's side
- Shows the assigned crew by first name
- Uses initial avatars now, ready to be replaced by headshots later
- Labels assigned staff as `Lead detailer` or `Detailer`
- Shows appointment time, vehicle, service, and address
- Explicitly says the customer does not need to confirm anything
- Replies go to the normal Every Detail inbox

## Delivery behavior

The existing `/api/cron/job-reminders` worker now handles both the roughly-24-hour reminder and the same-day confirmation. No second Vercel/Supabase cron endpoint is required.

A same-day email is eligible when:

- Job status is `booked` or `assigned`
- A customer email exists
- The appointment is today in the configured booking timezone
- Local time is at least 6:30 AM
- The appointment is more than 15 minutes away
- At least one technician is assigned in `job_assignments`
- This scheduled start has not already received its same-day confirmation

If the job has no assigned crew yet, it stays eligible and a later 15-minute cron run can send it after staffing is assigned. Failed sends release their claim for retry. A reschedule to a new `scheduled_start` can receive a fresh same-day confirmation.

Crew changes alone do not trigger a second customer email. This avoids duplicate morning confirmations if operations swaps technicians after the first message is sent.

## Deploy

1. Run `supabase/migrations/20261023_customer_day_of_confirmations.sql` in production Supabase.
2. Deploy the website.
3. Keep the existing `/api/cron/job-reminders` schedule running every 15 minutes.

## Test

With `CRON_SECRET` authorization, use:

`GET /api/cron/job-reminders?testEmail=you@example.com&type=dayOf`

The test email uses Wiley and Davis as sample assigned crew and does not modify a job.
