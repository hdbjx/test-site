# V36 Signature Motion + Mobile Art Direction

Homepage refinement based on the V35 composition-correction branch.

## Signature changes
- Rebuilt the curved transition as one continuous SVG tape band.
- Tape text moves continuously along the same path and reacts to scroll velocity/position.
- Rebuilt reviews as a 360svh pinned sequence: full-viewport review count, then three reviews revealed one at a time.
- Homepage logo hides for the complete pinned review scene and returns afterward.
- Restored playful overlapping student photography with a controlled center collage and larger typography.
- Added outside-click dismissal to the homepage menu.
- Restored secondary menu destinations: quote, paint correction, ceramic, service areas, blog, and account when configured.
- Reworked homepage menu button contrast and open state.
- Updated the homepage art-direction red to #D56865.

## Mobile art direction
- Full-screen mobile menu with large navigation, utility links, and 44px+ targets.
- Portrait-specific hero type proportions and navigation sizing.
- Compact curved tape transition.
- Service intro reflows intentionally for portrait screens.
- Work archive becomes a vertical contact sheet instead of desktop horizontal pinning.
- Student collage gets a contained portrait composition.
- Review story remains pinned with phone-specific type scale.
- Restore/Maintain and final CTA use dedicated mobile proportions.
- Safe-area spacing retained for mobile navigation.

## Validation
- Modified TSX files parsed successfully with TypeScript's parser.
- CSS brace balance verified.
- Referenced image IDs verified against the image registry.
- A full typecheck/build could not be completed because package installation timed out in this environment; the partial node_modules folder was removed from the deliverable.
