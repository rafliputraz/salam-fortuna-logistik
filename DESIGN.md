# Salam Fortuna Logistik: design system (Chart Room)

Tokens live in `styles/tokens.css`; Tailwind maps them in `tailwind.config.js`.
Never add a raw colour or font-family in a component: add a token first.

## World
A ship's bridge at night. The page is an electronic chart display in night
mode: deep-water navy, cyan charted linework, magenta for the planned route,
amber for our own ship. Amber is the one action colour, so a button always
reads as "this is you". The SFL red stays on the mark only.

## Colour (OKLCH)
| Token | Use |
| --- | --- |
| `paper` / `paper-2` / `land` | water, panels, land fill |
| `line` / `line-strong` | rules, bezels, grid |
| `ink` / `ink-2` / `ink-3` | text, strongest to quietest |
| `signal` / `signal-deep` | own ship and every action |
| `cyan` | coast, radar, readouts |
| `route` | shipping lanes, errors |
| `brand` | SFL red, identity only |
| `go` | office open, cleared, done |

Dark theme only, by design.

## Type
- Display: Big Shoulders Display 900, uppercase (`.t-display`, `.t-head`); `.t-outline` for hollow chart-line type.
- Body: IBM Plex Sans 400/500/600.
- Readouts, labels, buttons: IBM Plex Mono (`.t-label`).

## Shape
Square panels in `.bezel` frames with cyan corner brackets; buttons are
cut-corner console keys (`.btn-signal`, `.btn-line`).

## The chart
`lib/chart-data.ts` is generated from Natural Earth 1:10m land (public
domain) with d3-geo, Mercator, 93°E to 122°E. Do not edit it by hand.
`lib/chart.ts` projects lon/lat to chart units and back, and formats
positions. Markers sit inside `scale(var(--s))` groups so they keep one size
on screen at every zoom; linework uses `vector-effect: non-scaling-stroke`.

## Motion
- Boot sequence (`Intro`): once per session, then closes to a point.
- Chart stage: coast draws in, lanes flow, radar sweeps, traffic runs the
  lanes, crosshair reads out lat/lon. On desktop it pins and the camera
  flies through the five legs (network, yard, Sunda Strait with own ship,
  berth with CLEARED stamp, road inland). Phones get `VoyageList`.
- Ticker: the one marquee.
- Instruments: six live gauges; cards power on with a flicker and the title
  scrambles in; a light follows the pointer.
- Departures: split-flap board riffles in, and again on row hover.
- Port call: pinned; the ship crosses left to right, AIS tag updates, the
  checklist ticks off.
- Logbook: pinned horizontal log; the vision's words light as they pass.
- Transmit: signal meter idles and jumps as you type.
- Footer: wordmark letters rise with the last of the scroll.
- Every loop and scroll effect has a reduced-motion path.

Earlier directions (daylight container yard; dark cinematic WebGL ship) are
on the `redesign/container-ship-scroll` branch and in git history.
