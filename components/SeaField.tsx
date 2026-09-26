'use client'

import { useRef } from 'react'
import { COMPANY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Everything is laid out inside a 1440×900 viewBox that is drawn with `slice`,
 * so the edges get cropped on wide screens. Keeping the artwork inside roughly
 * x 100–1350 and y 100–800 means nothing important is ever cut off, and the
 * left and right gutters — outside the 84rem text column — are where detail
 * can go without ever fouling the headline or the particulars plate.
 */

/** Depth contours off the approach: nested, shallowing toward the coast. */
const CONTOURS = [
  'M 640 300 C 810 268 960 232 1096 190 C 1230 148 1340 124 1470 106',
  'M 664 346 C 834 312 988 272 1126 228 C 1258 186 1362 160 1478 142',
  'M 692 396 C 860 360 1016 318 1154 272 C 1286 228 1386 202 1486 184',
]

/** Ambient trade lanes. */
const LANES = [
  'M -60 236 C 240 196 520 214 780 176 C 1020 142 1250 118 1520 96',
  'M -60 452 C 260 430 520 416 760 386 C 1000 356 1260 330 1520 306',
]

/**
 * The route the vessel works as you scroll out of the hero.
 *
 * It starts off the right-hand edge at every viewport width, so the vessel is
 * the reward for scrolling rather than something parked in open water at rest.
 * The lane is held low deliberately: the particulars plate is opaque and sits
 * above this layer, and a higher route would spend most of its travel hidden
 * behind it.
 */
const DESCENT =
  'M 1540 640 C 1300 700 1080 740 860 768 C 620 798 300 820 -60 840'

/**
 * Soundings in metres, deepening away from the coast.
 *
 * Everything sits in the two regions that stay clear of content at every
 * width: the band above and to the right of the particulars plate, and the
 * narrow wedge between the headline column and the plate. The left margin is
 * deliberately bare — the page gutter shrinks faster than a viewBox fraction
 * does, so anything parked there collides with the type on smaller screens.
 */
const SOUNDINGS = [
  { x: 1246, y: 250, v: '38' },
  { x: 1330, y: 176, v: '46' },
  { x: 1160, y: 320, v: '31' },
  { x: 1268, y: 402, v: '27' },
  { x: 1352, y: 330, v: '35' },
  { x: 1180, y: 468, v: '22' },
  { x: 1310, y: 494, v: '24' },
  { x: 744, y: 620, v: '17' },
  { x: 792, y: 702, v: '12' },
]

/** The fix on Panjang, in the open band above the plate. */
const FIX = { x: 990, y: 214 }

/**
 * Deck cargo for the vessel silhouette: three tiers, tapering upward the way
 * a real stow does. Drawn as individual boxes rather than blocks — at this
 * size the repetition is what reads as containers instead of a toy.
 */
const CONTAINER_W = 10
const CONTAINERS = [
  ...Array.from({ length: 10 }, (_, i) => ({ x: 22 + i * 13, y: 21 })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 28 + i * 13, y: 14 })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: 48 + i * 13, y: 7 })),
]

/**
 * Deterministic colour variation, so the stow has depth but never flickers.
 * Every box is lighter than the hull it sits on — at the size this renders,
 * boxes in the hull's own colour merge straight back into the silhouette and
 * the vessel loses the one detail that says "container ship".
 */
function containerFill(i: number) {
  if (i % 7 === 3) return '#e11b22'
  return i % 2 === 0 ? '#4c666e' : '#2c4a54'
}

/**
 * The hero's backdrop: the approach to Panjang, drawn the way a chart draws
 * it — depth contours, soundings, a latitude scale down the margin, and a
 * fix on the port itself. The trade lanes and the vessel sit on top of it.
 *
 * The vessel is parked in open water at rest and works its way down the lane
 * as you scroll into the next section, drawing its wake behind it. It is
 * deliberately the only ship here: a second, endlessly looping one would
 * compete with the scroll cue rather than add to it.
 */
