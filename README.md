# Goianeiro Restaurant — website

**Live:** https://goianeirorestaurante.com/ (Vercel)

**Deploy on Vercel:** import the repo (or drag the folder) with Framework Preset = **Other**, no build command, output directory = root. `vercel.json` sets security headers, cache rules and clean URLs. If the domain ever changes, replace `https://goianeirorestaurante.com/` in `index.html`, `robots.txt` and `sitemap.xml`.

Static, dependency-free site (HTML + CSS + JS). No build step: upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel).
If you move to your own domain, update the canonical / `og:url` / `og:image` / JSON-LD URLs in `index.html`, plus `robots.txt` and `sitemap.xml`.

**Run locally:** `python -m http.server 5173`, then open http://localhost:5173

## Structure
```
index.html              page + SEO (meta, Open Graph, Restaurant JSON-LD)
assets/css/styles.css   design system + layout
assets/js/main.js       CONFIG (address/phones/hours/order link), PT translations, interactions
assets/img/             AVIF + WebP + JPG at several widths
assets/video/           MP4 (H.264) + WebM (VP9), muted, with posters
_source/                original photos (not used by the page; don't deploy)
```

## Brand identity (`brand/`)
Open `brand/index.html` to see the full logo system: symbol, main logo (dark and light backgrounds), horizontal logo, seal, icon and palette.
It modernizes the original sign while keeping its symbols: the bull with horns, the cerrado sun, gold on charcoal, the US 🇺🇸 + Brazil 🇧🇷 flags (US on the left, Brazil on the right, as on the original) and "Minas e Goiás · Sabor de casa".
Ready-to-use files in `brand/export/`:
- `goianeiro-logo-vertical.png` (dark backgrounds) / `-fundo-claro.png` (light backgrounds), transparent, 3×
- `goianeiro-logo-horizontal.png`, `goianeiro-selo.png` (seal), `goianeiro-icone-perfil.png` (Instagram profile photo, 512×512)
- `goianeiro-mark-gold.svg` / `goianeiro-mark-dark.svg`: vector symbol for print/signage; `flag-us.svg`, `flag-br.svg`
- Fonts: Fraunces (wordmark) and Archivo (labels), both free on Google Fonts.

## Where the content came from (no invented facts)
- **Photos:** the 12 photos supplied by the owner (logo artwork + food).
- **Videos:** the restaurant's own public Instagram reels (@goianeiro_), trimmed and re-encoded:
  hero = sizzling steak plate · grill = churrasco skewers over coals · torresmo/mandioca bowl · buffet (with the reel's own "O sabor de Minas com o amor de Goiás" caption) · desserts.
- **Burger menu & prices:** Instagram post of 4 Oct 2026 (board items 01–04, 07–09, 12–16, 21).
- **Hours:** Instagram bio. **Burgers Thu–Sun 5–10 PM:** reel of 16 Sep 2026.
- **Breakfast from 6:30 AM** (pão de queijo, café com leite, coxinhas, pão de sal, bolos, salgados): announcement reel of 30 Sep 2026.
- **Story quote:** caption of the 15 Sep 2026 reel. "Melhor x-tudo de Seattle": caption of 16 Sep 2026.
- **Address & phones:** caption of the 19 Sep 2026 post.
- **Buffet dishes:** only dishes visible in the restaurant's reels/photos; no buffet prices are shown because none were published.
- **House plates (Oct 2026 update):** photos and video sent by the owner: Prato com espetinho (plate, to-go box, beans-pour video), costelinha assada, carne com batata, pão de sal (from an Instagram story) and dessert cups. No prices were supplied, so none are shown.

## ⚠️ Please confirm before launch
1. **Street number.** The Instagram **bio says 14334** 124th Ave NE; the **19 Sep post and the flyer say 14338**. The site uses **14338** (2 of 3 sources). Change it in `assets/js/main.js` → `CONFIG.address` and in the JSON-LD in `index.html`.
2. **Phones.** Both public numbers are shown: (843) 508-3226 (Jhon) and (425) 691-8936 (Pamela). Primary = Jhon's.
3. **Breakfast vs. hours.** The bio says doors open at 11 AM, but breakfast was announced for 6:30 AM. Update the bio or the site so they match (`CONFIG.hours` drives the "Open now" badge).
4. **House plates prices.** Prato com espetinho, Na chapa and Marmita de churrasco have no prices yet. Send them and they'll be added (and to the JSON-LD).
5. **Burger menu items 05, 06, 10, 11, 17–20** were cut off in the Instagram image. Send the full board and they'll be added.
6. **Online ordering / reservations.** No ordering platform or reservation system was found, so ORDER NOW and RESERVE A TABLE open a "call us" sheet. Paste a DoorDash/Toast/Square link into `CONFIG.orderUrl` and ORDER NOW will go there instead.
7. **Domain.** Canonical, Open Graph, JSON-LD and sitemap point to `goianeirorestaurante.com`.

## Hero 3D
- Brand film generated in Google Flow (original kept in `_source/hero-flow-original.mp4`), cut into a seamless 7s loop (1s cross-fade end→start).
- Desktop `hero-flow.mp4/.webm` (1280×720, ~1.6 MB); phones get a lighter portrait cut `hero-flow-m.*` (480×720, ~1.1 MB).
- Layers live at different depths (`--z`) inside one perspective scene; JS only sets `--mx/--my` (pointer) and `--p` (scroll), CSS does the rest.
- Mouse tilt only on fine-pointer desktops; embers canvas skipped on weak devices / Save-Data; everything static (poster only) with reduced motion.
- To swap the film: replace the files in `assets/video/hero-flow*` (keep the names) and the posters.

## Performance notes
- Videos load only when near the viewport, pause off-screen, and are skipped entirely (poster only) for reduced-motion, Save-Data or 2G users.
- Google Map loads only when the Visit section is near (or when someone taps "Show map").
- Responsive `<picture>`: AVIF → WebP → JPG.
