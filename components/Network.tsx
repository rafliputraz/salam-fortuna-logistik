'use client'

import { useRef, useState } from 'react'
import { PORTS } from '@/lib/company'
import { LANES, PORT_XY, toPath } from '@/lib/chart'
import { LAND } from '@/lib/chart-data'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/** The map's frame in chart units: Sumatra to Sulawesi. */
const VIEW = { x: 120, y: 120, w: 2200, h: 1380 }

/**
 * Coverage. A light map of the waters we work, drawn from Natural Earth
 * coastline: the routes into Panjang draw themselves in and keep flowing,
 * the gateways pop up, and pointing at a port in the list lights it on the
 * map.
 */
export default function Network() {
  const scope = useRef<HTMLElement>(null)
  const [hot, setHot] = useState<string>('IDPNJ')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      gsap
        .timeline({ scrollTrigger: { trigger: q('[data-map]')[0], start: 'top 70%', once: true } })
        .from(q('[data-land]'), { opacity: 0, duration: 1 })
        .from(q('[data-route]'), { drawSVG: '0%', duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0.2)
        .from(q('[data-dot]'), { scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.06, ease: 'back.out(2.5)' }, 0.8)
    },
    { scope }
  )

  return (
    <section ref={scope} id="network" className="bg-paper-2 py-24 md:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow">Coverage</p>
          <h2 data-split className="t-h2 mt-4 text-ink">
            Based in Panjang. Booking across Indonesia.
          </h2>
          <p data-reveal className="mt-5 text-ink-2">
            Panjang is home and where our own people are. Through the other main gateways we
            appoint and supervise the agent ourselves rather than hand you over.
          </p>
          <ul data-reveal className="mt-8 grid grid-cols-2 gap-2">
            {PORTS.map((p) => (
              <li key={p.code}>
                <button
                  type="button"
                  onPointerEnter={() => setHot(p.code)}
                  onFocus={() => setHot(p.code)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors duration-200 ${
                    hot === p.code ? 'bg-white font-semibold text-ink shadow-sm ring-1 ring-line' : 'text-ink-2 hover:bg-white/60'
                  }`}
                >
                  {p.name}
                  <span className={`text-[0.7rem] font-semibold ${hot === p.code ? 'text-signal' : 'text-ink-3'}`}>{p.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div data-map className="card relative overflow-hidden p-2 lg:col-span-8">
          <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="h-auto w-full rounded-[1.25rem] bg-white" role="img" aria-label="Map of Indonesian shipping routes into Panjang Port">
            <path data-land d={LAND} className="fill-ink/[0.08] stroke-ink/25" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {Object.entries(LANES).map(([k, pts]) => (
              <g key={k}>
                <path data-route d={toPath(pts)} fill="none" className="stroke-signal/25" strokeWidth={6} strokeLinecap="round" />
                <path d={toPath(pts)} fill="none" className="route-flow stroke-signal" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {Object.entries(PORT_XY)
              .filter(([code]) => code !== 'SGSIN')
              .map(([code, p]) => {
                const on = hot === code
                const home = code === 'IDPNJ'
                return (
                  <g key={code} transform={`translate(${p.xy[0]} ${p.xy[1]})`}>
                    {(home || on) && <circle r={16} className="ping-soft fill-signal/30" />}
                    <circle data-dot r={on ? 13 : 9} className={`transition-all duration-300 ${home || on ? 'fill-signal' : 'fill-ink'} stroke-white`} strokeWidth={4} />
                    {(home || on) && (
                      <g className="pointer-events-none">
                        <rect x={22} y={-26} rx={12} width={p.name.length * 19 + 36} height={48} className="fill-ink" />
                        <text x={40} y={8} className="fill-white font-sans" style={{ fontSize: 30, fontWeight: 600 }}>
                          {p.name}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
          </svg>
          <p className="absolute bottom-5 left-6 flex items-center gap-2 text-xs font-medium text-ink-3">
            <span className="h-0.5 w-5 rounded bg-signal" /> Routes we book into Panjang
          </p>
        </div>
      </div>
    </section>
  )
}
