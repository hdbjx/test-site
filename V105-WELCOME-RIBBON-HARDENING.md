# V105 — Welcome Ribbon Hardening

V105 addresses the second rendered QA audit of the V104 homepage vehicle welcome.
The visual direction is intentionally unchanged: friendly cream card, retro typography, two curved coral ribbons. This pass fixes positioning, layering, responsive behavior, search behavior, and account persistence.

## Structural fixes

- Ribbons retain `translateX(-50%)` throughout their entrance animation, so `left: 50%` now actually centers them across the composition.
- Ribbon width is widened slightly so the viewport sees the interior of the continuous tape rather than its starting edge.
- The upper ribbon is moved farther above the card so it reads as a real ribbon tucked behind the card rather than a thin sliver.
- The lower ribbon is moved substantially below the content region. It only grazes the bottom edge rather than crossing the intro, account actions, or skip link.
- Open desktop search results raise the card above the foreground ribbon.
- Mobile search results are no longer an absolutely positioned overlay. They enter the card's scroll flow, preventing clipping and ribbon overlap.

## Responsive fixes

- Removed the combined `(max-width: 390px), (max-height: 700px)` rule.
- Narrow-phone treatment now applies only by width.
- Added a dedicated short-laptop rule for screens wider than 760px and 720px tall or less. It preserves the two-column desktop composition while tightening vertical rhythm.
- `YOUR CAR` is stacked above `What do you drive?` on mobile.

## Search behavior

- Escape now closes either a result list or the empty/manual-selection state before the dialog can receive Escape.
- Existing keyboard navigation, Enter selection, and ARIA listbox behavior remain intact.

## Account / remember behavior

- Removed `ensure_my_client` from global vehicle hydration. Loading a page no longer mutates or re-links the client record.
- A brand-new signed-in user is linked lazily only if they actually request an account garage save and `save_my_vehicle` returns `no_client`, then the save is retried once.
- Failed account saves no longer set `remembered=true`.
- Signed-in remembered state now means the vehicle truly exists in the account garage, not merely in local storage.
- Toggling remember for a signed-in vehicle waits for the account save result before reflecting success.

## Regression protection

`npm run qa:welcome` now covers 28 checks, including:

- centered ribbon animation at rest
- lower ribbon clearance
- no short-laptop mobile fallback
- short-laptop two-column rule present
- mobile results in normal card flow
- desktop results above the foreground ribbon
- Escape handling for empty search
- no eager client linking during hydration
- lazy first-save client linking
- no optimistic success on failed garage saves

## QA

- Welcome-card QA: 28/28 passed
- Vehicle catalog QA: 1,427 unique entries passed
- Site-context QA: passed
- SEO QA: passed
- Internal link QA: 130 links across 22 routes passed
- TS/TSX syntax transpile: 136 files, 0 errors
