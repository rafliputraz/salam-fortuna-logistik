'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { SERVICES } from '@/lib/company'
import { boxColor } from './Box'

/** Card widths on the 12-column wall: wide and narrow alternate row to row. */
const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-6', 'lg:col-span-6']

/**
 * What we do, as a wall of container doors. Each card is the end of a box:
 * the doors carry the name, and swing open on hover, focus or a tap to show
 * what is inside. The details are always in the page for screen readers;
 * the doors are only paint.
 */
export default function Services() {
  return (
    <section id="services" className="bg-paper py-24 md:py-32">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 data-reveal className="t-display text-[length:var(--text-display-s)] text-ink">
            Six doors. One team behind all of them.
          </h2>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
            Open any of them. Whatever you need moved, cleared or looked after in
            port, it is the same people on the other side.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          {SERVICES.map((s, i) => (
            <DoorCard key={s.title} index={i} service={s} span={SPANS[i]} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function DoorCard({
  index,
  service,
  span,
}: {
  index: number
  service: (typeof SERVICES)[number]
  span: string
}) {
  const [open, setOpen] = useState(false)
  const paint = { '--c': boxColor(service.color), '--rib': '12px' } as CSSProperties
  const id = `service-${index}`

  return (
    <li data-reveal className={`door-card relative h-[21rem] ${span}`} data-open={open}>
      {/* Inside the box: what the service is. */}
      <div className="absolute inset-0 flex flex-col justify-between border-2 border-ink/10 bg-paper-2 p-7">
        <div>
          <span className="t-label text-ink-3">{String(index + 1).padStart(2, '0')}</span>
          <h3 id={id} className="t-head mt-2 text-[2rem] text-ink">
            {service.title}
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-ink-2">{service.body}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {service.detail.map((d) => (
            <li
              key={d}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-paper"
              style={{ background: boxColor(service.color) }}
            >
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* The doors. A button so a tap or a key can open them. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${open ? 'Close' : 'Open'} the doors: ${service.title}`}
        onClick={() => setOpen((v) => !v)}
        className={`absolute inset-0 flex ${open ? 'pointer-events-none' : ''}`}
      >
        <span className="door-leaf door-leaf-l steel-door relative h-full w-1/2" style={paint}>
          <span className="absolute bottom-6 left-6 text-left text-paper">
            <span className="t-label block opacity-80">{String(index + 1).padStart(2, '0')}</span>
            <span className="t-head mt-1 block text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[0.95]">
              {service.title}
            </span>
          </span>
        </span>
        <span className="door-leaf door-leaf-r steel-door relative h-full w-1/2" style={paint}>
          <span className="t-label absolute bottom-6 right-6 text-paper opacity-80">Open</span>
        </span>
      </button>
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="t-label absolute right-4 top-4 rounded-full bg-ink px-3 py-1.5 text-paper"
        >
          Close
        </button>
      )}
    </li>
  )
}
