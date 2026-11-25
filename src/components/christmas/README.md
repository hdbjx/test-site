# Christmas (seasonal)

Everything Christmas lives in three places:

- `src/components/christmas/` (this folder): components + `christmas.css`
- `public/christmas/`: images
- Lines tagged `CHRISTMAS` in the rest of the app (`grep -rn "CHRISTMAS" src`)

## To remove
1. Delete `src/components/christmas/` and `public/christmas/`
2. Delete every line `grep -rn "CHRISTMAS" src` finds

## Currently in
- Homepage hero: two hanging ornaments that swing with the mouse (`XmasOrnaments`, used in `src/app/page.tsx`)
- Sitewide: snow piles on MENU, the hero vehicle field, the mobile Book bar, and Ask us (`SnowCaps`, used in `src/app/layout.tsx`). Targets are the `TARGETS` list at the top of `SnowCaps.tsx`.
- Sitewide: green accents (pine on cream, frost green on dark) on small labels, review/footer headings, Services "plus" bullets, and a green→red gradient on the homepage "Built by students" section. All in `christmas.css` under "Christmas green accents"; red stays the action color.

When adding new Christmas pieces, keep them in these folders and tag any line outside them with `CHRISTMAS`.
