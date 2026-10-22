# Web Interface Guidelines Pass

Applied: 2026-10-21

## Implemented in this pass

- Preserved browser zoom and the existing responsive viewport configuration.
- Strengthened visible `:focus-visible` treatment across links, buttons, fields, summaries, and custom focusable controls.
- Added 44 px minimum coarse-pointer targets for interactive controls.
- Added `touch-action: manipulation` and a brand-consistent tap highlight.
- Added desktop-only vertical overscroll suppression while preserving coarse-pointer/mobile overscroll behavior.
- Added anchored-heading `scroll-margin-top` protection for the sticky header.
- Enforced 16 px minimum input/select/textarea text sizing to avoid iOS focus zoom.
- Explicitly set native select foreground/background colors for Windows dark-mode resilience.
- Added overscroll containment to modal/menu surfaces.
- Fixed the scheduling dialog to move focus into the dialog, trap Tab/Shift+Tab, close on Escape, and return focus to the opening control.
- Normalized visible processing copy from three periods to the ellipsis character in the quote recommender.
- Retained the site's existing reduced-motion support, semantic links, skip link, form labels, safe-area handling, and route-transition reduced-motion bypass.

## Existing strengths verified

- Root viewport does not disable zoom.
- Global reduced-motion behavior exists.
- Form fields are already at least 16 px.
- The mobile navigation already traps focus and restores it on Escape.
- Navigation uses native links rather than click-only divs.
- Main content has a skip target.
- Most loading actions disable only while a request is in flight.
- Images use Next Image in primary components and reserve dimensions.

## Follow-up candidates

These are intentionally not automated in this pass because they need product-level decisions or broader state refactors:

- Deep-link multi-step quote and booking state into the URL where sharing/back-forward behavior would be valuable.
- Add first-error focus management to every multi-step form, not just inline error rendering.
- Standardize all loading buttons around a shared spinner component that keeps the original action label visible.
- Run browser-level keyboard, VoiceOver, Windows native-select, iOS Low Power Mode, and throttled performance QA in deployment preview.
- Profile long scroll-story components and booking lists with React DevTools/React Scan before changing rendering architecture.
