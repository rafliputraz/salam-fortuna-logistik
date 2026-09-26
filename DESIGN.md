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
A to-scale container ship at dusk (`lib/ship/model.ts`: a hull lofted from
cross-sections, ~2,600 instanced 40ft boxes, accommodation, funnel, nav
lights) making way on a reflective sea (`lib/ship/water.ts`, a port of
three.js's `Water` (MIT) that mirrors the real scene and ripples it with a
normal map of real water, `public/images/ship/waternormals.jpg`). Sky and
wake shaders are in `lib/ship/sea.ts`.

Scrolling turns the camera once round the ship (`lib/ship/scene.ts`,
`orbit()`): off the port bow, broadside, rising over the stern, round the far
side and back toward the bow as it pulls away. The orbit widens when she is
broadside so all 330 m stay in frame, and the ship is framed right of the
text on desktop, high in the frame on phones. three.js is dynamically
imported; the CSS poster gradient carries the hero until it lands.

Earlier hero experiments are in git history: a cut-out ship photo on the
sea (12342dd) and a terminal photo rebuilt in depth (edd4787).
