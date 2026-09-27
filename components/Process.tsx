'use client'

import { useRef } from 'react'
import { VOYAGE } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'
import { LEG_ICONS } from './icons'

/**
 * How a shipment moves, as five steps. The step list on the left stays put
 * while the cards on the right stack up as you scroll, each sliding over
 * the last; the step in view lights up and a red rule fills down the list.
 */
export default function Process() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const items = q('[data-nav]')
      const cards = q('[data-step]')
      const setActive = (i: number) => items.forEach((el, n) => el.classList.toggle('is-active', n === i))
      setActive(0)
      cards.forEach((card, i) =>
        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      )
      if (prefersReducedMotion()) return
      gsap.fromTo(
        q('[data-rule]'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('[data-steps]')[0], start: 'top 55%', end: 'bottom 55%', scrub: true } }
      )
      // On a wide screen the cards stack: each one pins a little lower than
      // the last, and the one beneath shrinks back and dims as the next
      // slides over it.
      const mm = gsap.matchMedia(scope.current!)
      mm.add('(min-width: 1024px)', () => {
        cards.slice(0, -1).forEach((card, i) => {
          // Shaded with an opaque layer, not card opacity, so the card
          // underneath never shows through.
          const st = { trigger: cards[i + 1], start: 'top 85%', end: () => `top ${140 + (i + 1) * 22}px`, scrub: true }
          gsap.to(card, { scale: 0.92, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: st })
          gsap.to(card.querySelector('[data-shade]'), { opacity: 0.7, ease: 'none', scrollTrigger: st })
        })
      })
      mm.add('(max-width: 1023px)', () => {
        cards.forEach((card) =>
          gsap.from(card, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        )
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="process" className="py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">How it works</p>
            <h2 data-split className="t-h2 mt-4 text-ink">
              One file, from booking to delivery.
            </h2>
            <p data-reveal className="mt-5 max-w-md text-ink-2">
              Most forwarders hand you off three times between booking and delivery. The same
              team carries yours the whole way.
            </p>

            <ol aria-hidden="true" className="relative mt-10 hidden space-y-1 lg:block">
              <span className="absolute bottom-3 left-[1.15rem] top-3 w-px bg-line" />
              <span data-rule className="absolute bottom-3 left-[1.15rem] top-3 w-px origin-top bg-signal" />
              {VOYAGE.map((leg, i) => (
                <li key={leg.code} data-nav className="group relative flex items-center gap-4 py-2.5 text-ink-3 transition-colors duration-300 [&.is-active]:text-ink">
                  <span className="relative z-10 flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full bg-white text-sm font-bold ring-1 ring-line-strong transition-colors duration-300 group-[.is-active]:bg-signal group-[.is-active]:text-white group-[.is-active]:ring-signal">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{leg.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ol data-steps className="space-y-5 lg:col-span-7 lg:space-y-[40vh] lg:pb-[10vh]">
          {VOYAGE.map((leg, i) => {
            const Icon = LEG_ICONS[leg.code]
            return (
              <li
                key={leg.code}
                data-step
                className="card relative p-8 md:p-10 lg:sticky"
                style={{ top: `${140 + i * 22}px` }}
              >
                <span data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-paper-3 opacity-0" />
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal/10 text-signal">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-ink-3">
                    Step {i + 1} of {VOYAGE.length}
                  </span>
                </div>
                <h3 className="t-h3 mt-8 text-3xl text-ink">{leg.title}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-ink-2">{leg.body}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                  {leg.detail.map((d) => (
                    <li key={d} className="flex items-center gap-2 rounded-xl bg-paper-2 px-3 py-2.5 text-sm font-medium text-ink">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                      {d}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
