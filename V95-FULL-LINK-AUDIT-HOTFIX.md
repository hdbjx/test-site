# V95 — Full Link Audit + Booking Logo Hotfix

## Fixed
- Booking top-bar logo now uses Next `Link` to `/` and has an explicit clickable stacking layer.
- Quote top-bar logo gets the same pointer/z-index hardening.
- Paint Care catalog links no longer point at removed `/ceramic#packages` anchors:
  - Enhancement Polish -> `/paint-correction#paint-options`
  - Full Paint Correction -> `/paint-correction#paint-options`
  - 2-Year Ceramic -> `/ceramic#ceramic-price`
- Journey drawer paint CTAs now route by actual service intent:
  - Enhancement/Correction -> `/paint-correction#paint-quote`
  - Ceramic -> `/ceramic#coating-quote`
- Legacy reusable paint/service components were updated so removed anchors cannot reappear if those components are reused.
- Core service section anchors on `/our-services` are explicit rather than derived strings.

## Guardrail
Added `npm run qa:links` and included it in `prebuild`.
It checks:
- static internal href/router destinations against the actual Next page-route tree
- route-qualified hash anchors against target pages
- same-document anchors
- empty/dead hrefs
- computed route+anchor strings
- home destinations on the global, quote, and booking logo controls

## Validation
- 132 static internal links checked across 22 page routes
- Vehicle QA: 1,427 unique entries
- Site-context QA: pass
- SEO QA: pass
- Link QA: pass
- 136 TS/TSX files transpile clean
- globals.css brace balance: 0

External destinations such as Google, Instagram, phone/SMS, mailto, and runtime payment URLs were source-reviewed for valid formation, but live network verification is unavailable in this workspace.
