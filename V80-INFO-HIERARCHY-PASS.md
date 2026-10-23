# V80 Information Hierarchy Pass

Applied the Apple-design hierarchy principles from the V79 quote redesign across Every Detail's primary informational pages without making the pages visually identical.

## Updated pages
- Services
- About Us
- Ceramic / Paint Care
- Paint Correction
- Detail+
- Service Areas
- Gift Cards

## Core changes
- One dominant idea per section.
- Reduced competing display typography.
- Grouped explanations next to the thing they explain.
- Removed repeated sales chapters and duplicated CTAs.
- Shortened customer-facing copy.
- Removed website/system narration.
- Simplified mobile layouts instead of compressing desktop compositions.
- Preserved each page's existing visual identity and photography.

## Structural reductions
- Services: removed the standalone Detail Day chapter and condensed mobile-service information into one strip.
- Detail+: removed the comparison thesis chapter and oversized final sales section; plan builder now appears much earlier.
- Gift Cards: removed duplicate how-it-works and rewards bridge sections.
- Service Areas: reduced the path to hero -> area list -> requirements -> outside-area CTA.
- Paint Correction: shortened education and brought service options forward.
- About: reduced proof-oriented copy while preserving live roster and team photography.
- Ceramic: reduced competing headings and grouped prep, truth, package, result, assessment, and FAQ more clearly.

## Validation
- Vehicle catalog QA passed: 1,427 unique entries.
- Site context QA passed.
- Changed TS/TSX files pass TypeScript transpile diagnostics.
- CSS braces balanced.
- No em dashes in changed customer-facing page/component files.
- Full `tsc --noEmit` could not run because this extracted workspace is missing local `@types/node`, `@types/react`, and `@types/react-dom` packages.
