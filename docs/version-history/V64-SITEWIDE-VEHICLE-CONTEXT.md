# V64 — Sitewide Vehicle Context

- Added a global browsing vehicle context backed by sessionStorage by default.
- Optional “Remember this vehicle on this device” persists to localStorage.
- First-visit vehicle search can be skipped for the session.
- Added a global vehicle picker and pricing-class override.
- Added a compact vehicle pill to the shared header and vehicle control inside the shared menu.
- Added vehicle controls to Booking and Quote funnel headers.
- Services catalog/compare now inherits the selected vehicle and shows exact pricing for that model’s class.
- Homepage booking flow inherits the selected vehicle.
- Quote skips repeat vehicle entry when the site already knows the vehicle.
- Booking carries the active browsing vehicle into the first booking line while keeping additional booking vehicles independent.
- Paint Care plan pricing and lead form inherit the selected vehicle.
- Detail+ inherits the selected vehicle.
- ServicePicker instances on service-area/SEO pages inherit the selected vehicle.
- Expanded known vehicle inventory from 837 to 964 entries.
- Centralized vehicle search with alias-aware matching (Chevy, VW, Benz/Mercedes, year-prefixed searches, partial tokens).
- Added manual vehicle-size/pricing-class override so customers can correct classification without changing make/model.

Validation:
- All changed TS/TSX files passed TypeScript transpile syntax diagnostics.
- CSS brace balance passed.
- Full project typecheck cannot run in this extracted archive because node_modules/Next/React type packages are not present locally.
