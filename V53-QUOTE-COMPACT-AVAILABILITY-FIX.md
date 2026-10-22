# V53 Quote Compact + Availability Fix

## Quote page
- Removed the oversized V52 editorial hero and curved tape from `/get-a-quote`.
- Replaced them with a compact branded intro that fits above the diagnostic tool.
- The desktop quote experience is now a contained, near-single-screen tool.
- Only the active diagnostic question renders. Future questions no longer sit underneath or overlap search results.
- Vehicle, condition, and issues advance in place instead of relying on page scrolling.
- The live diagnosis summary remains as the playful/art-directed element and now includes direct Change controls.
- Recommendation and timing views use the same viewport and are arranged side-by-side on desktop where space allows.
- Removed automatic `scrollIntoView` behavior from the quote assessment and inline availability continuation.

## Booking availability
- Fixed the V50 regression caused by asking `/api/availability` for a 62-day range even though the API rejects ranges over 35 days.
- The two-month calendar remains.
- Availability is now fetched in two valid chunks (days 0-31 and 32-62), then merged and sorted client-side.
- If one range fails but the other succeeds, the customer can still see the availability that loaded.

## Validation
- TypeScript syntax/transpile check passed for QuoteRecommender, LiveBooking, QuoteBookingContinuation, and the quote page route.
- Global stylesheet brace count is balanced.
