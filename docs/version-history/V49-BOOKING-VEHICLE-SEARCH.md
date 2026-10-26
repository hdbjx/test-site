# V49 Booking Vehicle Search

- Replaced the booking vehicle silhouette/type grid with the same searchable make/model interaction used by the quote recommender.
- Search results come from the shared `recommenderVehicles` catalog and show the classified Every Detail vehicle size.
- Selected vehicles collapse into a clean make/model + size summary with a Change action.
- Year is optional and appears after a catalog vehicle is selected. A year typed into the search query is carried through when possible.
- Removed vehicle silhouettes from saved and selected vehicle states.
- Kept a text-only vehicle-size fallback behind "Can't find it?" for catalog misses.
- Preserved saved garage vehicles, two-vehicle bookings, pricing, availability, quote carryover, and booking API behavior.
