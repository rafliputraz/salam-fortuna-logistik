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
- `Box` (components/Box.tsx): a 40ft container in CSS 3D, sized by `--u`.

## Motion
- Hero: the stack is set down tier by tier on load; on scroll it pins, turns
  ~70 degrees and opens into its tiers; it leans toward the mouse.
- Port train: the page's one marquee, velocity-reactive.
- Journey: pins on desktop; one box turns a quarter and repaints per leg.
- Services: container doors swing open on hover, focus or tap.
- Agency: the real ship photo sails across on scroll over drifting swell lines.
- Promises: cards stack as sticky tiers.
- Every scroll effect has a reduced-motion path (no pins; doors fade).
- `Reveal` re-measures all triggers when the page height changes.

Earlier directions (dark cinematic WebGL hero with a ship on a reflective sea)
are in git history, last at c490814.
