# Salam Fortuna Logistik: design system

Tokens live in `styles/tokens.css`; Tailwind maps them in `tailwind.config.js`.
Never add a raw colour or font-family in a component: add a token first.

## World
A container yard at noon. Cool daylight-white paper, navy ink, and painted
steel: the saturated colours of real boxes, in big blocks. One UI accent, the
SFL red, for actions and identity. Container paint is illustration only.

## Colour (OKLCH)
| Token | Use |
| --- | --- |
| `paper` / `paper-2` | page grounds |
| `ink` / `ink-2` / `ink-3` | text, strongest to quietest |
| `signal` / `signal-deep` | actions and identity only |
| `box-*` (magenta, orange, cobalt, green, mustard, steel, red) | container paint, never UI chrome |
| `go` | office-open state, used once |

Light theme only, by design: the colour-block concept depends on it.

## Type
- Display: Bricolage Grotesque 800, `opsz` 96, `wdth` 88 (`.t-display`, `.t-head`). Never italic.
- Body: Onest 400/500/600.
- Labels and codes: Martian Mono (`.t-label`).

## Shape
Surfaces and containers are square, like steel. Controls are pills.

## Paint utilities
- `.steel`: corrugated side of a box in `--c` (rib pitch `--rib`).
- `.steel-door`: a door end with seam and locking bars.

## Container photography
Real container photos, cut out and recoloured per paint, live in
`public/images/containers/{view}-{paint}.webp`. Use `containerSrc(view, paint)`
and `VIEWS` (intrinsic sizes) from `lib/containers.ts`. Views: `side`, `door`,
`angled20`, `angled40`, `open`, `top20`, `hanging`. A hanging box's cables sit
at 53.4% of its width; extend them with `cable.webp` tiled upward.

## Motion
- Hero: a stack of photographed boxes is set down tier by tier on load, the
  tiers lift apart as you scroll away, and they shift in depth under the mouse.
- Section headings rise in by the line (`data-split`); body content fades up
  (`data-reveal`).
- Port train: the page's one marquee, velocity-reactive.
- Journey: a box hangs from a crane, always swinging gently. It is lowered in
  as the section arrives; on desktop the section pins and, per leg, the crane
  hoists and slews it while it takes that leg's paint.
- Services: container doors swing open on hover, focus or tap, and peek open
  once in sequence when the wall first scrolls in.
- Agency: the real ship photo sails left to right on scroll over drifting swell.
- Contact: a rubber stamp lands on the booking label. CTA: a box swings on a hook.
- Footer: the wordmark boxes slide in from alternate sides.
- Promises: cards stack as sticky tiers.
- Every scroll effect has a reduced-motion path (no pins; doors fade).
- `Reveal` re-measures all triggers when the page height changes.

Earlier directions (dark cinematic WebGL hero with a ship on a reflective sea)
are in git history, last at c490814.
