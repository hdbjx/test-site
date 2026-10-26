# V95 — Link Audit + Interaction Hardening

- Audited internal route and anchor destinations across the site.
- Added `qa:links` to prebuild so stale routes/anchors fail before deployment.
- Link QA validates static internal links, booking service query values, dynamic area/blog slug integrity, and logo/cursor interaction guards.
- Kept the custom homepage cursor. It remains `pointer-events:none` and cannot intercept clicks.
- Changed the Booking and Quote funnel logos to direct `/` anchors and hardened their click layer.
- Preserved the shared site logo's existing stacking behavior while explicitly keeping it interactive.
- No booking flow, pricing, vehicle, service, or visual behavior changed beyond link interaction reliability.
