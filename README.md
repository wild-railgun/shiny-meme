# Everlight — Wedding Photography Website

A static, dependency-free wedding photography site. Plain HTML, CSS and JavaScript —
no build step, no framework. Open `index.html` and it works.

## Structure

```
index.html          Every section of the site
css/style.css       All styling (numbered sections at the top of the file)
js/main.js          Nav, filtering, masonry, lightbox, form
assets/
  thumbs/           800px  — the gallery grid (lazy-loaded)
  gallery/          1600px — the full-screen viewer
  hero/             Hero, quote band and about images
Photos/             Original full-resolution files, untouched
```

`Photos/` holds the 29 originals (~90 MB). The site never loads them — it uses the
resized copies in `assets/`, which total about 9 MB, of which only ~2 MB is fetched
on first paint.

## Features

- Full-bleed hero, sticky header, mobile menu
- Filterable masonry gallery (All / Couples / Bridal / Ceremony / Details)
- Full-screen viewer: arrow keys, Escape, swipe, neighbour preloading, focus trapping
- About, pricing collections, testimonials, FAQ accordion, contact form
- Enquiry form with inline validation
- Responsive from 320px up; respects `prefers-reduced-motion`; print stylesheet
- Lazy-loaded images with width/height set, so nothing shifts as the page loads

## Making it yours

**Studio name and copy** — all in `index.html`. Search for `Everlight`.

**Contact details** — the `.contact-details` list near the bottom of `index.html`,
plus `STUDIO_EMAIL` at the top of `js/main.js`.

**Where the form sends enquiries** — by default, submitting opens the visitor's mail
client with everything pre-filled, so the form works with no server. To collect
enquiries online instead, sign up with a form service (Formspree, Basin, Netlify
Forms) and paste your endpoint into `js/main.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/your-id-here';
```

**Colours and type** — the `:root` block at the top of `css/style.css`.

## Adding or replacing photographs

1. Drop the full-size file into `Photos/`.
2. Create the two web copies: an 800px-long-edge version in `assets/thumbs/` and a
   1600px one in `assets/gallery/`, using the same filename.
3. Add a `<figure class="tile">` to the grid in `index.html`, copying an existing one.
   Set `data-cat` (couples / bridal / ceremony / details), `data-w` and `data-h` to the
   **1600px version's** pixel dimensions, `data-caption`, and a descriptive `alt`.

`data-w` and `data-h` drive the masonry row spans, so they must match the real aspect
ratio or that tile will crop oddly.

## Running it locally

Opening `index.html` directly from disk works. To serve it over HTTP:

```bash
npx http-server . -p 4321 -c-1
```

## Publishing

It is a folder of static files, so any static host works — Netlify, Vercel, GitHub
Pages, Cloudflare Pages, or plain shared hosting. Upload everything except `Photos/`,
which is only kept for re-exporting images later.

## Credits

Photographs are from Unsplash (contributor names are preserved in the filenames) and
are used here as placeholders. Swap in real client work before going live, and check
each photographer's licence if you keep any.
