'use client'

import Image from 'next/image'
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { SERVICES } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'
import { Anchor, ArrowRight, Boxes, Doc, Ship, Slot, Truck } from './icons'

const ICONS = [Ship, Doc, Truck, Anchor, Boxes, Slot]

/**
 * Services as a bento grid. Sea freight leads, on the photograph of a ship
 * underway; ship agency sits on the deep navy; the rest are plain cards.
 * They rise into place tilted back, in turn. Under a mouse each card tips
 * toward the pointer and a soft light follows it across the surface.
 */
export default function Services() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-svc]', scope.current)
      gsap.set(cards, { opacity: 0, y: 70, rotationX: 14, transformPerspective: 1200, transformOrigin: '50% 100%' })
      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, rotationX: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }),
      })
    },
    { scope }
  )

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`)
  }
  const onLeave = (e: ReactPointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }

  return (
    <section ref={scope} id="services" className="bg-paper-2 py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Services</p>
            <h2 data-split className="t-h2 mt-4 text-ink">
              Everything between your gate and theirs.
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-ink-2">
            Six services, one team. Whatever you need moved, cleared or looked after in port,
            the same people are on the file.
          </p>
        </div>

        <ul className="mt-14 grid auto-rows-[minmax(16rem,auto)] gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[i]
            const lead = i === 0
            const dark = i === 3
            return (
              <li
                key={s.title}
                data-svc
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className={`group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out)] [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateY(-4px)] md:p-8 ${
                  lead
                    ? 'min-h-[26rem] text-white md:col-span-2 lg:row-span-2'
                    : dark
                      ? 'bg-deep text-white'
                      : 'card hover:shadow-[0_24px_48px_-24px_oklch(var(--c-ink)/0.3)]'
                }`}
              >
                {lead && (
                  <>
                    <Image
                      src="/images/photos/ship-at-sea.webp"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 56rem"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/30 to-transparent" />
                  </>
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), ${
                      lead || dark ? 'rgb(255 255 255 / 0.14)' : 'oklch(var(--c-signal) / 0.07)'
                    }, transparent 65%)`,
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      lead ? 'glass !border-white/30 !bg-white/15 text-white' : dark ? 'bg-white/10 text-sky' : 'bg-signal/10 text-signal'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:-rotate-45 ${
                      lead || dark ? 'bg-white/10 text-white' : 'bg-paper-3 text-ink'
                    }`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="relative mt-auto pt-10">
                  <p className={`text-sm font-semibold ${lead || dark ? 'text-white/60' : 'text-ink-3'}`}>{String(i + 1).padStart(2, '0')}</p>
                  <h3 className={`t-h3 mt-2 ${lead ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>{s.title}</h3>
                  <p className={`mt-3 max-w-md leading-relaxed ${lead || dark ? 'text-white/80' : 'text-ink-2'}`}>{s.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.detail.map((d) => (
                      <li
                        key={d}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          lead || dark ? 'bg-white/10 text-white ring-1 ring-inset ring-white/20' : 'bg-paper-2 text-ink-2 ring-1 ring-inset ring-line'
                        }`}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
