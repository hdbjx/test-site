# V48 Booking Precision Pass

Built on the V47 booking desk using the latest supplied booking components.

## Changes
- Preserves the dedicated booking header and four-stage booking progress model.
- Adds an accessible skip-to-booking link on the booking funnel.
- Removes the decorative intro photo so the booking flow starts cleaner and faster.
- Service cards only auto-advance on the customer's first service selection. Editing a package no longer throws the user forward through the funnel.
- Calms the selected service card treatment by removing scale and reducing the offset shadow.
- Makes service-area messaging more precise. Explicit listed cities can receive a direct-coverage confirmation, while Atlanta and unlisted Georgia locations use coverage-confirmation copy instead of promising service.
- School-hours UI now runs only during the August-May school-year window and uses "School hours / typically in class" language instead of claiming the team is definitely in class on holidays or special schedule days.
- Hardens the autofill-safe notes control with a 500-character limit, plain-text paste handling, accessible description metadata, visible character count, and improved focus treatment.
- Keeps live availability, quote carryover, garage autofill, multi-vehicle booking, add-ons, gift cards, and existing booking API behavior intact.

## Validation
- Checked parenthesis, brace, and bracket balance for all modified TSX files.
- Checked full stylesheet brace balance.
- Ran TypeScript against the unpacked project. The environment does not include the project's React/Next/Node dependency types, so a dependency-complete production type/build check is not available here. No new parser-level syntax failure was found in the modified files.
