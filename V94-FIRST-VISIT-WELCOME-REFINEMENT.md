# V94 First-Visit Welcome Refinement

## What changed
- Slowed the first-visit vehicle opener into a two-beat sequence.
- Welcome message arrives oversized, holds briefly, then compresses smoothly into the top of the card.
- Vehicle question, search, remember control, account actions, and browse link reveal progressively after the welcome beat.
- Reduced the final vehicle-question scale so the finished card is calmer and less headline-heavy.
- Tightened the search/control proportions.
- Restyled Sign in / Create account as deliberate secondary pill actions.
- Preserved a motion-reduced state with the final layout shown immediately.
- Delayed desktop search autofocus until after the intro sequence so focus does not interrupt the animation.

## Validation
- Vehicle catalog QA: 1,427 unique entries passed.
- Site-context QA passed.
- SEO QA passed.
- 136 TS/TSX files transpile clean.
- CSS braces balanced.

## Build note
The workspace does not contain node_modules/.bin/next, so a local Next production build was not run. Vercel remains the semantic TypeScript/production build gate.
