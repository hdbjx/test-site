# V47 Booking Desk Redesign

This build preserves the existing booking business logic and redesigns the `/book` experience around a calmer configurator flow.

## What changed
- New dark booking-desk intro with mobile-service proof and text-help link.
- Four-step visual model: Detail → Car → Schedule → Confirm.
- Service selection moved into large editorial cards with live vehicle-specific pricing.
- Vehicle selection rebuilt as a clean catalog-style size picker while retaining saved-garage support and two-vehicle bookings.
- Add-ons rebuilt as compact upgrade cards.
- Month calendar replaced by a horizontal rail of actual available dates and slot counts.
- Student-run weekday scheduling explanation added directly beside availability.
- Customer details restyled into a quieter confirmation stage without changing validation/autofill logic.
- Desktop live summary rebuilt as a sticky service-ticket style panel.
- Mobile gets a compact sticky total + confirmation CTA.
- Gift-card validation remains available inside the live summary.
- Booking confirmation redesigned into an Every Detail branded confirmation screen.

## Preserved behavior
- Supabase live availability
- `/api/book` submission flow
- Quote carryover and behavior tracking
- Homepage booking carryover
- Account and saved garage vehicles
- Multi-vehicle appointments
- Add-on inclusion rules
- Paint quote carryover
- Address autocomplete and autofill-safe notes
- Lead source validation
- Gift-card validation
- Booking fallback when live scheduling is not configured
