# V42 Homepage Clean Flow

Homepage-only refinement pass based on the V41 shared-header build.

## What changed

- Replaced the curved SVG hero marquee with a solid, slightly angled full-width red marquee so it physically covers the hero-to-services transition.
- Rebuilt review motion as one continuous horizontal editorial rail on desktop instead of repeated centered fade-in/fade-out review scenes.
- Mobile reviews now read as a clean vertical sequence with no sticky scroll choreography.
- Made the three photos in the Built by Students section draggable with mouse or trackpad pointer input.
- Drag positions are bounded so photos cannot be thrown far outside the collage.
- Touch devices keep normal page scrolling instead of capturing photo drag gestures.
- Rebuilt the Paint Care and Detail+ area as a clean editorial two-card composition.
- Removed the old diagonal card collision and Detail+ wipe treatment from the homepage.
- Reworked the clean-car statement to: "LIFE'S GOOD / IN A CLEAN CAR." with simplified spacing and no word-by-word motion.

## Files changed

- `src/app/page.tsx`
- `src/components/HomeArtMotion.tsx`
- `src/app/globals.css`

## Validation

- TSX syntax validated successfully with TypeScript's parser for both changed TSX files.
- CSS brace balance validated.
- Referenced image IDs verified in `src/data/images.ts`.
- Full `npm run typecheck` / production build could not be completed in this environment because package installation could not reach the npm registry (`EAI_AGAIN`). The source ZIP itself did not include `node_modules`.
