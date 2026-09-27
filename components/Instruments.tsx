'use client'

import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { SERVICES } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' as const }

/** Sea freight: a compass, the card hunting its heading. */
function Compass() {
  return (
    <svg viewBox="-40 -40 80 80" className="instrument h-full w-full text-cyan">
      <circle r="34" {...stroke} className="opacity-40" />
      {Array.from({ length: 24 }).map((_, i) => (
        <path key={i} d={`M0 -34 V${i % 6 ? -30 : -26}`} {...stroke} transform={`rotate(${i * 15})`} className="opacity-60" />
      ))}
      <g style={{ animation: 'needle 3.4s ease-in-out infinite', transformOrigin: '0 0' }}>
        <path d="M0 -24 L5 0 L0 24 L-5 0 Z" className="fill-signal" />
        <path d="M0 0 L5 0 L0 24 L-5 0 Z" className="fill-ink/40" />
      </g>
      <text y="-18" textAnchor="middle" className="fill-ink-2 font-mono" style={{ fontSize: 7 }}>N</text>
    </svg>
  )
}

/** Customs: a declaration going under the scanner. */
function Scanner() {
  return (
    <svg viewBox="0 0 80 80" className="instrument h-full w-full text-cyan">
      <rect x="18" y="8" width="44" height="64" {...stroke} className="opacity-60" />
      {[20, 28, 36, 44, 52].map((y, i) => (
        <path key={y} d={`M26 ${y} H${i % 2 ? 48 : 54}`} {...stroke} className="opacity-40" />
      ))}
      <rect x="40" y="56" width="14" height="8" className="fill-signal/80" />
      <clipPath id="scan-clip">
        <rect x="18" y="8" width="44" height="64" />
      </clipPath>
      <g clipPath="url(#scan-clip)">
        <rect x="14" y="8" width="52" height="16" className="fill-cyan/25" style={{ animation: 'scan 2.2s linear infinite' }} />
      </g>
    </svg>
  )
}

/** Inland delivery: a truck running the road. */
function Road() {
  return (
    <svg viewBox="0 0 80 80" className="instrument h-full w-full text-cyan">
      <path d="M6 52 H74" {...stroke} className="opacity-60" />
      <path d="M6 58 H74" {...stroke} strokeDasharray="4 5" className="opacity-40" />
      <g style={{ animation: 'drive 2.8s cubic-bezier(0.45,0,0.55,1) infinite alternate', ['--drive' as string]: '36px' }}>
        <rect x="8" y="36" width="20" height="14" className="fill-signal" />
        <rect x="28" y="41" width="9" height="9" className="fill-signal/70" />
        <circle cx="14" cy="51" r="3" className="fill-ink" />
        <circle cx="32" cy="51" r="3" className="fill-ink" />
      </g>
    </svg>
  )
}

/** Ship agency: the watch clock, always running. */
function WatchClock() {
  return (
    <svg viewBox="-40 -40 80 80" className="instrument h-full w-full text-cyan">
      <circle r="34" {...stroke} className="opacity-50" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M0 -34 V-28" {...stroke} transform={`rotate(${i * 30})`} />
      ))}
      <path d="M0 0 V-16" {...stroke} className="text-ink" style={{ animation: 'tick-hand 48s linear infinite', transformOrigin: '0 0' }} />
      <path d="M0 0 V-26" stroke="currentColor" strokeWidth="1.5" className="text-signal" style={{ animation: 'tick-hand 4s steps(60) infinite', transformOrigin: '0 0' }} />
      <circle r="2.5" className="fill-signal" />
    </svg>
  )
}

/** Husbandry: stores, water and bunkers topping up. */
function Tanks() {
  return (
    <svg viewBox="0 0 80 80" className="instrument h-full w-full text-cyan">
      {[14, 34, 54].map((x, i) => (
        <g key={x}>
          <rect x={x} y="12" width="12" height="56" {...stroke} className="opacity-50" />
          <rect
            x={x + 2}
            y="14"
            width="8"
            height="52"
            className={i === 1 ? 'fill-signal/80' : 'fill-cyan/50'}
            style={{ transformOrigin: `${x + 6}px 66px`, animation: `fill-up ${3 + i * 0.7}s ease-in-out ${i * -0.9}s infinite` }}
          />
        </g>
      ))}
    </svg>
  )
}

/** Breakbulk and project: a load swinging on the hook. */
function Hook() {
  return (
    <svg viewBox="0 0 80 80" className="instrument h-full w-full text-cyan">
      <path d="M6 8 H74" {...stroke} className="opacity-60" />
      <g style={{ animation: 'swing 3s ease-in-out infinite', transformOrigin: '40px 8px' }}>
        <path d="M40 8 V40 M40 40 L26 50 M40 40 L54 50" {...stroke} />
        <rect x="22" y="50" width="36" height="20" className="fill-signal/80" />
        <path d="M22 60 H58" stroke="currentColor" className="text-paper/40" strokeWidth="1" />
      </g>
    </svg>
  )
}

const DIALS = [Compass, Scanner, Road, WatchClock, Tanks, Hook]

/**
 * What we do, as six instruments on the console. Each one is running its
 * own small loop, the way a bridge is never quite still. They power up in
 * turn as the console scrolls in, and a light follows the pointer across
 * the glass.
 */
export default function Instruments() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', scope.current)
      gsap.set(cards, { opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          batch.forEach((card, i) => {
            const title = card.querySelector('[data-title]')
            gsap
              .timeline({ delay: i * 0.12 })
              .to(card, { keyframes: { opacity: [0, 1, 0.25, 1, 0.6, 1] }, duration: 0.5, ease: 'none' })
              .to(title, { duration: 0.8, scrambleText: { text: title?.textContent ?? '', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.6 } }, 0.1)
          })
        },
      })
    },
    { scope }
  )

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section ref={scope} id="services" className="chart-grid relative py-24 md:py-36">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-label text-cyan">What we do · 06 systems</p>
            <h2 data-split className="t-display mt-5 text-[length:var(--text-display-s)] text-ink">
              Six instruments. <span className="t-outline">One crew.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-md leading-relaxed text-ink-2 lg:col-span-5 lg:justify-self-end">
            Whatever you need moved, cleared or looked after in port, it is the same people
            watching it, on the same file, from booking to delivery.
          </p>
        </div>

        <ul className="mt-16 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Dial = DIALS[i]
            return (
              <li
                key={s.title}
                data-card
                onPointerMove={onMove}
                className="group relative flex min-h-[22rem] flex-col overflow-hidden border-b border-r border-line bg-paper p-7 md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(420px circle at var(--mx) var(--my), oklch(var(--c-cyan) / 0.09), transparent 60%)' }}
                />
                <div className="flex items-start justify-between">
                  <p className="t-label text-ink-3">SYS.{String(i + 1).padStart(2, '0')}</p>
                  <div aria-hidden="true" className="h-20 w-20 transition-transform duration-500 ease-out group-hover:scale-110">
                    <Dial />
                  </div>
                </div>
                <h3 data-title className="t-head mt-auto pt-8 text-[2.4rem] text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                  {s.detail.map((d) => (
                    <li key={d} className="t-label text-cyan/80">
                      + {d}
                    </li>
                  ))}
                </ul>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
