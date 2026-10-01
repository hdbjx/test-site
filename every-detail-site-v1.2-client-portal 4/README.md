# everydetail.co

The Every Detail website. Next.js 16 (App Router), TypeScript and Tailwind CSS v4, with no Wix dependency.

## Setup

```bash
npm install
cp .env.example .env.local      # fill in values, see below
npm run images:pull             # one time: downloads photos + logo from the old Wix media library
npm run blog:pull               # one time: copies the Shine On posts into content/blog
npm run dev                     # http://localhost:3000
```

Run both `pull` scripts **before** the domain leaves Wix. After that, the Wix URLs they read from stop working.

## File structure

```
src/
  app/                    one folder per URL
    page.tsx              /
    our-services/         /our-services
    ceramic/              /ceramic          (paint correction + ceramic)
    detailplus/           /detailplus, /detailplus/join
    about-us/             /about-us
    get-a-quote/          /get-a-quote      (?interest=ceramic preselects)
    book/                 /book             (?vehicle=minivan&service=premium preselects)
    blog/, post/[slug]/   /blog, /post/<slug>   (same slugs as Wix)
    service-areas/        /service-areas, /service-areas/<slug>
    api/lead/route.ts     form submissions → your webhook
    sitemap.ts, robots.ts
  components/             UI pieces; forms/ holds the three forms
  data/                   ALL business content lives here
  lib/                    analytics, SEO/schema, blog loader, helpers
content/blog/             one .md file per blog post
scripts/                  one-time Wix migration scripts
public/images, public/brand
```

## Where to change things

| To change… | Edit |
|---|---|
| Prices, durations, service inclusions | `src/data/services.ts` → `PRICING`, `services` |
| Where Book buttons go | `src/data/booking.ts` → `bookingLinks` |
| Phone, email, review count, award, payment methods, socials, portal/gift card links | `src/data/site.ts` |
| Paint correction / ceramic packages and copy | `src/data/paint.ts` |
| Detail+ benefits, frequencies | `src/data/detailplus.ts` |
| Team roster | `src/data/team.ts` |
| Reviews (quote them verbatim) | `src/data/reviews.ts` |
| FAQs (`confirmed: false` = hidden) | `src/data/faqs.ts` |
| Service areas + location pages | `src/data/areas.ts` |
| Nav menus | `src/data/navigation.ts` |
| Photos, alt text, before/after pairs | `src/data/images.ts` |
| Colors, fonts, spacing, buttons | `src/app/globals.css` (`@theme` block) |
| Blog posts | `content/blog/*.md` (frontmatter documented in `src/lib/blog.ts`) |

## Booking

Every Book button calls `bookingHref(vehicle, service)`:

- `bookingLinks.sedan.premium = null` sends the customer to the on-site request at `/book?vehicle=sedan&service=premium`. They pick their days and address, and you confirm the time.
- `bookingLinks.sedan.premium = "https://…"` sends that combo to an external scheduler instead, for example the Every Detail app once real-time booking is live.

## Forms → webhook

The quote, booking and Detail+ forms all POST to `/api/lead`, which validates the fields, drops spam caught by the honeypot, and forwards JSON to `LEAD_WEBHOOK_URL`. Every payload has a `type` of `quote`, `booking` or `detailplus`, plus `submittedAt`, `page`, `secret` if set, and the form fields.

Minimal Apps Script receiver:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.secret !== PropertiesService.getScriptProperties().getProperty('LEAD_SECRET')) return ContentService.createTextOutput('no');
  const sheet = SpreadsheetApp.getActive().getSheetByName('Website_Leads');
  sheet.appendRow([d.submittedAt, d.type, d.name, d.phone, d.email || '', JSON.stringify(d)]);
  return ContentService.createTextOutput('ok');
}
```

In production, if `LEAD_WEBHOOK_URL` is missing, the form shows an error with your phone number instead of silently losing the lead.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.everydetail.co`. Used for canonicals, sitemap and schema |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID. Blank disables analytics |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console meta-tag token |
| `LEAD_WEBHOOK_URL` | Apps Script web app `/exec` URL |
| `LEAD_WEBHOOK_SECRET` | Shared secret checked by the script |

