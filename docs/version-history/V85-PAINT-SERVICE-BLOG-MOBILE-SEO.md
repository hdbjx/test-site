# V85 Paint + Service + Blog + Mobile + SEO

## Paint Care family
- Rebuilt Paint Correction and Ceramic into the same `paint85` visual system.
- Exact vehicle-specific Paint Care pricing uses the shared site vehicle context.
- Paint Correction presents Enhancement Polish and Full Paint Correction up front.
- Ceramic focuses on protection, prep, coating truth, package, result, and assessment.
- Split correction and ceramic FAQs so each page answers the questions specific to that service.
- Added price-range Service schema and breadcrumb schema.

## Service family
- Added shared `service85` readability/mobile floor to Services, Mobile Car Detailing, Detail+, and Detail+ Join.
- Preserved each page's existing visual identity.
- Improved mobile type floor, touch behavior, CTA containment, and body contrast.

## Shine On
- All article pages inherit the same article template.
- Added category/CTA-aware fallback cover images for every current and future post.
- Added author/context line, tighter reading width, clearer related stories, and redesigned in-article CTA.
- Added article dates to Open Graph metadata, BlogPosting schema, breadcrumb schema, and CollectionPage/ItemList schema on the blog index.

## SEO
- Shortened several public titles/descriptions.
- Added authors/creator/publisher metadata and OG image dimensions.
- Added social images to key landing pages.
- Booking and Find My Detail are now explicit noindex transactional routes and removed from sitemap.
- Fixed robots/noindex conflict by allowing account pages to be crawled so their noindex directive can be seen.
- Added `qa:seo` to prebuild.

## Mobile/accessibility
- Retains V74/V77 full mobile safety work.
- New Paint Care pages collapse cleanly at 900px and 700px.
- Service-family and article controls keep full-width safe CTAs on phones.
- Added global skip-to-content link.

## Validation
- 135 TS/TSX files syntax-transpile clean.
- Vehicle catalog QA passed: 1427 entries.
- Site-context QA passed.
- SEO QA passed.
- No missing image references.
- CSS braces balanced.
