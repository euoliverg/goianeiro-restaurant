# media/ — Goianeiro master library

Original photos, raw videos, Instagram originals and finished campaign files. **Local only:** everything here except this README is ignored by git and excluded from the Vercel deploy (~210 MB). The website itself only uses the optimized copies in `assets/` and `brand/export/`.

```
media/
├── brand/
│   ├── logos/                 original logo artwork
│   └── identity/              flyers and other brand material
├── menu/                      one folder per site menu tab
│   ├── brazilian-plates/      Prato com espetinho, Na chapa, Marmita de churrasco
│   ├── buffet/                buffet trays and buffet dishes
│   ├── burgers/               burger photos (which burger: still to be confirmed)
│   ├── breakfast/             pão de queijo, pão de sal
│   ├── desserts/              pudim, pavê, chocolate & cream
│   ├── sides/                 torresmo & mandioca frita (+ couve)
│   └── menu-boards/           official menu boards / price lists (keep every version)
├── videos/
│   ├── brazilian-plates/      raw kitchen footage
│   ├── burgers/
│   ├── promotional/           brand film (AI-generated, Google Flow)
│   └── instagram-originals/   @goianeiro_ reels used as sources for the site (ig-<post code>-<topic>.mp4)
├── social-media/
│   ├── instagram-reels/       finished Reels (+ previous-versions/)
│   ├── thumbnails/            Reel covers
│   └── audio/                 original soundtracks
└── review-needed/             files whose content or origin must be confirmed before use
```

## Naming rules
- lowercase, hyphens, English words; Brazilian dish names keep their Portuguese name without accents (`feijao-tropeiro-main.jpg`, `pudim-de-leite-main.jpg`).
- `<dish>-<what the shot shows>[-NN].<ext>`: `-main` for the hero shot, `-takeout`, `-tray`, `-01/-02` for alternative shots.
- Never name a file after a product unless the photo was confirmed to be that product — use `review-needed/` or a descriptive name instead.
- Never overwrite: add `-02`, `-03`…; keep superseded edits in `previous-versions/`.

## Adding a new photo to the site
1. Save the original here in the right folder.
2. Export web sizes to `assets/img/<dish>-<width>.{avif,webp,jpg}` (same base name as the existing ones) and reference them in `index.html`.
3. Add a row to `docs/asset-inventory.csv` and update `docs/menu-inventory.csv`.

The full list of files, where each one came from and what it shows is in `docs/asset-inventory.csv`; the 12 Oct 2026 reorganization is described in `docs/organization-report.md`. `node docs/restore-original-layout.mjs` puts the moved files back in their old `_source/` / `marketing/` folders if ever needed.
