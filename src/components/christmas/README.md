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

When adding new Christmas pieces, keep them in these folders and tag any line outside them with `CHRISTMAS`.
