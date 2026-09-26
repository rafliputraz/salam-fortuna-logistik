'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { VOYAGE } from '@/lib/company'
import { gsap, useGSAP } from '@/lib/motion'
import { LEG_ICONS } from './icons'

/**
 * The five legs of a shipment, laid end to end as a route.
 *
 * On a desktop the section pins and the legs pass sideways, the way a box
 * moves through its legs, while a red container rides the route line at the
 * foot of the screen and lights each stop as it reaches it. On a phone, or
 * with reduced motion, it is simply a list read top to bottom.
 */
export default function Voyage() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const track = q('[data-track]')[0]
      const box = q('[data-box]')[0]
      const stops = q('[data-stop]')
      const mm = gsap.matchMedia(section)

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-pan')
        const distance = () => track.scrollWidth - window.innerWidth

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) =>
              stops.forEach((s, i) =>
                s.classList.toggle('is-lit', self.progress >= (i + 0.35) / (stops.length + 0.35))
              ),
          },
        })
        tl.to(track, { x: () => -distance(), ease: 'none' }, 0)
        tl.fromTo(
          box,
          { x: 0 },
          { x: () => (box.parentElement?.clientWidth ?? 0) - box.offsetWidth, ease: 'none' },
          0
        )

        return () => {
          section.classList.remove('is-pan')
          stops.forEach((s) => s.classList.remove('is-lit'))
        }
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="voyage" className="group relative overflow-hidden bg-abyss">
      <div
        data-track
        className="flex flex-col group-[.is-pan]:h-[100dvh] group-[.is-pan]:w-max group-[.is-pan]:flex-row"
      >
        <header className="shell flex flex-col justify-center py-24 group-[.is-pan]:w-[46rem] group-[.is-pan]:max-w-none group-[.is-pan]:shrink-0 group-[.is-pan]:py-0 group-[.is-pan]:pr-16">
          <h2 data-reveal className="t-display text-[length:var(--text-display-s)] text-foam">
            One file, from your gate to theirs.
          </h2>
          <p data-reveal className="mt-6 max-w-[34rem] text-lg leading-relaxed text-steel">
            Most forwarders hand you off three times between booking and delivery,
            and the file loses something at each handover. The same team carries
            this one the whole way.
          </p>
          <div
            data-reveal
            className="relative mt-10 aspect-[16/9] w-full max-w-[36rem] overflow-hidden bg-hold"
          >
            <Image
              src="https://images.pexels.com/photos/2091159/pexels-photo-2091159.jpeg"
              alt="Containers stacked at a terminal"
              fill
              sizes="(max-width: 1024px) 100vw, 36rem"
              className="object-cover"
            />
          </div>
        </header>

        <ol className="flex flex-col group-[.is-pan]:flex-row">
          {VOYAGE.map((leg, i) => {
            const Icon = LEG_ICONS[leg.code]
            return (
              <li
                key={leg.code}
                className="border-t border-rule group-[.is-pan]:flex group-[.is-pan]:w-[31rem] group-[.is-pan]:shrink-0 group-[.is-pan]:items-center group-[.is-pan]:border-l group-[.is-pan]:border-t-0"
              >
                <article className="shell py-14 group-[.is-pan]:px-12 group-[.is-pan]:py-0">
                  <div className="flex items-start justify-between gap-6">
                    <span
                      aria-hidden="true"
                      className="t-display t-stencil text-[clamp(5rem,9vw,8.5rem)] leading-none"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Icon className="mt-3 h-10 w-10 shrink-0 text-signal-lift" />
                  </div>
                  <h3 className="t-head mt-8 text-[clamp(2rem,3vw,2.75rem)] text-foam">
                    {leg.title}
                  </h3>
                  <p className="mt-4 max-w-[26rem] leading-relaxed text-steel">{leg.body}</p>
                  <ul className="mt-7 space-y-2 border-l border-signal/60 pl-4">
                    {leg.detail.map((d) => (
                      <li key={d} className="t-label text-fog">
                        {d}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            )
          })}
          <li aria-hidden="true" className="hidden group-[.is-pan]:block group-[.is-pan]:w-[12vw] group-[.is-pan]:shrink-0" />
        </ol>
      </div>

      {/* The route. Only drawn when the legs are travelling sideways. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-10 hidden group-[.is-pan]:block"
      >
        <div className="shell">
          <div className="relative h-4">
            <span className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
            <span
              data-box
              className="absolute top-0 h-4 w-10 bg-signal shadow-[0_0_24px_oklch(var(--c-signal)/0.6)]"
            />
          </div>
          <ol className="mt-4 flex justify-between">
            {VOYAGE.map((leg) => (
              <li
                key={leg.code}
                data-stop
                className="t-label text-fog transition-colors duration-300 [&.is-lit]:text-foam"
              >
                {leg.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
