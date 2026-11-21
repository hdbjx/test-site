# Website Realtime Availability v1.6.0

- Booking calendar now updates live. When a slot is booked or capacity changes anywhere (website, Van HQ, Team App, manager edits), open times refresh in every open browser without a reload.
- Instant path: Supabase Realtime broadcast on public topic `availability`, fired by statement-level triggers on jobs, job_assignments, job_rigs, job_vehicles, availability_entries, master_availability_overrides, booking_settings, company_settings, rigs, profiles. Payload is only the table name.
- Fallback: re-checks every 30s while the tab is visible, plus on tab focus and reconnect.
- Refresh is silent: no loader flash, month/day stay put.
- If the customer's selected time gets taken, it's cleared, they're moved back to the schedule step, and told "That time was just booked."
- A selected day that fills up shows a "just filled up" note.
- Calendar key reads "Updates live".

## Setup
Run `supabase/migrations/20261121_realtime_availability_broadcast.sql` in the Supabase SQL editor. Until it's run, the 30s/focus refresh still works.
