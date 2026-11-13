# Nawab AI booth screen

A full-screen attract display for the Nawab AI booth: the real Nawab mascot
walking along the bottom of the screen, the "Nawab AI" wordmark on the left, and a
QR code to https://nawab.upailabs.org on the right.
Plain HTML, CSS and JS. No build step and no dependencies.

## Run it at the booth

1. Open the deployed URL in Chrome on the laptop.
2. Press **F11**, or press **F** / double-click the page, to go fullscreen.
3. The cursor hides after 2.5 seconds without mouse movement.

All fonts and assets are self-hosted. Once the page has loaded it keeps running
with no internet. On HTTPS (Vercel) a service worker also caches everything,
so even a reload works offline after the first visit.

Options (add to the URL):

| Option | Effect |
|---|---|
| `?city=varanasi` / `kanpur` / `noida` | That city's colour theme (default is Lucknow gold) |
| `?count=1` to `4` | Number of mascots (default 1) |
| `?wordmark=login` | Use the sign-in page's serif lockup (Cormorant Garamond) instead of the landing one (Fredoka) |
| `?nohint` | Skip the "Press F11" hint at start |

## Deploy on Vercel

Pick any one:

- **CLI:** `cd nawab-landing-page && npx vercel` (then `npx vercel --prod`). Accept the defaults. There's no framework and no build command.
- **Drag and drop:** at vercel.com/new, drag the `nawab-landing-page` folder in, or use the Vercel dashboard upload.
- **Git import:** push this folder to a GitHub repo, then on vercel.com/new choose "Import Git Repository". Framework preset: Other. Build command: none. Output directory: `.` (root).

To preview locally: `python3 -m http.server 8000` inside this folder, then open http://localhost:8000.

## Where everything comes from

- **Mascot:** the SVG is copied unchanged from `frontend/app/components/NawabMascot.tsx` in
  [LucknowAI/nawab](https://github.com/LucknowAI/nawab), and its animations (blink, plume, walk cycle, wave,
  bow, moustache twirl, ponder) are copied verbatim into `mascot.css` from `frontend/app/globals.css`.
  This is the same code the live site (nawab.upailabs.org) ships. While walking, the booth uses the
  same walk cycle with a wider arm and leg swing (24° legs, 28° arms) so it reads from across the room.
- **Wordmark:** the landing hero `.nawab-landing__title`: Fredoka Light (300), letter-spacing 0.1em,
  "Nawab" in ink `#1C1525`, "AI" in the city colour, with the pulsing ✦ above it (Google Sans glyph).
- **Background monument:** `lucknow-motif.webp` is the product's own Rumi Darwaza banner,
  `frontend/public/lucknow-motif.svg` (used by `LucknowMotif.tsx`). Its central gate was rendered once at
  2560×1440, recoloured to the city gold `#C8782E`, trimmed above the bottom frame strip (which held a small
  "NAWAB AI" name tag), and fills the whole screen at 10% opacity. The original SVG is 15 MB, so a WebP is shipped instead.
- **Colours:** the `:root` and per-city tokens from `globals.css`. Background is ivory `#faf8f5`.
- **Licences:** Nawab code is MIT (see `LICENSE-nawab-MIT.txt`). Fredoka, Google Sans and Cormorant Garamond
  are SIL Open Font License 1.1 (see the `OFL-*.txt` files).

## Files

`index.html` markup, mascot SVG and QR SVG · `lucknow-motif.webp` background monument · `qr-nawab.svg` the QR on its own (generated offline with python `qrcode`, error correction M) · `booth.css` tokens, fonts, layout · `mascot.css` the product's mascot
animations (verbatim) · `booth.js` wandering logic · `sw.js` offline cache · `fonts/` self-hosted woff2 files.
