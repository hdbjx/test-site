# V66 Sitewide Context System

## What changed
- Added session-only JourneyProvider for service intent, location, live opening, recent services, selected appointment time, and booking resume link.
- Kept vehicle persistence separate: session by default, optional local device memory only when explicitly chosen.
- Added universal Your Detail summary drawer and responsive header/mobile access.
- Added live next-opening lookup for normal detailing services and Detail+ using the existing availability API.
- Added Use this opening flow. Booking verifies the slot is still available before restoring it.
- Added explicit booking resume path that carries vehicle, service, add-ons, paint options, location, and selected slot when still valid.
- Booking multi-vehicle state remains separate from the browsing vehicle.
- Added service intent propagation from Services, homepage configurator, Quote, Paint Lab, Detail+, and Booking.
- Added session-aware homepage hero model personalization with a conservative fallback.
- Added personalized mobile conversion bar.
- Added recent service choices and restrained context-aware cross-sell suggestions in the summary drawer.
- Fixed Services catalog `vehicleLabel` / `vehicleTypeLabel` variable typo found during validation.
- Preserved V65 expanded vehicle catalog (1,434+ entries).

## Privacy / safety decisions
- Service intent, location, recent services, selected time, and booking resume state use sessionStorage only.
- They are not persisted to future visits.
- Name, phone, and email are not added to the sitewide journey store.
- Vehicle persistence remains opt-in for future visits.
- Stale appointment times are discarded if no longer returned by live availability.
- Browsing service intent never silently rewrites a second vehicle inside a multi-vehicle booking.

## Validation
- Changed TS/TSX files pass TypeScript syntax transpilation.
- Focused semantic diagnostic scan found no unresolved identifiers / property errors in changed files.
- CSS brace structure balanced.
- Local `npm ci` could not complete within the container timeout, so a full Next production build could not be run locally.
