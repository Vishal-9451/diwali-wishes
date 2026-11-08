# Diwali Wishes – Light Up Someone's World

A premium, fully working Diwali greeting experience: personalise a wish, open a real 3D gift box, light fireworks, draw rangoli, design and download a greeting card, and share it with a link or QR code.

> The wishes come from **68 hand-written templates** (13 relationships × English / Hindi / Hinglish × 6 tones). No generative AI is used and no API keys are needed – everything works offline.

## Features
- Cinematic intro (GSAP) with loading indicator, Skip Intro, no autoplay audio
- Personalisation studio: validation, live preview, editable wish, Regenerate / Shuffle / Copy
- 13 relationship categories; romantic tone is only possible for Crush / Girlfriend / Boyfriend
- Three.js gift box (ribbon, bow, shadows, drag/touch rotation, GSAP lid animation, golden particles) with 2D SVG fallback when WebGL is missing (`?renderer=2d` forces it)
- Celebration screen: 3D diya, Canvas fireworks (velocity, gravity, decay, particle cap, click/touch), rangoli decoration
- Rangoli studio: mouse / touch / pen / keyboard drawing, symmetry, colours, brush size, undo, clear, presets, PNG download
- Greeting card studio: 3 templates, font + size, live preview, 1800×2400 PNG and PDF export (Hindi preserved)
- Sharing: WhatsApp, native share (clipboard fallback), copy wish, copy link, QR code + QR download
- Music + SFX synthesised with Web Audio (original, no licensing issues); drop real files in `public/audio/` to override
- Accessible (semantic HTML, focus rings, labels, reduced motion), responsive from 320px

## Tech stack
HTML5, CSS3, Vanilla JS (ES modules), Vite, Three.js, GSAP, Canvas API, html2canvas, jsPDF, qrcode, Web Share API, Clipboard API, LocalStorage (preferences only), self-hosted fonts via Fontsource (Cormorant Garamond, Poppins, Noto Serif Devanagari, Playfair Display, Great Vibes).

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Production build
```bash
npm run build      # outputs to dist/
npm run preview    # http://localhost:4173
```

## Optional audio
Place any of `music.mp3`, `gift.mp3`, `firework.mp3` in `public/audio/` (only audio you own or that is properly licensed). Missing files are ignored and the built-in synthesiser is used.

## Share links
`?r=<recipient>&s=<sender>&c=<relationship>&l=<language>&n=<tone>&t=<templateId>` – only these non-sensitive values are included. All values are validated and sanitised; malformed links are ignored.

## Screenshots
Add screenshots to `docs/` and reference them here.

## Deploy to GitHub + Vercel
```bash
git init
git add .
git commit -m "Diwali Wishes"
git branch -M main
git remote add origin https://github.com/<your-user>/diwali-wishes.git
git push -u origin main
```
Then on [vercel.com](https://vercel.com) → **Add New Project** → import the repo. Framework: Vite, build command `npm run build`, output directory `dist` (already set in `vercel.json`).

## Project structure
See `src/js/` (`app.js`, `router.js`, `state.js`, `modules/`, `three/`, `utils/`, `data/wishes.js`) and `src/styles/`.

## License
MIT
