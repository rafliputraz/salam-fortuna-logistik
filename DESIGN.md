# Salam Fortuna Logistik: design system (Corporate Modern)

Tokens live in `styles/tokens.css`; Tailwind maps them in `tailwind.config.js`.
Never add a raw colour or font-family in a component: add a token first.

## World
A global forwarder's site with a Panjang address: calm, assured, light.
Photography carries the colour; the interface stays neutral. The SFL red is
the only accent and always means "act". One deep navy band (ship agency)
and the navy footer give the page its weight.

## Colour (OKLCH)
| Token | Use |
| --- | --- |
| `paper` / `paper-2` / `paper-3` | page, alternating bands, chips |
| `line` / `line-strong` | borders, rings |
| `ink` / `ink-2` / `ink-3` | text, strongest to quietest |
| `deep` / `deep-2` | navy bands and footer |
| `signal` / `signal-deep` | actions, eyebrows, routes |
| `sky` | small details on navy |
| `go` | open, on track |

## Type
Plus Jakarta Sans throughout (400 to 800), drawn in Jakarta. `.t-display`,
`.t-h2`, `.t-h3` for headings with tight tracking; `.eyebrow` above each
section heading.

## Shape
Rounded: cards `rounded-3xl`, photo frames `2rem`, buttons and chips pills.
`.card` is white with a hairline border and a soft two-layer shadow.

## Photography
`public/images/photos/terminal.webp` (hero) and `ship-at-sea.webp`
(services lead card, ship agency).

## Motion
Restrained and smooth; nothing loops loudly.
- Hero: headline rises by line, the photo unmasks from an inset frame and
  settles from 1.25x, two glass cards float in; the shipment card ticks
  through its five stages. Photo drifts on scroll.
- Statement: the sentence brightens word by word on scroll; figures
  (counted from the site's own data) count up once.
- Services: bento cards fade up and lift on hover; the lead photo zooms.
- Process: sticky step list, active step follows the card in view, a red
  rule fills down the list.
- Coverage: map drawn from Natural Earth coastline (`lib/chart-data.ts`,
  generated, do not edit); routes draw in and keep flowing, ports pop,
  hovering a port lights it on the map.
- Ship agency: photo opens from an inset frame to full width on scroll.
- Standards: red rules draw across each promise.
- Footer: the call card rises and settles as it arrives.
- Every effect has a reduced-motion path.

Other directions: `main` (daylight container yard) and
`redesign/chart-room` (night-mode electronic chart).
