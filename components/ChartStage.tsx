'use client'

import { useRef } from 'react'
import { COMPANY, PRIMARY_CTA, telHref, VOYAGE } from '@/lib/company'
import { CHART, LANES, PORT_XY, PROJ, ROADS, formatLat, formatLon, project, toPath, toPoints, unproject, viewAt, type View } from '@/lib/chart'
import { GRATICULE, LAND } from '@/lib/chart-data'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { introPlaying } from './Intro'
import { ArrowRight, LEG_ICONS, Phone } from './icons'

const PNJ = PORT_XY.IDPNJ
/** Where the thing each view is about sits on screen: right of the text. */
const FOCUS: [number, number] = [0.64, 0.5]
/** Marker size is held constant on screen by scaling against this width. */
const BASE_W = 1800

/** The hero's view, then one per leg of the voyage. */
const HERO_VIEW = viewAt(PNJ.lon, PNJ.lat, 1900, FOCUS)
const LEG_VIEWS: View[] = [
  viewAt(107.4, -2.6, 1500, FOCUS), // booking: the whole network
  viewAt(PNJ.lon, PNJ.lat, 300, FOCUS), // origin: the yard at Panjang
  viewAt(104.9, -6.4, 820, FOCUS), // sea: through the Sunda Strait
  viewAt(PNJ.lon, PNJ.lat, 120, FOCUS), // clearance: alongside
  viewAt(104.95, -4.3, 780, FOCUS), // inland: up the Trans-Sumatra road
]

const vb = (v: View) => `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`

/**
 * The hero is a live electronic chart of the waters we work, and it is also
 * the first five minutes of a shipment. Lanes flow into Panjang, a radar
 * sweeps the port, and the crosshair reads out the position under the
 * pointer. Scroll on a wide screen and the chart pins and flies in: the whole
 * network, the yard, the Sunda Strait with a ship making her approach, the
 * berth, and the road inland, one leg of the voyage at a time.
 */
