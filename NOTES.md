# Project notes — Wave Hrang Petrole dossier

## Deliverable
Single-page cinematic "master character file" website. Green/white, cute dinosaurs,
toggleable gimmicks, Thai language. Built with vanilla HTML/CSS/JS (ES modules), no framework.

- Project dir: `/home/ubuntu/wavefile`
- Dev server: `node server.mjs` → 0.0.0.0:3000 (static server for `public/`)
- Publish shape: static build, `command: "true"`, `outputDirectory: "public"`
- Routes: single page `/` (`public/manus-routes.json`)

## Structure
```
public/
  index.html            (acts + HUD; lore injected between @LORE-START@/@LORE-END@)
  css/base.css          tokens, themes, atmosphere, buttons
  css/acts.css          boot · gate · messages · reveal
  css/dossier.css       file bar, spine, hero, gallery, lore blocks, chibi dock
  css/hud.css           control deck, switches, dino crew
  js/main.js            act orchestration
  js/boot.js gate.js messages.js reveal.js     the four cinematic acts
  js/fx.js              rose rain, watching eyes, particle canvas
  js/dinos.js chibi.js gallery.js lore.js glitch.js hud.js audio.js
  js/config.js state.js util.js qa.js
  js/opening-lines.js   GENERATED verbatim from content/source.txt
  assets/               rose(.webp/_light), eyes(_light), chibi1-8, emblem_red/lime, favicon.png
  assets/characters/    supplied original character JPGs (char-01..04)
  assets/captures/      dossier-graded WebP versions used by the gallery
  fonts/                self-hosted woff2 + fonts.css
content/source.txt      user's original text (authoritative)
tools/build_lore.py     regenerates lore HTML + opening-lines.js
```

## Fidelity rules
- Profile text (source lines 49–98) is reproduced character-for-character.
- Opening messages (source lines 3–5) reproduced verbatim incl. the user's own spelling
  ("เเต่อ่าน", "เเล้ว", "รีเเอคชั่น").
- Do NOT change wording. Layout/decoration is free.

## URL flags (QA / convenience)
`?act=file|gate|msg|reveal` jump into an act · `&hold=1` play but never auto-leave · `?hud=1` open deck.

## Asset sources (original, user supplied)
- rose gif: https://www.image2url.com/r2/default/gifs/1791818131105-934da7c5-a0b4-494c-9b68-955ffa584bc5.gif
- eyes gif: https://www.image2url.com/r2/default/gifs/1791818173646-17a850b0-fdbc-4558-a25b-aab04a257489.gif
- strobe art: https://i.postimg.cc/N0Q3rv3K/... and https://i.postimg.cc/G3v6z2bD/...
- chibi 1–8: https://i.postimg.cc/{g2F4nyCk,Bn9NX5rn,8zQwjd2k,pLbkpQwd,FR8CpMBk,LXwQDcbY,j5LkzxZw,4xQMGFYm}/...
- Full-body character shots are now the working set:
  `3rGLjJgj`, `YqwddK3x`, `MK8992Dm`, `Kvy00SNP` → saved as original JPGs,
  then graded into `public/assets/captures/` for the dark emerald dossier frames.

## Asset processing notes
- rose/eyes GIFs have black backgrounds; keyed to alpha in two variants:
  - `rose.webp` / `eyes.webp` = "glow" (additive-looking, for DARK scenes)
  - `rose_light.webp` / `eyes_light.webp` = "cutout" (for the light bio theme)
- fx.js `roseSource()` picks the variant from the active act + theme; refresh on act change.
- chibis: alpha already clean; de-fringed + trimmed + resized to 460px wide.
- character captures: source JPGs are kept intact; gallery uses a derived WebP with
  compressed highlights, restrained emerald grade, dark frame overlay and readable metadata.

## Screenshot gotcha
The webdev screenshot tool forces sub-1 opacity elements to full opacity and freezes
animations; it can therefore show hidden layers and can capture before images decode.
Verify real state with headless chromium (`/usr/bin/chromium`) or `public/__debug.html`.
