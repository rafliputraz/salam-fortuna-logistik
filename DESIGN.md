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
`public/images/photos/terminal.webp` (hero), `ship-head-on.webp` (ship
approach) and `ship-at-sea.webp` (services lead card, ship agency).

## Motion
Smooth and purposeful; loops stay quiet, scroll moments carry the energy.
- Global: Lenis smooth scroll; section headings rise by line; magnetic
  buttons (`Magnetic`, via the `translate` property so press scale still
  works); red scroll-progress rule on the header.
- Hero: headline rises by line, the photo unmasks and settles, then leans
  toward the mouse with the floating cards moving further (depth); the
  badge rolls through the services; the shipment card steps through its
  five stages on a loop; a dotted route with a ship runs along the foot.
- Port strip: marquee of gateways that speeds up and turns with scroll.
- Statement: brightens word by word; figures count up from the site's data.
- Ship approach (`ShipCross`): pinned; the head-on ship photo starts as a
  small hazy frame on the horizon under the headline, grows and rises to
  fill the screen, then keeps closing bow first; the headline turns white
  over her and swells away as she sails through it.
- Services: cards rise tilted back in turn; under a mouse they tip toward
  the pointer with a light following it; the lead photo zooms on hover.
- Process: sticky step list with a filling rule; cards stack on desktop,
  each lower card scaling back under an opaque shade.
- Coverage: routes draw in and flow, ships sail every route, ports pop,
  hover-linked port list, the map drifts on scroll.
- Ship agency: photo opens to full width; husbandry cards rise; two lines
  of big type slide against each other.
- Standards: red rules draw in; the vision lights word by word.
- Footer: the call card rises and settles.
- Every effect has a reduced-motion path.

Other directions: `main` (daylight container yard) and
`redesign/chart-room` (night-mode electronic chart).
