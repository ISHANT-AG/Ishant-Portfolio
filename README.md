# Ishant Agarwal — Portfolio

A local React + TypeScript + Vite portfolio with a Three.js curved rotating project gallery, reference-matched SVG doodle flipbook, interactive isometric tool keyboard and a real GitHub activity snapshot.

## Run

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static host. This project has not been published.

## Content & assets

- `src/data.ts`: project narratives, source/demo links, client index and tool descriptions.
- `src/App.tsx`: page sections, native accessible case-study dialogs and SVG animation.
- `src/Mind.tsx` + `src/mindFrames.ts`: 11 hand-drawn colored outlines traced from the supplied video; a 100 ms/frame flipbook, with reduced-motion still and visibility-aware pausing.
- `src/Ring.tsx`: curved Three.js segments with actual sample images / authored project-cover artwork, drag controls, autoplay, pause and fallback.
- `src/style.css`: responsive layout and CSS 3D keyboard.
- `public/assets/`: selected supplied artifacts; actual Codeista website screenshot; a monochrome portrait cutout derived from the CV photo using image generation.
- FFCS-Easy card is an authored illustrative project cover, not a screenshot of the shipped UI. GRIP / KATOSI gallery visuals are original CSS illustrations linked to the actual demos.
- FitHappns sample PDFs retain their original review-edition labels. They are work artifacts, not health advice endorsed by this website.
- Sony is an independent concept, not a Sony commission. KATOSI review collaboration and FFCS equal contribution are credited.
- Private investor financial slides, compensation, unpublished Zoom access links and unrelated personal files are excluded.

## GitHub activity

`public/github.json` is a real dated snapshot, not simulated data. Refresh before deployment with:

```sh
npm run refresh:github
```

The script fetches the public GitHub contribution calendar without credentials, validates completeness and saves the period/count/refresh timestamp. A failed fetch preserves the previous file. The UI explicitly calls this a snapshot; it does not promise automatic refresh.

## Interaction & accessibility

- Gallery: drag/swipe, visible previous/next controls, case-study button, pause/resume. Clicking a panel opens that project.
- Mind artwork cycles through the reference’s original brain, strokes, flower, ART, scribble, stars, crown, loops, cloud, hearts and DESIGN frames. The global Motion button and operating system reduced-motion preference select a static loop frame. It stops advancing offscreen or while the document is hidden.
- Tool keys: click, tab/enter, or number-key shortcuts while the keyboard section is on screen.
- Case studies use native dialogs with Escape, backdrop close, focus containment and scroll locking.
- Contact: mail link, clipboard button with error feedback, actual LinkedIn/GitHub destinations.
- Local app needs no environment secrets or backend.

## Before public launch

Confirm selected artifact publication clearance and any updated role/timing/attendance details. Replace the AI-assisted cutout if a preferred current photo is supplied. Expand the selected design archive with approved investor/solar/course visuals if desired. Validate live client destinations and refresh GitHub at launch.
# Ishant-Portfolio
