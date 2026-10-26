# V50 Booking Calendar + Vehicle Search Fix

## Vehicle search
- Keeps the V49 quote-style make/model search.
- Booking search results are now in document flow instead of an absolutely positioned overlay.
- Results have a capped viewport-aware height and their own vertical scroll surface.
- This prevents long vehicle lists from being hidden behind the viewport or mobile booking bar.

## Availability
- Replaced the horizontal date chip rail with a full seven-column month calendar.
- Calendar supports previous/next month navigation within the loaded availability window.
- Available dates show live appointment counts.
- Unavailable/out-of-window dates remain visible but disabled.
- Selecting a date reveals the existing time-slot buttons below the calendar.
- Availability fetch horizon increased from 31 days to 62 days so the next month view has useful live data.

## Validation
- LiveBooking.tsx passed TypeScript transpile syntax validation.
- globals.css braces are balanced.
