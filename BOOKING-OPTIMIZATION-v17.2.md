# Booking optimization v17.2

This pass keeps the booking API, pricing logic, multi-vehicle support, quote carryover, account autofill, add-ons, and lead-source capture intact.

Changes:
- Compacted the booking header and added three concise trust signals.
- Converted the booking flow into clearer visual sections without adding steps.
- Automatically opens the earliest available date after availability loads.
- Added a lightweight availability loading state.
- Refined vehicle/service cards and the desktop appointment summary.
- Hardened mobile layouts for service pricing, calendar targets, narrow phones, and summary spacing.
- Fixed the Halloween mobile calendar contrast override that could make dates unreadable on the light booking surface.
- Preserved the existing client-info substeps because they protect mobile autofill behavior.
