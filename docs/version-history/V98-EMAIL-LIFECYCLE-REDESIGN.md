# V98 Email Lifecycle Redesign

V98 moves Every Detail from one repeated transactional template to a lifecycle system where each email has a distinct job while sharing the same cream, ink, oxblood and coral visual language.

## Redesigned customer emails

- Booking confirmation: confirmation-ticket composition plus a simple three-step expectation timeline.
- Quote acknowledgment: reflects the submitted vehicle, service/build, selected extras, estimate and timing when present.
- Detail+ request: reflects the actual rhythm, coverage and vehicle as a club-plan preview.
- Tomorrow reminder: practical prep sheet rather than another generic appointment card.
- Day-of confirmation: crew-first treatment with assigned team members and initials ready to become headshots later.
- Post-job completion: transformation-first layout with softer rebooking language and a less aggressive Detail+ module.
- Gift card request: cleaner payment handoff and stronger gift-object presentation.
- Gift card activated: single dominant gift card, stacked mobile-safe actions.
- Gift sent confirmation: fuller delivery receipt without unnecessary cards.
- Reschedule confirmation: new lifecycle email showing old and new appointment times.
- Cancellation confirmation: new lifecycle email with a clear cancelled-state message and optional rebook action.

## New lifecycle infrastructure

`supabase/migrations/20261023_customer_job_change_emails.sql` adds a queue triggered by `jobs` updates. It catches reschedules and cancellations no matter whether the change came from the account portal, Van HQ, Team App, or another trusted database client.

The existing `/api/cron/job-reminders` worker now processes lifecycle changes first, then same-day confirmations, then tomorrow reminders. No new cron schedule is needed.

Rapid reschedules are coalesced. Claimed events are validated against the current job immediately before send, and stale events are discarded rather than emailed.

## Supabase Auth

`supabase/email-templates/` contains matching templates for confirmation, password recovery, magic links, invitations and email changes. Hosted Supabase Auth templates are dashboard-managed, so deploying V98 does not apply those automatically.

## Still intentionally not automated

A true Detail+ membership welcome/change/cancel sequence is not wired because this website snapshot does not define a reliable membership activation/status schema. The request acknowledgment is redesigned, but membership lifecycle email automation should be tied to the canonical membership event rather than guessed from a lead submission.
