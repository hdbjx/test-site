# v1.3.0 - Live Google review counts

Visible review counts now load from Google Places API (New) through a server-only Next.js route.

## Required Vercel environment variables
- GOOGLE_PLACES_API_KEY
- GOOGLE_PLACE_ID

The API key never ships to the browser. The browser requests `/api/google-review-stats`; the server calls Google Places with `userRatingCount,rating` and `cache: no-store`.

If either variable is missing, Google fails, or the response is invalid, the site safely falls back to the existing count in `src/data/site.ts`.

Google Maps attribution is displayed beside live review-count content to satisfy Places API attribution requirements.
