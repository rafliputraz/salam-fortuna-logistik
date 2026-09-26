# Salam Fortuna Logistik: design system

Tokens live in `styles/tokens.css`; Tailwind maps them in `tailwind.config.js`.
Never add a raw colour or font-family in a component: add a token first.

## World
Night harbour. A dark, deep-water ground, one signal red taken from the SFL mark,
condensed industrial display type. Motion carries the story; it is never ambient filler.

## Colour (OKLCH)
| Token | Use |
| --- | --- |
| `abyss` 15% 0.028 238 | page ground |
| `hull` / `hold` | raised grounds, image placeholders |
| `rule` / `rule-strong` | hairlines, stencil outlines |
| `foam` / `steel` / `fog` | primary, secondary, tertiary text |
| `signal` (+ `deep`, `lift`) | identity and action only; `deep` for button fills, `lift` for small red text |
| `go` | office-open state, used once |

The page is dark-only by design (the cinematic hero depends on it). One accent. No second hue in UI.

## Type
- Display: Big Shoulders Display 800, uppercase, `.t-display` / `.t-head`. Never italic.
- Body: Instrument Sans 400/500.
- Data: JetBrains Mono, `.t-label` (uppercase, 0.14em). Labels, codes, captions only.

## Shape
Surfaces are square. Controls (buttons, chips, nav) are pills. Nothing in between.

## Motion
- Easing tokens `--ease-out`, `--ease-in-out`; press = `scale(0.97)` over 140ms.
- Scroll story: `components/ShipStory.tsx` pins one screen and scrubs a camera through
  five keyframes (`lib/ship/scene.ts`). Chapters cross-fade against the same progress.
- Horizontal route: `components/Voyage.tsx`, desktop only.
- One marquee per page (`PortBand`), velocity-reactive.
- Every scroll effect has a reduced-motion path: no pins, still frame, plain text.

## The hero scene
The hero is a single photograph of a container terminal, rebuilt in depth
(`lib/terminal/scene.ts`):

- `public/images/terminal/photo.webp`: the photo (2000x1334).
- `depth.png`: a depth map estimated offline with Depth Anything V2, dilated
  a few pixels so object edges keep their own depth. It lifts a 520x347 mesh
  into relief in the vertex shader.
- `mask.png`: the same depth, undilated; per pixel it decides what is sky.
- `sky.webp`: the sky with the cranes painted out (OpenCV inpainting), set
  far behind the relief and drifting slowly.

Seen from the origin with the photo's field of view the scene is exactly the
photograph. Shots magnify with lens zoom and move the camera only 10-20 m,
because the relief holds up to modest moves only; the view is clamped so it
never runs past the photo's edges. Portrait screens use gentler zoom.
The chapter text moves to the right when a shot's subject is on the left,
and the scrim follows it. three.js is dynamically imported; the CSS poster
gradient carries the hero until the images land.

An earlier version used a cut-out ship photo on a reflective sea; it is in
git history at commit 12342dd if it is ever wanted back.
