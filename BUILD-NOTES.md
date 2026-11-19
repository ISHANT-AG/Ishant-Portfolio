# First working build — 16 November 2026

## Implemented
- White landing, actual CV-derived monochrome portrait cutout and continuously changing purple mind-scribble.
- Real Three.js curved gallery with ISHANT typography, autoplay, pointer drag/swipe, previous/next controls, project selection, pause and WebGL-unavailable fallback.
- Six case studies: commercial websites, FitHappns, Clapingo AI production, FFCS-Easy, Dubai editorial and Sony independent concept.
- Actual Codeista website capture, original FitHappns and Team India artifacts, Sony frame from the public project source; authored FFCS/GRIP/KATOSI cover illustrations.
- Expandable commercial site index, creative lab, isometric interactive tool keyboard and actual GitHub contribution snapshot.
- Founder recommendation attribution, delivery-speed story, four recorded courses, live sessions, career origin, campus leadership and contact.
- Responsive layout, native case-study dialogs, motion preference, clipboard feedback and working external/source/PDF links.

## Verification
- TypeScript check and production bundle pass.
- Browser inspection at 1280×720 and 390×844; no horizontal overflow at mobile width.
- Actual ring rendering/next-project selection inspected; project dialog opens and closes; Escape closes.
- Ten website links appear in expandable ledger; tool selection updates detail content.
- Four courses appear when expanded; copy-email returns success.
- Motion toggle freezes the scribble path and restores animation when enabled.
- No browser runtime errors recorded in inspected session.
- Local routes and selected assets checked for HTTP 200; GitHub snapshot validated for unique days/count integrity.

## Current boundary
Local preview only; no external deployment. GitHub data is a dated snapshot with a refresh command, not live polling. Some project covers are deliberately illustrative; final art direction can be refined with additional approved screenshots and the user's preferred portrait. This is an original implementation inspired by the supplied references, not an exact reconstruction of their source or animation choreography.

## Scribble revision — 18 November 2026

Replaced the generic sine-wave SVG with 11 vector outline frames traced from clean states in the supplied screen recording. Preserved their colors and registration; the sequence advances at 100 ms per frame rather than morphing between unrelated curves. Re-anchored the artwork to the crown of Ishant’s portrait. Captured all 11 browser-rendered states and confirmed a static purple-loop state under emulated prefers-reduced-motion. Fixed a first-frame timestamp race by clamping elapsed time to nonnegative values. Browser media emulation was cleared after QA. Evidence: `.research/mind-review/normal-clean` and `reduced-clean`.
