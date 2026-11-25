# Christmas (seasonal)

Everything Christmas lives in three places:

- `src/components/christmas/` (this folder): components + `christmas.css`
- `public/christmas/`: images
- Lines tagged `CHRISTMAS` in the rest of the app (`grep -rn "CHRISTMAS" src`)

## To remove
1. Delete `src/components/christmas/` and `public/christmas/`
2. Delete every line `grep -rn "CHRISTMAS" src` finds

## Currently in
- Homepage curved tape: holiday copy linking to Gift Cards (`tape.ts`). The original tape line is in a comment right above it in `src/app/page.tsx`; restore it when removing.
- Sitewide: very light snowfall (`Snowfall`, used in `src/app/layout.tsx`). Off in /book and /get-a-quote and for reduced-motion visitors.
- Homepage hero: two hanging ornaments that swing with the mouse (`XmasOrnaments`, used in `src/app/page.tsx`)
- Sitewide: snow piles on MENU, the hero vehicle field, the mobile Book bar, and Ask us (`SnowCaps`, used in `src/app/layout.tsx`). Targets are the `TARGETS` list at the top of `SnowCaps.tsx`.
- Sitewide: green accents (pine on cream, frost green on dark) on small labels, review/footer headings, Services "plus" bullets, and a green→red gradient on the homepage "Built by students" section. All in `christmas.css` under "Christmas green accents"; red stays the action color.

- Header logo (every page): Santa hat, CSS only in `christmas.css`
- About page: Santa hats on the leads and Tier 3 techs, elf hats on everyone else, on their heads — CSS only in `christmas.css` (keys off each card's `data-role`), images in `public/christmas/`
- Hat components: `SantaHat` and `ElfHat` in `Hats.tsx`

- Open menu: frost-green labels, "Holiday" tag on Gift Cards, snow on Book a detail, a strand of lights along the bottom (`light-strand.svg` / `light-glow.svg`) — CSS in `christmas.css`, snow target in `SnowCaps.tsx`
- Gift Cards page: pine hero, "Holiday edition" kicker, ribbon + bow on every card face (`bow.svg`), green accents, light strand on the rewards band, snow on Continue to payment — CSS in `christmas.css`
- Booking + quote flows: green step labels/progress, snow on the final button, holiday note + one-time snow burst + gift card nudge on the confirmation / revealed quote (`HolidayNote`, tagged lines in `LiveBooking.tsx` and `QuoteRecommender.tsx`). No snowfall in these flows.

When adding new Christmas pieces, keep them in these folders and tag any line outside them with `CHRISTMAS`.
