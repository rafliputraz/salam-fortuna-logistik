'use client'

import { useRef } from 'react'
import { PORTS } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/** The water each gateway is reached through. */
const WATERS: Record<string, string> = {
  IDPNJ: 'Sunda Strait',
  IDTPP: 'Java Sea',
  IDSUB: 'Java Sea',
  IDBLW: 'Malacca Strait',
  IDBTM: 'Singapore Strait',
  IDSRG: 'Java Sea',
  IDUPG: 'Makassar Strait',
  IDBDJ: 'Java Sea',
  IDBKH: 'Sunda Strait',
}

const COLS = [
  { key: 'code', label: 'Code', len: 5, wide: false },
  { key: 'name', label: 'Gateway', len: 13, wide: false },
  { key: 'waters', label: 'Via', len: 16, wide: true },
  { key: 'status', label: 'Status', len: 11, wide: true },
] as const

const ROWS = PORTS.map((p) => ({
  code: p.code,
  name: p.name,
  waters: WATERS[p.code] ?? '',
  status: p.code === 'IDPNJ' ? 'Home port' : 'Book+clear',
}))

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+'

/**
 * Gateways, on a split-flap board. When it scrolls in, every tile riffles
 * through the alphabet before it lands, row after row, the way the board at
 * a terminal settles. Hover a row and it riffles again.
 */
export default function Departures() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section || prefersReducedMotion()) return
      const rows = gsap.utils.toArray<HTMLElement>('[data-row]', section)

      const riffle = (row: HTMLElement, delay = 0) => {
        const tiles = Array.from(row.querySelectorAll<HTMLElement>('[data-tile]'))
        const start = performance.now() + delay * 1000
        const jobs = tiles.map((el, i) => ({ el, target: el.dataset.tile ?? ' ', end: start + 260 + i * 28 + Math.random() * 220 }))
        let last = 0
        const tick = () => {
          const now = performance.now()
          if (now - last < 45) return
          last = now
          let live = 0
          for (const j of jobs) {
            if (now < start) {
              live++
              continue
            }
            if (now >= j.end) {
              if (j.el.textContent !== j.target) j.el.textContent = j.target
              continue
            }
            live++
            if (j.target !== ' ') j.el.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
          }
          if (!live) gsap.ticker.remove(tick)
        }
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
      }

      const stops: Array<() => void> = []
      ScrollTrigger.create({
        trigger: section.querySelector('[data-board]'),
        start: 'top 75%',
        once: true,
        onEnter: () => rows.forEach((r, i) => stops.push(riffle(r, i * 0.12))),
      })
      const onEnter = (e: Event) => stops.push(riffle(e.currentTarget as HTMLElement))
      rows.forEach((r) => r.addEventListener('pointerenter', onEnter))
      return () => {
        stops.forEach((s) => s())
        rows.forEach((r) => r.removeEventListener('pointerenter', onEnter))
      }
    },
    { scope }
  )

  return (
    <section ref={scope} id="gateways" className="relative border-t border-line py-24 md:py-36">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="t-label text-cyan">Gateways · {ROWS.length} ports</p>
            <h2 data-split className="t-display mt-5 max-w-[12ch] text-[length:var(--text-display-s)] text-ink">
              Where we book and clear.
            </h2>
          </div>
          <p data-reveal className="max-w-sm leading-relaxed text-ink-2">
            Panjang is home and where our own people are. Everywhere else we appoint and
            supervise the agent ourselves rather than hand you over.
          </p>
        </div>

        <div data-board data-reveal className="bezel mt-14 overflow-x-auto p-4 md:p-6">
          <div className="min-w-max">
            <div aria-hidden="true" className="flex gap-6 px-1 pb-3">
              {COLS.map((c) => (
                <p key={c.key} className={`t-label text-ink-3 ${c.wide ? 'hidden md:block' : ''}`} style={{ width: `${c.len * 1.19}rem` }}>
                  {c.label}
                </p>
              ))}
            </div>
            <ul aria-label="Gateways we book and clear through">
              {ROWS.map((row) => (
                <li
                  key={row.code}
                  data-row
                  className="flex cursor-default gap-6 border-t border-line/60 px-1 py-2 transition-colors duration-200 hover:bg-ink/[0.03]"
                >
                  <span className="sr-only">
                    {row.name}, {row.code}, via {row.waters}. {row.status}.
                  </span>
                  {COLS.map((c) => {
                    const text = String(row[c.key]).toUpperCase().padEnd(c.len, ' ').slice(0, c.len)
                    return (
                      <span key={c.key} aria-hidden="true" className={`gap-[0.12em] ${c.wide ? 'hidden md:flex' : 'flex'}`}>
                        {Array.from(text).map((ch, i) => (
                          <span
                            key={i}
                            className={`relative flex h-[1.9em] w-[1.13em] items-center justify-center bg-paper-2 font-mono text-[0.95rem] font-medium ${
                              c.key === 'status' && row.code === 'IDPNJ' ? 'text-go' : c.key === 'code' ? 'text-cyan' : 'text-signal'
                            }`}
                          >
                            <span data-tile={ch}>{ch}</span>
                            <span className="absolute inset-x-0 top-1/2 h-px bg-paper/80" />
                          </span>
                        ))}
                      </span>
                    )
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
