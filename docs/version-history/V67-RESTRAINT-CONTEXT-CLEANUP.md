# V67 - Restraint + Context Cleanup

This pass simplifies the sitewide personalization system and removes UI that explained the website instead of helping customers understand Every Detail.

## Customer-facing cleanup
- One unified header context control replaces separate Vehicle and Your Detail controls.
- Removed the global floating Your Detail pill and global sticky mobile booking bar.
- Removed pseudo-live school-hours header status and its scheduling modal.
- Removed global route-wipe navigation and automatic card/photo motion.
- Availability is fetched only when the customer opens the context drawer.
- Removed recent-service chips, context-system narration, and generic cross-sell clutter.
- Tightened explanatory copy across Homepage, Services, Quote, Detail+, Paint Care, Gift Cards, account portal and lead forms.
- Removed the Paint Lab floating stage tracker and the redundant Detail+ club-rules section.

## Safer context architecture
- Browsing configuration no longer creates a fake unfinished booking.
- Real booking recovery is owned only by Booking and saved as a session-only booking draft.
- Booking draft preserves all booking vehicles, exact make/model/year, services, add-ons, paint choices and booking address.
- Exact street address stays in the booking draft. Global context only keeps city/state/ZIP.
- Service or vehicle changes invalidate stale appointment state.
- Contextual booking links preserve exact shared vehicle identity instead of downgrading it to a size-only URL.
- Size-only manual fallback remains available when an exact vehicle is missing.
- Quote only skips its vehicle question when an exact make/model is actually known.

## Vehicle system
- Catalog cleaned to 1,427 unique make/model entries.
- Removed normalized duplicates and the conflicting Chevrolet Trailblazer classification.
- Added year-aware Trailblazer pricing class handling for 2002-2009 vs current generation.
- Vehicle year parser now accepts only plausible model years.
- Shared search remains lazy-loaded.

## Accessibility
- Vehicle modal and context drawer trap focus, support Escape, close from the backdrop and restore focus to the opener.
- Vehicle result semantics use real buttons instead of incomplete listbox behavior.

## Performance / build hygiene
- Removed unused MobileBookBar, RouteTransition and SitewideMotion components.
- Converted CSS background photography used by major sections to WebP variants.
- Removed scratch page files and PaintLeadForm temporary file.
- Added `qa:vehicles` and `qa:site` pre-build checks.
- Prebuild now fails on duplicate/conflicting vehicle catalog entries or key context architecture regressions.

## Validation
- TypeScript syntax diagnostics passed across 133 TS/TSX files.
- Vehicle catalog QA passed with 1,427 unique entries.
- Site context QA passed.
- CSS braces balanced.
- Referenced WebP background assets verified present.

A full Next production build could not be run in this extracted workspace because the local Next dependency binary is unavailable. The Vercel build should still be used as the final production type/build gate.
