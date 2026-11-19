# Antigravity task: rebuild Ishant’s curved portfolio gallery

Work directly in the existing project:
`/Users/Ishant/Downloads/Portfolio`

This is a targeted refinement of a working portfolio, not a new website. Implement and verify the change. Do not stop after a plan.

## Reference and objective

Primary visual/interaction reference: https://aikawakenichi.com/

User-supplied interaction recording:
`/var/folders/2k/mg6lfm_93px0cyhl96y4ktp40000gn/T/TemporaryItems/NSIRD_screencaptureui_X08JJN/Screen Recording 2026-11-18 at 14.16.41.mov`

Reference overview contact sheet:
`.research/ring-reference/overview.jpg`

Recreate the reference’s curved image-gallery experience as closely as practical in geometry, proportions, perspective, choreography and interaction, personalized for Ishant Agarwal’s creative-development portfolio. The reference and recording are authoritative; the existing ring is not the target. Independently implement the experience using Ishant’s own work, rather than copying the photographer’s images or personal identity.

Watch the relevant recording and interact with the live reference before editing. Inspect the actual entrance, category navigation, opening, gallery layout modes, item zoom, close and return behavior. Do not invent an interaction trigger from screenshots. If the recording differs from the current live website, prioritize the supplied recording.

## Existing project

React + TypeScript + Vite, with Three.js already installed.
- `src/Ring.tsx`: current Three.js cylinder-segment gallery and controls.
- `src/style.css`: gallery styles among the existing page styles.
- `src/App.tsx`: page composition, selected work and native case-study dialogs.
- `src/data.ts`: project records, project IDs, live links, copy and collaboration credits.
- `src/Mind.tsx` / `src/mindFrames.ts`: recently corrected, reference-matched portrait doodle animation. Preserve these.
- `public/assets/`: supplied artifacts, Codeista website capture, Sony frame, FitHappns resources and Dubai editorial.

Read these first. Keep the existing `Ring({ motion, onOpen })` integration contract or update its callers carefully. Reuse project data and `onOpen(projectId)` to open the working case studies. Avoid duplicate project data.

Preserve the white landing page, portrait/mind animation, other page sections, tool keyboard, GitHub calendar, content, contact actions and attribution. Keep this task scoped to the gallery experience and the necessary integration. Do not replace unrelated styles or rebuild the app from a starter. Do not publish externally, change credentials or initialize another project.

## Why the current ring misses the reference

It currently reads as a low, open bowl seen from above. There are six narrow project panels, plain colored inner surfaces, visible metallic rims and synthesized title-heavy textures. The result is a rotating project-card cylinder.

The reference reads as a front-facing cylindrical image sculpture: broad, genuinely curved photographic surfaces, a much less exposed opening, huge editorial lettering behind it and a soft reflected continuation below. Its transitions and gallery states are essential, not optional polish.

## Required composition and geometry

1. Use a full-viewport-feeling stage inside the existing `#gallery` section, revealed after the white introduction. Keep subsequent portfolio sections reachable through normal scrolling.
2. Set monumental elegant black serif text **ISHANT** behind the sculpture, replacing the reference’s PORTFOLIO. Match its typographic scale, cropping, depth relationship and generous white space. Do not replace this with PLAY or another heading. Keep the text real DOM typography, not part of an image texture.
3. Tune camera height, distance, lens, cylinder radius, panel height and stage placement to match the reference’s frontal silhouette. The selected curved image should dominate the front; the ring must not resemble a shallow bowl with a large visible interior.
4. Build true continuous curved image surfaces. Do not arrange flat planes around a circle. Use sufficiently subdivided cylinder sections or a properly parameterized curved mesh with correct UVs.
5. Match the observed panel gaps and section proportions. Avoid thick silver rails, decorative torus rims and visibly blank inner walls. Handle reverse faces intentionally, without mirrored titles or distracting pale back surfaces.
6. Use image-led cover artwork from actual assets. Preserve image proportions through correct cover cropping; do not stretch screenshots. Keep explanatory copy outside the canvas. The final sculpture must not be mostly text blocks painted on colored rectangles.
7. Recreate the restrained, vertically fading reflection below the sculpture. Match the reference’s reflected image content and falloff; avoid a second fully readable cylinder or a dark floor.
8. Keep lighting and materials quiet: accurate image color, subtle depth, clean white surroundings. Do not add bloom, neon, particle decoration or a metallic product-render aesthetic absent from the reference.

Use reference-derived proportions as the authority rather than fixed guessed camera values. Review at the reference recording’s aspect ratio and at the actual local browser size.

## Personalization and content mapping

Use three broad categories, corresponding to the reference’s three category worlds:

