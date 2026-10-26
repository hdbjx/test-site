# V107 — Security, performance, accessibility, and repository hardening

V107 is a risk-first hardening pass based on the October 25 audit. It prioritizes gift-card integrity, public-form abuse protection, CRM identity safety, redirect safety, and external API cost control before moving into correctness, performance, accessibility, SEO, and repository cleanup.

## Security and money

- Gift-card validation and redemption now use exact code matching rather than wildcard-friendly matching.
- The public validate response no longer exposes the full gift-card code or recipient identity.
- Public gift-card validation, booking, lead, contact, and gift-card order routes use durable database-backed rate limits.
- Rate limiting fails closed if the limiter RPC is unavailable. The V107 SQL migration is therefore a deployment prerequisite.
- Public forms retain honeypot checks and can also use Cloudflare Turnstile when the two Turnstile environment variables are configured.
- Public CRM capture is enrichment-only. Existing customer name/email/address data cannot be replaced merely by submitting a matching phone number.
- Sign-in and auth callback redirects use a shared same-origin path sanitizer.
- Zelle gift-card checkout requires an explicit `GIFT_CARD_ZELLE_LABEL`. There is no hardcoded payment identity fallback.
- Gift-card request email delivery is awaited before the route completes.

## Correctness

- Google review stats use a real server-rendered fallback count and update correctly if the live count arrives after the animation.
- Google Places review requests are cached for one hour with stale-while-revalidate support.
- About uses the curated team roster instead of every active profile row and can be cached for a day.
- Find My Detail now says `4 QUICK STEPS`.
- Vehicle and welcome storage access is guarded when browser storage is unavailable.
- The four previously hidden FAQs now have customer-facing answers.

## Performance

- `globals.css` was conservatively pruned by selector reachability instead of rewritten. Final size is about 565 KB / 102 KB gzip, down roughly 44% from the audited source.
- The default social share asset is now a ~193 KB 1200×630 JPEG instead of the ~2 MB PNG.
- Google review and About data paths now cache rather than refetching on every view.

## Accessibility and design

- Mobile headers receive a tone-aware backdrop so the reactive logo/controls stay readable over page content.
- The Services comparison adds an explicit horizontal-scroll hint and keyboard-focusable table wrapper.
- Known high-risk contrast problems from the audit were corrected, including About map attribution, Detail+ week-grid text, footer copy, and coral text used on light surfaces.
- The semantic palette now separates native logo red, action red, readable light-surface red, and oxblood. Illustration/art-direction shades may still exist where they are not text colors.

## SEO and content

- Decatur and Atlanta remain indexable service-area pages.
- Thin secondary location pages stay accessible but are `noindex` and omitted from the sitemap until they receive genuinely local content.
- Three overlong blog titles were shortened.
- The homepage vehicle prompt remains an intentional product choice and is still limited to the homepage.

## Repository cleanup

- Stale root copies of application source were removed.
- Historical version notes moved to `docs/version-history/`.
- Legacy root SQL moved to `database/legacy-root/`; deployable migrations remain canonical under `supabase/migrations/`.
- Customer-like data was sanitized from the day-of email preview.
- The obsolete large social PNG was removed.

## QA

- Vehicle catalog: 1,427 unique entries passed.
- Site-context QA passed.
- SEO QA passed.
- Link QA passed: 130 static internal links across 22 routes.
- Welcome-card regression QA passed: 28 checks.
- Security regression QA passed: 19 checks.
- Syntax transpilation passed for 139 TS/TSX files with 0 syntax errors.

A full Next production build was not run in the extracted workspace because dependencies are not installed there. Run the normal production build in the deployment environment after applying the SQL migration and environment variables.