## Analytics

GA4 loads from `src/components/Analytics.tsx`. Events are named in `src/lib/analytics.ts`:
`book_click`, `vehicle_select`, `service_select`, `booking_submit`, `quote_start`, `quote_submit`, `phone_click`, `detailplus_start`, `detailplus_submit`, `paint_inquiry`.
In GA4, mark `booking_submit`, `quote_submit`, `detailplus_submit` and `phone_click` as key events.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel. The framework is detected automatically.
2. Add the environment variables for Production. Leave the Preview variables blank; preview deployments get `Disallow: /` automatically.
3. Run both pull scripts, commit `public/images`, `public/brand` and `content/blog`, and deploy. Check the site on the `*.vercel.app` URL.
4. Point `everydetail.co` / `www` DNS at Vercel, then cancel Wix.
5. In Search Console, verify the property, submit `/sitemap.xml`, and check the Pages report weekly for a month.

## Redirect map (in `next.config.ts`)

| Old URL | New URL | Code |
|---|---|---|
| `/book-online?category=<wix id>` | `/book?vehicle=<vehicle>` (all 6) | 301 |
| `/book-online` | `/book` | 301 |
| `/booking-calendar/2-year-ceramic-coating` | `/get-a-quote?interest=ceramic` | 301 |
| `/booking-calendar/*`, `/service-page/*` | `/book` | 301 |
| `/book-your-paint-work` | `/get-a-quote?interest=paint-correction` | 301 |
| `/services-3` (duplicate ceramic page) | `/ceramic` | 301 |
| `/join-detail` | `/detailplus/join` | 301 |
| `/blog/categories/*`, `/tags/*`, `/hashtags/*`, `/page/*` | `/blog` | 301 |
| `/cart-page`, `/my-addresses`, `/members-area/*` | `/` | 302 |
| `/client-portal`, `/gift-cards` | the `site.external` URL, or `/` | 302 |

Kept at the same URL: `/`, `/our-services`, `/ceramic`, `/detailplus`, `/about-us`, `/get-a-quote`, `/blog`, `/post/*`.

## Needs human input before launch

1. **Run `images:pull` and `blog:pull`**, then review the output. Blog bodies are converted automatically, so check headings, lists and links, and set `category` / `cta` on each post.
2. **Alt text.** Every photo marked `altReview: true` in `images.ts` has a generic description because the photos couldn't be inspected.
3. **Before/after pairs.** The sliders appear once you add pairs to `beforeAfterPairs`. Paint and ceramic photos (category `paint` / `ceramic`) will also fill the Paint & Ceramic hero automatically.
4. **Hidden FAQs** (`confirmed: false`): the 24-hour satisfaction guarantee terms, "Do I need to be home?", "Can you detail my car at work?", and whether Detail+ requires a first full detail.
5. **`site.ts`**: legal business name, social profile URLs, Google Business Profile URL, client portal and gift card URLs (hidden until set).
6. **Team photos**: add ids in `team.ts`. Without a photo, a person shows as an initial.
7. **Privacy policy page.** The forms collect names, phones, emails and addresses, so add `/privacy` and link it in the footer.
8. **Location pages**: none are published until an area in `areas.ts` has real local content.
9. **Reviews**: only 3 verbatim reviews were available. Add more from Google, especially ones about pet hair, family cars and repeat service.

## QA completed

- `tsc` and `next build` pass.
- All pages return 200, unknown slugs return 404, and every redirect was checked.
- The `/api/lead` validation, honeypot, and missing-webhook error path were checked.
- axe-core (WCAG 2 A/AA + best practice) reports zero violations on all 10 pages at mobile width.
- No horizontal overflow at 390px or 1440px.
- One H1 per page, plus unique titles, meta descriptions and canonicals. LocalBusiness, Service, BreadcrumbList and BlogPosting schema are in place. FAQ schema was left out on purpose, since Google no longer shows FAQ results for business sites.
- The mobile menu, focus trap, Escape to close, vehicle selector keyboard arrows, and booking form validation were exercised in Chromium.