**BUILD**
- Commercial web systems, using actual Codeista capture and existing client links.
- FFCS-Easy, retaining equal contribution credit with Prisha Sharma.
- Sony WH-1000XM6 independent concept and the existing creative-development experiments.

**DESIGN**
- FitHappns workshop and supporting learning resources.
- Team India Properties / Dubai editorial and campaign work.

**AUTOMATE**
- Clapingo AI Blog Image Tool.
- Thumbnail Engine and the described n8n workflow work.

The three main curved surfaces navigate these categories. Category galleries expose the relevant individual projects and connect to existing case studies or verified live/source destinations.

Use the best existing actual assets. An authored composite of actual artifacts is fine where no single hero exists; do not fabricate dashboard screenshots or label an illustration as a shipped UI. Do not add unsupported clients, logos, testimonials or performance claims. Keep Sony labelled as an independent concept; retain collaboration credits already in the data.

## Motion and interaction

Implement the observed reference flow, including:
- The compact/top-down segmented-ring entrance resolving into the frontal gallery, if confirmed by the recording. Make it a contained entrance, not a site-blocking loader.
- Gentle idle movement and category rotation with the reference’s weight, duration and easing.
- Pointer/touch manipulation where observed, with inertia that settles predictably.
- Previous/next category controls. Selected image, label and controls must remain synchronized.
- The observed surface separation/opening and image-fragment transition into a category gallery. This must visually connect the sculpture to the category view rather than crossfading to an unrelated modal.
- Category items with reference-like browse, zoom and close behavior. Adapt photography zoom to meaningful project-artifact inspection; provide an explicit route to the existing case study or live work.
- The observed gallery/list/strip mode switching, after confirming exactly which reference control triggers each mode.
- A coherent reverse transition from category/zoom back to the ring, preserving category orientation and selection.

Model explicit states such as `entering`, `ringIdle`, `categoryTransition`, `categoryGallery`, `itemZoom` and `returning`. Handle fast repeated clicks, interrupted transitions, resizing and route/section changes without stranded overlays, mismatched labels or duplicate timelines. Animate actual scene parameters rather than swapping a screenshot or playing a pre-rendered ring video.

The original recording is the authority for timing and transition shape. Match it before introducing personal stylistic changes.

## Controls

Recreate the compact bottom dock: selected-category thumbnail, category name, previous/next controls and the appropriate mode/return control. Use lucid hover/focus labels such as View, Back and Close where relevant. Keep the dock anchored within the gallery stage and safely above mobile browser chrome.

Use semantic HTML buttons, readable focus states and keyboard support. Provide keyboard/touch equivalents for hover-only actions. Normal page scrolling must continue outside any intentionally active gallery state. Do not hijack the whole document’s wheel events or trap visitors in the section.

## Engineering and accessibility

Continue with Three.js. GSAP and its React integration are appropriate if needed for the choreography; add dependencies only when justified. Scope and clean up timelines, listeners and animation loops under React StrictMode. Do not rebuild meshes or push React state on every render frame.

- Keep texture loading, camera fitting, geometry and interaction state separated enough to maintain.
- Cap device pixel ratio; prepare sensible texture sizes; avoid unnecessary high-cost post-processing.
- Reuse geometry/materials and dispose of GPU resources correctly.
- Pause nonessential animation when offscreen or the document is hidden.
- Respect the existing `motion` prop and prefers-reduced-motion. Reduced mode should present a stable, usable gallery with immediate or gentle transitions and manual navigation.
- Preserve a useful non-WebGL fallback connected to the same real project data.
- Fit mobile through camera/layout adaptation, not by shrinking a desktop screenshot. Keep surfaces recognizable, labels readable and controls reachable. Verify at 390 px and a desktop width.

## Work and acceptance criteria

First inspect, then implement, then compare the rendered result against the recording. Do not ask me to approve routine technical choices; complete the scoped refinement.

The result is accepted when:
1. Its frontal silhouette, panel curvature, typography relationship, image treatment, spacing and reflection are recognizably close to the reference.
2. BUILD / DESIGN / AUTOMATE show Ishant’s own work and lead to working project destinations.
3. Entrance, category navigation, opening, gallery modes, zoom, close and return form a complete working loop matching the observed reference behavior.
4. There are no stretched images, backwards titles, large blank inner walls, clipped controls, accidental page-scroll locks or black/empty canvases.
5. Desktop, mobile, touch/keyboard, resize, motion-off and repeated-click behavior work.
6. Existing portrait scribble and unrelated portfolio sections remain intact.
7. `npm run build` passes and the changed interactions produce no browser runtime errors.

Use the existing local server if already running; otherwise run `npm run dev -- --port 5173`. Capture before/after screenshots and a short actual browser recording of the completed interaction, and inspect them before claiming the animation matches. Explain any remaining fidelity limitations honestly. Finish with the local preview link, changed files and concise validation notes.
