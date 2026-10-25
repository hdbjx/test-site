# V104 — Welcome Card Hardening

V104 replaces the accumulated first-visit welcome implementations with one authoritative system.

## Visual / layout fixes

- Removed V92, V94, V101, V102, and V103 welcome CSS generations.
- Removed the V76 welcome animation layer and scoped V77 sticky-close behavior to the regular change-vehicle sheet.
- Rebuilt the opening card with one brand line, one headline, one vehicle prompt, and sentence-case support copy.
- Changed the headline line structure so it cannot overlap the vehicle form column.
- Removed `white-space: nowrap` from welcome headline lines.
- Reduced mobile card height and density, with a compact short-viewport treatment.
- Close button is now absolutely positioned inside the card and uses `:focus-visible` rather than showing an immediate focus ring.
- Search results are positioned as a contained overlay rather than expanding the card.

## Ribbon fixes

- Ribbons are positioned relative to `.veh-welcome-stage`, not the viewport.
- SVG uses `preserveAspectRatio="xMidYMid meet"` so lettering is never horizontally stretched or squeezed.
- Top ribbon lives behind the card and the lower ribbon only grazes the card's lower edge.
- Homepage `.ed-tape` is hidden while the welcome composition is open so only the two entrance ribbons are visible.
- Ribbon copy no longer repeats the card headline.

## Behavior fixes

- Automatic welcome prompt now runs only on `/`.
- `/mobile-car-detailing` and all other SEO/service landing pages never receive a forced welcome interstitial.
- Sign-in and create-account links preserve the current route with `next=`.
- Vehicle auth state is owned by `VehicleContext`; the card no longer performs a second `getUser()` request or flickers between signed-out and signed-in UI.
- Signed-in customers who choose to remember a vehicle now persist it through `save_my_vehicle` into their account garage when make/model are available.
- "I'm just looking around" is persisted for 30 days instead of only the current tab/session.
- Fixed-body scroll locking prevents the page behind the dialog from moving on iOS Safari.
- Desktop autofocus is handled by `VehicleSearch` after the lazily-loaded component mounts.
- Touch devices focus the dialog container instead of the close button.
- Focus trap now includes links as well as buttons and inputs.

## Search accessibility

- Search input is a proper ARIA combobox.
- Results use listbox / option semantics.
- Arrow Up / Arrow Down navigate results.
- Enter selects the active result, or the first result when none has been highlighted yet.
- Escape closes the result list before the dialog.
- Screen readers receive a live match-count hint.

## Copy

Removed "quietly tune pricing". Current support copy:

> Tell us what you drive and we’ll tailor pricing, recommendations, and booking around your vehicle.

## Regression QA

Added `scripts/qa-welcome-card.mjs` and `qa:welcome` to `package.json`. Prebuild now checks the welcome system alongside the existing vehicle, site-context, SEO, and link QA.

Validation performed:

- 136 TS/TSX files syntax checked: 0 errors
- Vehicle catalog QA passed: 1,427 entries
- Site context QA passed
- SEO QA passed
- Link QA passed: 130 static internal links across 22 page routes
- Welcome-card QA passed: 18 regression checks
- CSS braces balanced