export default function SeaField() {
  const scope = useRef<HTMLDivElement>(null)
  const descent = useRef<SVGPathElement>(null)
  const wake = useRef<SVGPathElement>(null)
  const ship = useRef<SVGGElement>(null)
  const hull = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)

      const intro = gsap.timeline({ delay: 0.25 })

      intro
        .from(q('[data-contour]'), {
          drawSVG: '0%',
          duration: 2.2,
          stagger: 0.18,
          ease: 'power2.inOut',
        })
        .from(
          q('[data-lane]'),
          { drawSVG: '0%', duration: 2.4, stagger: 0.2, ease: 'power2.inOut' },
          0.3
        )
        .from(
          q('[data-sounding]'),
          { opacity: 0, duration: 0.5, stagger: 0.06, ease: 'none' },
          0.9
        )
        .from(q('[data-tick]'), { opacity: 0, duration: 0.4, stagger: 0.04 }, 1.1)
        .from(q('[data-fix]'), { opacity: 0, scale: 0.4, transformOrigin: 'center', duration: 0.6 }, 1.3)

      // The one thing that keeps moving while the page sits still: a slow
      // sweep off the position fix, at the pace of a real radar, not a loader.
      gsap.fromTo(
        q('[data-ping]'),
        { attr: { r: 10 }, opacity: 0.55 },
        {
          attr: { r: 44 },
          opacity: 0,
          duration: 3.4,
          repeat: -1,
          repeatDelay: 1.2,
          ease: 'power2.out',
        }
      )

      // Scrubbed to the hero's own scroll range, so the vessel's progress is
      // the reader's progress rather than a timer running on its own.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: scope.current!.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7,
          },
        })
        .to(
          ship.current,
          {
            motionPath: {
              path: descent.current!,
              align: descent.current!,
              alignOrigin: [0.5, 0.5],
              // The lane runs right to left, so the tangent points at 180°.
              // Offsetting by the same amount cancels it out and leaves the
              // vessel upright; the glyph itself is drawn bow-left to suit.
              autoRotate: 180,
            },
            ease: 'none',
            // A scrubbed `to` sitting at progress 0 is not guaranteed to have
            // rendered, which would leave the vessel parked at the SVG origin
            // instead of at the head of its lane. Force the start state.
            immediateRender: true,
          },
          0
        )
        .from(wake.current, { drawSVG: '0%', ease: 'none' }, 0)

      // Kept off the motion path's transform so the two never fight.
      gsap.to(hull.current, {
        y: 3,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    },
    { scope }
  )

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="chart-grid absolute inset-0" />

      {/* Layer one: the busy background. It sits under the wash, so it can
          cross the headline column without ever competing with the type. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {CONTOURS.map((d) => (
          <path
            key={d}
            data-contour
            d={d}
            stroke="#b1c1c4"
            strokeOpacity={0.85}
            strokeWidth={1.25}
          />
        ))}

        {LANES.map((d) => (
          <path
            key={d}
            data-lane
            d={d}
            stroke="#b1c1c4"
            strokeWidth={1.25}
            strokeDasharray="2 7"
          />
        ))}

      </svg>

      {/* Keeps the background chart off the headline. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_54%_at_26%_42%,#f4f7f7_24%,transparent_76%)]" />

      {/* Layer two: the crisp marks. Placed in the margins and open water
          where they never touch the type, so they sit above the wash at full
          strength — a position fix you cannot read is not a position fix. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {SOUNDINGS.map((s) => (
          <text
            key={`${s.x}-${s.y}`}
            data-sounding
            x={s.x}
            y={s.y}
            fill="#4c666e"
            fillOpacity={0.55}
            fontSize={15}
            fontFamily="var(--font-mono), monospace"
            textAnchor="middle"
          >
            {s.v}
          </text>
        ))}

        {/* Graticule along the top edge, above the plate and clear of the
            headline — a chart's scale, put where there is room for it. */}
        <g stroke="#b1c1c4">
          <line data-tick x1={700} y1={120} x2={1440} y2={120} strokeWidth={1} />
          {Array.from({ length: 15 }, (_, i) => 700 + i * 50).map((x, i) => (
            <line
              key={x}
              data-tick
              x1={x}
              y1={120}
              x2={x}
              y2={i % 2 === 0 ? 138 : 130}
              strokeWidth={1}
            />
          ))}
        </g>
        <text
          data-tick
          x={700}
          y={106}
          fill="#4c666e"
          fillOpacity={0.55}
          fontSize={13}
          letterSpacing={2}
          fontFamily="var(--font-mono), monospace"
        >
          105°19′E
        </text>

        {/* The fix on Panjang itself. */}
        <g data-fix>
          <circle data-ping cx={FIX.x} cy={FIX.y} r={10} stroke="#e11b22" strokeOpacity={0.5} />
          <circle cx={FIX.x} cy={FIX.y} r={9} stroke="#e11b22" strokeWidth={1.25} />
          <circle cx={FIX.x} cy={FIX.y} r={2.5} fill="#e11b22" />
          <path
            d={`M ${FIX.x} ${FIX.y - 18} v -10 M ${FIX.x} ${FIX.y + 18} v 10 M ${FIX.x - 18} ${FIX.y} h -10 M ${FIX.x + 18} ${FIX.y} h 10`}
            stroke="#e11b22"
            strokeOpacity={0.65}
            strokeWidth={1.25}
          />
          {/* Label above the crosshair, not below it: the plate's top edge
              runs just under this mark at every width, and a label tucked
              behind an opaque panel is no label at all. */}
          <text
            x={FIX.x}
            y={FIX.y - 34}
            fill="#4c666e"
            fillOpacity={0.75}
            fontSize={13}
            letterSpacing={2}
            fontFamily="var(--font-mono), monospace"
            textAnchor="middle"
          >
            {COMPANY.basePort.code}
          </text>
        </g>

        <path ref={descent} d={DESCENT} stroke="none" />
        <path
          ref={wake}
          d={DESCENT}
          stroke="#e11b22"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />

        <g ref={ship}>
          {/* Container ship in profile, bow to the left, drawn to a real
              vessel's proportions: a long low hull roughly four times its own
              depth, a raked stem, the stow tapering up amidships, and the
              accommodation and funnel right aft where they belong. */}
          <g ref={hull} transform="translate(-85,-20) scale(0.85)">
            {/* Hull: sheer line, counter stern, flat run, raked bow. */}
            <path
              d="M6 28 C 50 30, 150 31, 194 30 L 193 41 C 190 45, 184 46, 176 46 L 30 46 C 18 46, 10 40, 6 28 Z"
              fill="#072027"
            />

            {CONTAINERS.map((c, i) => (
              <rect
                key={`${c.x}-${c.y}`}
                x={c.x}
                y={c.y}
                width={CONTAINER_W}
                height={7}
                fill={containerFill(i)}
              />
            ))}

            {/* Accommodation block aft, bridge wings, and the funnel — which
                is where a line actually carries its house colours. */}
            <path d="M152 29 V9 h26 v20 Z" fill="#4c666e" />
            <path d="M147 12 h36 v3 h-36 Z" fill="#072027" />
            <path d="M159 9 V1 h12 v8 Z" fill="#e11b22" />
            <path d="M186 29 V14 h1.5 v15 Z" fill="#4c666e" />
          </g>
        </g>
      </svg>
    </div>
  )
}
