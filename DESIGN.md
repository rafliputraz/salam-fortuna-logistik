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
A real container ship photograph (`public/images/ship/ship.webp`, cut out of
its background with a segmentation model) lifted into 3D relief by a depth map
(`ship-depth.png`, estimated offline with Depth Anything V2; sharp across the
hull and stow, softened on thin rigging so masts don't tear). `lib/ship/photo.ts`
displaces a dense mesh by that depth, drops each column so the hull sits on the
water, and folds the canvas below the waterline flat onto the sea as the foam
skirt. The sea is `lib/ship/water.ts`, a port of three.js's reflective `Water`
(MIT) with a normal map of real water; sky and wake are in `lib/ship/sea.ts`.

Scrolling swings the camera round her (`ARC` in `lib/ship/scene.ts`): from the
photographer's exact angle, out past her stern quarter, up over the stow and
round toward her bow. A photo only has one side, so the arc stays within about
25 degrees either way; a full 360 would need a textured 3D model of the ship.

Earlier hero experiments are in git history: a procedural 3D ship with a full
orbit (9dc56c0) and a terminal photo rebuilt in depth (edd4787).
