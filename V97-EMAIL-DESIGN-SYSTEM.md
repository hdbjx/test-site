# V97 Email Design System

## What changed

Customer-facing website emails now share one Every Detail visual system based on the current site:

- cream canvas instead of the old boxed white/red-header template
- editorial EVERY DETAIL / DECATUR + ATLANTA masthead
- oxblood section labels and footer surfaces
- larger, cleaner headlines
- warm paper2 summary panels
- compact uppercase metadata labels
- site-style red actions with a hard black offset shadow
- consistent reply-first footer language
- mobile layout rules kept email-client safe

## Redesigned customer emails

- website booking confirmation
- quote request acknowledgment
- Detail+ request acknowledgment
- 24-hour appointment reminder
- same-day team confirmation
- gift card request
- gift card activation/delivery
- gift card sender confirmation
- post-job completion email aligned to the same masthead/footer system

## Day-of email

The day-of email keeps the assigned team as the human focus. Until headshots exist, each detailer uses an initial avatar. The structure is ready for real headshots later.

## Database fix included

`supabase/migrations/20261023_customer_day_of_confirmations.sql` now qualifies `booking_settings.id`, fixing the ambiguous `id` error found in production.

## Still missing from the lifecycle

The database/code audit flags these as future work:

1. reschedule confirmation
2. cancellation confirmation
3. branded Supabase Auth confirmation/reset templates
4. Detail+ welcome and membership-change emails once membership activation/status has a reliable database event

Run `EMAIL-SYSTEM-AUDIT.sql` in Supabase to inspect the current infrastructure, cron jobs, today's email state, and recent delivery history.