export default function ChartStage() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const svg = q<SVGSVGElement>('[data-chart]')[0]
      const reduce = prefersReducedMotion()

      const narrow = window.matchMedia('(max-width: 1023px)').matches
      const focus: [number, number] = narrow ? [0.5, 0.42] : FOCUS
      const cam = narrow ? viewAt(PNJ.lon, PNJ.lat, 1100, focus) : { ...HERO_VIEW }
      const apply = () => {
        svg.setAttribute('viewBox', vb(cam))
        svg.style.setProperty('--s', String(cam.w / BASE_W))
        const [lon, lat] = unproject(cam.x + cam.w * focus[0], cam.y + cam.h * focus[1])
        const pos = q('[data-cam-pos]')[0]
        if (pos) pos.textContent = `${formatLat(lat)}  ${formatLon(lon)}`
        const scale = q('[data-cam-scale]')[0]
        if (scale) {
          // Ground metres across the screen over screen metres (at 96 dpi).
          const ground = (cam.w / CHART.w) * (PROJ.lon1 - PROJ.lon0) * 111_320 * Math.cos((lat * Math.PI) / 180)
          const ratio = ground / (window.innerWidth * 0.000264)
          const nice = Number(ratio.toPrecision(2))
          scale.textContent = `1:${nice.toLocaleString('en-US')}`
        }
      }
      apply()

      // Crosshair and position readout under a mouse.
      const hair = q('[data-hair]')[0]
      const readout = q('[data-readout]')[0]
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || !hair) return
        const r = section.getBoundingClientRect()
        hair.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
        hair.style.opacity = '1'
        const m = svg.getScreenCTM()
        if (!m || !readout) return
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
        const [lon, lat] = unproject(p.x, p.y)
        readout.textContent = `${formatLat(lat)} ${formatLon(lon)}`
      }
      const onLeave = () => hair && (hair.style.opacity = '0')
      section.addEventListener('pointermove', onMove)
      section.addEventListener('pointerleave', onLeave)

      if (reduce) {
        return () => {
          section.removeEventListener('pointermove', onMove)
          section.removeEventListener('pointerleave', onLeave)
        }
      }

      // Arrival: the coast draws itself, the lanes come on, the headline rises.
      let split: SplitText | undefined
      let cancelled = false
      const intro = gsap.timeline({ delay: introPlaying() ? 2.2 : 0.2 })
      intro
        .from(q('[data-coast]'), { drawSVG: '0%', duration: 2.4, ease: 'power2.inOut' }, 0)
        .from(q('[data-landfill]'), { opacity: 0, duration: 1.2 }, 0.9)
        .from(q('[data-lane]'), { opacity: 0, duration: 0.8, stagger: 0.12 }, 1.1)
        .from(q('[data-port]'), { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.05, ease: 'back.out(2)' }, 1.3)
        .from(q('[data-radar]'), { opacity: 0, duration: 1 }, 1.6)
      Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(() => {
        if (cancelled) return
        split = SplitText.create(q('[data-headline]'), { type: 'lines', mask: 'lines' })
        intro
          .from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'power4.out', onComplete: () => split?.revert() }, 0.5)
          .from(q('[data-hero-fade]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 1)
          .from(q('[data-hud]'), { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' }, 1.4)
      })

      // Ships underway on the other lanes, for life.
      q<SVGGElement>('[data-traffic]').forEach((ship, i) => {
        gsap.to(ship, {
          motionPath: { path: `#lane-${ship.dataset.traffic}`, align: `#lane-${ship.dataset.traffic}`, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: 40 + i * 9,
          repeat: -1,
          ease: 'none',
          delay: -i * 7,
        })
      })

      const mm = gsap.matchMedia(section)
      mm.add('(min-width: 1024px)', () => {
        const legs = q('[data-leg]')
        const ticks = q('[data-tick]')
        const ship = q('[data-own-ship]')[0]
        gsap.set(legs, { autoAlpha: 0, y: 40 })
        gsap.set(q('[data-own-ship]'), { opacity: 0 })
        gsap.set(q('[data-road]'), { drawSVG: '0%' })
        gsap.set(q('[data-yard], [data-stamp], [data-truck]'), { autoAlpha: 0 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * (VOYAGE.length + 1)}`,
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              const at = self.progress * (VOYAGE.length + 0.6) - 1
              ticks.forEach((t, i) => t.classList.toggle('is-active', i <= Math.round(at)))
              const wpt = q('[data-wpt]')[0]
              if (wpt) wpt.textContent = String(Math.max(1, Math.min(VOYAGE.length, Math.round(at) + 1))).padStart(2, '0')
            },
          },
        })

        // Hero lifts away as the chart takes us to the first leg.
        tl.to(q('[data-hero]'), { autoAlpha: 0, y: -80, duration: 0.5, ease: 'power2.in' }, 0)
          .to(q('[data-legs]'), { autoAlpha: 1, duration: 0.3 }, 0.4)
          .to(cam, { ...LEG_VIEWS[0], duration: 1, onUpdate: apply }, 0)
          .to(legs[0], { autoAlpha: 1, y: 0, duration: 0.4 }, 0.6)
          .to(q('[data-lane]'), { strokeWidth: 2.4, duration: 0.5 }, 0.3)

        LEG_VIEWS.slice(1).forEach((view, n) => {
          const i = n + 1
          const at = i
          tl.to(cam, { ...view, duration: 1, onUpdate: apply }, at)
            .to(legs[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, at + 0.25)
            .to(legs[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.55)
        })

        // Leg-specific set dressing.
        tl.to(q('[data-yard]'), { autoAlpha: 1, duration: 0.3 }, 1.6)
          .to(q('[data-yard]'), { autoAlpha: 0, duration: 0.2 }, 2.2)
          .to(ship, { opacity: 1, duration: 0.2 }, 2.2)
          .to(ship, { motionPath: { path: '#lane-sunda', align: '#lane-sunda', alignOrigin: [0.5, 0.5], autoRotate: true, start: 0.1, end: 1 }, duration: 1.7, ease: 'none' }, 2.2)
          .to(q('[data-stamp]'), { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)' }, 3.7)
          .to(q('[data-stamp]'), { autoAlpha: 0, duration: 0.2 }, 4.25)
          .set(q('[data-road]'), { opacity: 1 }, 4.2)
          .to(q('[data-road]'), { drawSVG: '100%', duration: 0.9, ease: 'none' }, 4.2)
          .to(q('[data-truck]'), { autoAlpha: 1, duration: 0.1 }, 4.25)
          .to(q('[data-truck]'), { motionPath: { path: '#road-sumatra', align: '#road-sumatra', alignOrigin: [0.5, 0.5] }, duration: 0.9, ease: 'none' }, 4.25)
          .to({}, { duration: 0.6 })

        return () => gsap.set(cam, HERO_VIEW)
      })

      return () => {
        cancelled = true
        split?.revert()
        section.removeEventListener('pointermove', onMove)
        section.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope }
  )

  const [px, py] = PNJ.xy
  const [yx, yy] = project(105.29, -5.44)

  return (
    <section ref={scope} id="top" className="relative h-[100svh] min-h-[38rem] overflow-hidden bg-paper">
      {/* ---- The chart -------------------------------------------------- */}
      <svg
        data-chart
        aria-hidden="true"
        viewBox={vb(HERO_VIEW)}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ ['--s' as string]: HERO_VIEW.w / BASE_W }}
      >
        <defs>
          <radialGradient id="sweep-fade" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(200)">
            <stop offset="0" stopColor="oklch(84% 0.12 200)" stopOpacity="0.35" />
            <stop offset="1" stopColor="oklch(84% 0.12 200)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep-arm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="oklch(84% 0.12 200)" stopOpacity="0" />
            <stop offset="1" stopColor="oklch(84% 0.12 200)" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        <path d={GRATICULE} fill="none" className="stroke-cyan/[0.09]" strokeWidth={1} vectorEffect="non-scaling-stroke" />

        {/* Shallows: the coast stroked wide and faint, twice, like depth bands. */}
        <path d={LAND} fill="none" className="stroke-cyan/[0.05]" strokeWidth={26} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={LAND} fill="none" className="stroke-cyan/[0.07]" strokeWidth={11} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path data-landfill d={LAND} className="fill-land" />
        <path data-coast d={LAND} fill="none" className="stroke-cyan/70" strokeWidth={1} vectorEffect="non-scaling-stroke" />

        {/* Lanes in, route magenta, always flowing toward Panjang. */}
        {Object.entries(LANES).map(([k, pts]) => (
          <path
            key={k}
            id={`lane-${k}`}
            data-lane
            d={toPath(pts)}
            fill="none"
            className="lane-flow stroke-route"
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* The road inland, drawn in when the box leaves the port. */}
        <path id="road-sumatra" data-road d={`M${toPoints(ROADS.sumatra).replace(/ /g, 'L')}`} fill="none" className="stroke-signal" strokeWidth={2.5} vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
        <path data-road d={`M${toPoints(ROADS.bakauheni).replace(/ /g, 'L')}`} fill="none" className="stroke-signal/70" strokeWidth={2} vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />

        {/* Radar on Panjang, held at one size on screen at every zoom. */}
        <g data-radar transform={`translate(${px} ${py})`}>
          <g style={{ transform: 'scale(var(--s))' }}>
            {[70, 140, 210, 280].map((r) => (
              <circle key={r} r={r} fill="none" className="stroke-cyan/20" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            <path d="M-290 0H290M0 -290V290" className="stroke-cyan/10" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <g className="sweep" style={{ transformOrigin: '0 0' }}>
              <path d="M0 0 L280 0 A280 280 0 0 0 242.5 -140 Z" fill="url(#sweep-arm)" />
            </g>
          </g>
        </g>

        {/* Ports. */}
        {Object.entries(PORT_XY).map(([code, p]) => {
          const home = code === 'IDPNJ'
          return (
            <g key={code} transform={`translate(${p.xy[0]} ${p.xy[1]})`}>
              {/* The entrance pops this wrapper; the one inside holds the size. */}
              <g data-port>
              <g style={{ transform: 'scale(var(--s))' }}>
                <circle r={home ? 9 : 5} className={home ? 'ping fill-signal/40' : 'ping fill-cyan/30'} style={{ animationDelay: `${(p.lon * 7) % 2.6}s` }} />
                <circle r={home ? 7 : 4} className={home ? 'fill-signal' : 'fill-paper stroke-cyan'} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                <text x={home ? 14 : 9} y={4} className={`font-mono uppercase ${home ? 'fill-signal' : 'fill-ink-2'}`} style={{ fontSize: home ? 15 : 12, letterSpacing: '0.08em' }}>
                  {home ? `${p.name} · ${code}` : p.name}
                </text>
              </g>
              </g>
            </g>
          )
        })}

        {/* Traffic: other ships working the lanes. */}
        {(['malacca', 'java', 'north', 'borneo'] as const).map((k) => (
          <g key={k} data-traffic={k}>
            <g style={{ transform: 'scale(var(--s))' }}>
              <path d="M9 0 L-6 -5 L-6 5 Z" className="fill-cyan/80" />
            </g>
          </g>
        ))}

        {/* Leg set dressing. */}
        <g data-yard transform={`translate(${yx} ${yy})`} style={{ opacity: 0 }}>
          <g style={{ transform: 'scale(var(--s))' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-40 + (i % 4) * 22} y={-36 + Math.floor(i / 4) * 12} width={18} height={8} className={i % 3 ? 'fill-cyan/50' : 'fill-signal/80'} />
            ))}
            <text x={-40} y={-46} className="fill-ink font-mono uppercase" style={{ fontSize: 13, letterSpacing: '0.08em' }}>
              CY · stuffing &amp; seal
            </text>
          </g>
        </g>
        <g data-own-ship style={{ opacity: 0 }}>
          <g style={{ transform: 'scale(var(--s))' }}>
            <circle r={22} className="fill-signal/15" />
            <path d="M16 0 L-10 -8 L-6 0 L-10 8 Z" className="fill-signal" />
            <path d="M16 0 H70" className="stroke-signal" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </g>
        </g>
        <g data-truck style={{ opacity: 0 }}>
          <g style={{ transform: 'scale(var(--s))' }}>
            <rect x={-9} y={-6} width={18} height={12} rx={2} className="fill-signal" />
            <circle r={16} className="ping fill-signal/30" />
          </g>
        </g>
      </svg>

      {/* Screen furniture: vignette, scanlines. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_55%,transparent_30%,oklch(var(--c-paper)/0.85)_100%)]" />
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-paper/90 via-paper/50 to-transparent" />

      {/* Crosshair, following a mouse. */}
      <div data-hair aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 transition-opacity duration-300">
        <span className="absolute -left-[100vw] top-0 h-px w-[200vw] bg-cyan/20" />
        <span className="absolute -top-[100vh] left-0 h-[200vh] w-px bg-cyan/20" />
        <span className="absolute -left-3 -top-3 h-6 w-6 border border-cyan" />
        <span data-readout className="t-label absolute left-5 top-4 whitespace-nowrap bg-paper/80 px-2 py-1 text-cyan" />
      </div>

      {/* The leg stamp, over the berth. */}
      <div
        data-stamp
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-[64%] top-1/2 z-10 hidden -translate-x-1/2 -translate-y-[130%] scale-150 lg:block"
      >
        <span className="t-display block rotate-[-8deg] border-4 border-go px-5 py-2 text-[3rem] text-go">Cleared</span>
      </div>

      {/* ---- Hero -------------------------------------------------------- */}
      <div data-hero className="relative z-10 flex h-full flex-col justify-center pb-24 pt-28">
        <div className="shell">
          <p data-hero-fade className="t-label flex items-center gap-3 text-cyan">
            <span className="blink h-2 w-2 bg-signal" />
            {COMPANY.tagline} <span className="text-ink-3">/</span> {COMPANY.basePort.code}
          </p>
          <h1 data-headline className="t-display mt-6 max-w-[11ch] text-[length:var(--text-display)] text-ink">
            Cleared before you <span className="text-signal">berth.</span>
          </h1>
          <p data-hero-fade className="mt-7 max-w-[32rem] text-lg leading-relaxed text-ink-2">
            Sea freight, customs, trucking and ship agency out of Panjang, Lampung. One team,
            one file, one person who answers.
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className="btn-signal">
              {PRIMARY_CTA}
              <ArrowRight className="btn-arrow h-4 w-4" />
            </a>
            <a href={telHref} className="btn-line">
              <Phone className="h-4 w-4" />
              Call the desk
            </a>
          </div>
        </div>
      </div>

      {/* ---- The voyage, leg by leg (wide screens) ------------------------ */}
      <div data-legs className="invisible absolute inset-0 z-10 hidden items-center lg:flex">
        <div className="shell">
          <div className="bezel max-w-[30rem] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="t-label text-cyan">
                Waypoint <span data-wpt>01</span> / {String(VOYAGE.length).padStart(2, '0')}
              </p>
              <p className="t-label text-ink-3">How it moves</p>
            </div>
            <ol aria-hidden="true" className="mt-4 flex gap-1.5">
              {VOYAGE.map((leg) => (
                <li key={leg.code} data-tick className="h-1 flex-1 bg-ink/15 transition-colors duration-300 [&.is-active]:bg-signal" />
              ))}
            </ol>
            <ol className="mt-8 grid">
              {VOYAGE.map((leg, i) => {
                const Icon = LEG_ICONS[leg.code]
                return (
                  <li key={leg.code} data-leg className="[grid-area:1/1]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center border border-signal/60 text-signal">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="t-label text-ink-3">
                        Leg {i + 1} · {leg.code}
                      </span>
                    </div>
                    <h2 className="t-head mt-5 text-[3.2rem] text-ink">{leg.title}</h2>
                    <p className="mt-4 leading-relaxed text-ink-2">{leg.body}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {leg.detail.map((d) => (
                        <li key={d} className="t-label border border-cyan/30 px-3 py-1.5 text-cyan">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* ---- HUD --------------------------------------------------------- */}
      <div data-hud aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 border-t border-line/60 bg-paper/60 backdrop-blur-sm">
        <div className="shell flex items-center justify-between gap-6 py-3">
          <p className="t-label text-ink-3">
            Pos <span data-cam-pos className="text-ink">{`${formatLat(PNJ.lat)}  ${formatLon(PNJ.lon)}`}</span>
          </p>
          <p className="t-label hidden text-ink-3 md:block">
            Scale <span data-cam-scale className="text-ink">1:—</span>
          </p>
          <p className="t-label hidden text-ink-3 sm:block">
            Chart <span className="text-ink">Sunda · Java Sea · Malacca</span>
          </p>
          <p className="t-label hidden items-center gap-2 text-ink-3 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-go" /> Scroll to get underway
          </p>
        </div>
      </div>
    </section>
  )
}
