'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { VOYAGE } from '@/lib/company'
import { gsap, useGSAP } from '@/lib/motion'
import { LEG_ICONS } from './icons'

/** Where the topmost card comes to rest, clear of the floating masthead. */
const STACK_TOP = 7
/** How much of each earlier card stays visible under the one above it, in px. */
const STACK_STEP = 16

/**
 * The five legs of a shipment, in order.
 *
 * The left column holds still while the legs are worked through: each card
 * sticks in turn and the next one rides up over it, leaving a thin edge of
 * every completed leg showing. The stack you end up looking at is the file so
 * far — which is the point of the section.
 *
 * The stacking itself is plain CSS `position: sticky`, so it survives with
 * scripts off. GSAP only drives the progress rail.
 */
export default function Voyage() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const stack = q('[data-stack]')[0]
      const nodes = q('[data-node]')
      if (!stack) return

      const restOffset = STACK_TOP * 16
      const lastCard = stack.lastElementChild as HTMLElement | null

      // Driven off the stack's own scroll range rather than off each card: a
      // sticky element's box stops moving once it is stuck, so per-card
      // triggers resolve their start against an element already parked and
      // fire far too early. The range runs from the moment the first card
      // comes to rest to the moment the last one does, which is exactly the
      // span over which the deck is being built.
      gsap.to(q('[data-rail-fill]'), {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stack,
          start: () => `top ${restOffset}px`,
          end: () => `bottom ${(lastCard?.offsetHeight ?? 0) + restOffset}px`,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) =>
            nodes.forEach((node, i) =>
              node.classList.toggle(
                'is-lit',
                self.progress >= i / Math.max(1, nodes.length - 1)
              )
            ),
        },
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="voyage" className="py-24 md:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p data-reveal className="eyebrow">
              <span className="text-brand-600">01</span>
              <span>Legs of a shipment</span>
            </p>

            <h2
              data-reveal
              className="t-display mt-7 text-[clamp(2rem,4vw,3rem)] text-ink"
            >
              One file, from your gate to theirs.
            </h2>

            <p data-reveal className="mt-6 max-w-md leading-relaxed text-ink-soft">
              Most forwarders hand you off three times between booking and delivery,
              and the file loses something at each handover. The same team carries
              this one the whole way.
            </p>

            {/* Compact enough that the whole sticky column still fits a laptop
                viewport — a rail taller than the screen would never be seen. */}
            <div data-reveal className="mt-9" aria-hidden="true">
              <div className="relative">
                <span className="absolute left-0 right-0 top-[13.5px] h-px bg-line" />
                <span
                  data-rail-fill
                  className="absolute left-0 right-0 top-[13.5px] h-px origin-left scale-x-0 bg-brand"
                />
                <ol className="relative flex justify-between">
                  {VOYAGE.map((leg, i) => (
                    <li key={leg.code} className="flex flex-col items-center gap-3">
                      <span data-node className="node" />
                      <span className="t-data text-ink-soft">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div
              data-reveal
              className="relative mt-9 hidden aspect-[16/10] overflow-hidden border border-line lg:block"
            >
              <Image
                src="https://images.pexels.com/photos/2091159/pexels-photo-2091159.jpeg"
                alt="Containers stacked at the terminal"
                fill
                sizes="34vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <ol data-stack className="lg:col-span-7">
          {VOYAGE.map((leg, i) => {
            const LegIcon = LEG_ICONS[leg.code]
            const isLast = i === VOYAGE.length - 1
            return (
              <li
                key={leg.code}
                className="lg:sticky"
                style={{
                  top: `calc(${STACK_TOP}rem + ${i * STACK_STEP}px)`,
                  zIndex: i + 1,
                  // Each card but the last needs runway for the next to travel
                  // over it; the last one has nothing following it.
                  marginBottom: isLast ? 0 : '1.5rem',
                }}
              >
                {/* The upward shadow is what makes the deck legible — without
                    it, white cards on white read as one flat surface. */}
                <article className="leg group overflow-hidden bg-surface-raised shadow-[0_-10px_26px_-18px_rgba(7,32,39,0.45)] lg:min-h-[17rem]">
                  <LegIcon className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-ink opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.1]" />

                  <div className="relative">
                    <p className="t-data flex items-center gap-3 text-ink-soft">
                      <span className="text-brand-600">
                        Leg {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px w-6 bg-line-strong" />
                      {leg.code}
                    </p>

                    <h3 className="t-display-sm mt-4 text-2xl text-ink md:text-[1.7rem]">
                      {leg.title}
                    </h3>

                    <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
                      {leg.body}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {leg.detail.map((d) => (
                        <li
                          key={d}
                          className="t-data border border-line px-3 py-2 text-ink-soft"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
