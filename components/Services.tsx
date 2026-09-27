'use client'

import Image from 'next/image'
import { SERVICES } from '@/lib/company'
import { Anchor, ArrowRight, Boxes, Doc, Ship, Slot, Truck } from './icons'

const ICONS = [Ship, Doc, Truck, Anchor, Boxes, Slot]

/**
 * Services as a bento grid. Sea freight leads, on the photograph of a ship
 * underway; ship agency sits on the deep navy; the rest are plain cards.
 * Every card lifts a little under the pointer.
 */
export default function Services() {
  return (
    <section id="services" className="bg-paper-2 py-24 md:py-32">
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
                data-reveal
                className={`group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 md:p-8 ${
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
