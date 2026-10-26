# Unified Availability V3

The website and manager app now share one sellable-capacity source of truth in Supabase.

Run `supabase/migrations/20260929_unified_capacity_v3.sql` once in the Supabase SQL Editor before relying on website availability.

Automatic website availability now uses:
- `availability_entries`, including recurring and partial-day unavailability
- `profiles.counts_for_capacity`
- `profiles.can_lead_jobs`
- `profiles.can_work_solo`
- `profiles.can_tow_trailer`
- active rigs and overlapping jobs
- `rigs.requires_tow_qualified`
- Master Availability day/window overrides

Current towing seed: Wiley and Grady are tow-qualified. Rigs containing `trailer` in the name require a tow-qualified crew member.

Manager override behavior:
- Close/Veto always removes website slots.
- Force Open publishes the window even if automatic capacity says closed.
- A Force Open booking that cannot receive a rig is saved with no rig and an explicit manager-review note.
- Auto follows the shared capacity engine.

Standard sellable windows remain:
- Weekdays: 4 PM to 8 PM
- Weekends: 9 AM to 1 PM and 1 PM to 5 PM

The existing website `/api/availability` and `/api/book` endpoints do not duplicate this logic. They call the Supabase RPCs, so future capability/availability changes take effect without rewriting the website UI.
