'use client'

import { useRef, useState } from 'react'
import { FAQ } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * One question open at a time. Built from buttons and `aria-expanded` rather
 * than `<details>`, because a controlled panel is the only way to animate the
 * height reliably — a closed `<details>` has no box to measure.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const scope = useRef<HTMLElement>(null)
  const mounted = useRef(false)

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', scope.current)
      // The closed panels start life at their natural height. Snap them shut on
      // the first pass instead of animating, or the section plays a collapse it
      // was never asked for.
      const instant = !mounted.current || prefersReducedMotion()
      mounted.current = true

      panels.forEach((panel, i) => {
        const height = i === openIndex ? 'auto' : 0
        if (instant) gsap.set(panel, { height })
        else gsap.to(panel, { height, duration: 0.42, ease: 'power2.inOut' })
      })
    },
    { scope, dependencies: [openIndex] }
  )

  return (
    <section
      ref={scope}
      id="faq"
      className="border-t border-line bg-surface py-24 md:py-32"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p data-reveal className="t-data flex items-center gap-3 text-ink-soft">
            <span className="h-1.5 w-1.5 bg-brand" />
            04 · Common questions
          </p>
          <h2
            data-reveal
            className="t-display mt-8 text-[clamp(2rem,4.2vw,3.1rem)] text-ink"
          >
            Before you
            <br />
            ask us.
          </h2>
          <p data-reveal className="mt-6 max-w-sm leading-relaxed text-ink-soft">
            If yours is not here, ask it in the form below. We answer questions we
            have not been paid for.
          </p>
        </div>

        <dl data-reveal className="border-t border-line lg:col-span-8">
          {FAQ.map((item, i) => {
            const isOpen = i === openIndex
            return (
              <div key={item.q} className="border-b border-line">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="group flex w-full items-start justify-between gap-8 py-7 text-left"
                  >
                    <span className="t-display-sm text-lg text-ink transition-colors duration-200 group-hover:text-brand-600 md:text-xl">
                      {item.q}
                    </span>
                    <Indicator open={isOpen} />
                  </button>
                </dt>

                <dd
                  data-panel
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-8 pr-10 leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

/** A plus that loses its upright stroke when the answer is showing. */
function Indicator({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative mt-1.5 block h-3.5 w-3.5 shrink-0"
    >
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-brand" />
      <span
        className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brand transition-transform duration-300 ${
          open ? 'scale-y-0' : 'scale-y-100'
        }`}
      />
    </span>
  )
}
