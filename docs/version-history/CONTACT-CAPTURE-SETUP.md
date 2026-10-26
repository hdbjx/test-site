# Website contact capture setup

This build makes every valid public website lead form create or update a canonical record in `public.clients` before the rest of the submission is processed.

Covered submission paths:

- Service recommender / quote request
- Standard quote form
- Detail+ inquiry
- Booking request form
- Instant live booking

Matching is by normalized US phone number first, then case-insensitive email. Existing contacts are enriched instead of duplicated. Quote CRM leads also store the matching client id in `converted_client_id`.

## Required one-time Supabase step

Before deploying the website code, run this migration in the Supabase SQL Editor:

`supabase/migrations/20260929_website_contact_capture.sql`

The website server must already have either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`. The current live-booking backend already depends on the service-role configuration.

## Expected behavior

1. A first-time visitor submits a valid form with name + 10-digit phone.
2. A row is created in `public.clients`.
3. A repeat submission with the same phone or email updates/reuses that contact.
4. Quote submissions create the CRM lead linked to that client.
5. Guest instant bookings reuse the same client id rather than creating another customer row.
6. Honeypot/spam submissions do not create contacts.
