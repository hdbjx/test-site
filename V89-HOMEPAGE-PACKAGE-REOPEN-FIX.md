# V89 Homepage Package Reopen Fix

## Bug
When a customer had a sitewide/saved vehicle, closed the homepage package selector, and opened a package again later, the price and booking CTA could disappear.

## Root cause
Closing the selector cleared HomeBookingFlow's local `vehicle` state. The saved sitewide vehicle did not change, so the hydration effect did not fire again on reopen. Because `quote` requires both a service and local vehicle, `quote` stayed null and the result block did not render.

## Fix
- Re-sync local pricing vehicle from the current sitewide vehicle whenever a service is selected.
- When closing the selector, preserve the current sitewide vehicle as the local pricing vehicle instead of clearing it.
- Customers without a sitewide vehicle still reopen at the vehicle-size choice as before.

## Validation
- Vehicle catalog QA: 1,427 unique entries
- Site context QA: passed
- SEO QA: passed
- HomeBookingFlow TSX syntax/transpile: passed
