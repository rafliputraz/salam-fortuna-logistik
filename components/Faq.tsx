'use client'

import { useRef, useState } from 'react'
import { FAQ } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * One question open at a time. Buttons with `aria-expanded` rather than
 * `<details>`, because a controlled panel is the only way to animate the
 * height reliably.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const scope = useRef<HTMLElement>(null)
  const mounted = useRef(false)

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', scope.current)
      // Snap shut on the first pass so the section doesn't play a collapse.
      const instant = !mounted.current || prefersReducedMotion()
      mounted.current = true
      panels.forEach((panel, i) => {
        const height = i === openIndex ? 'auto' : 0
        if (instant) gsap.set(panel, { height })
        else gsap.to(panel, { height, duration: 0.32, ease: 'power3.inOut' })
      })
    },
    { scope, dependencies: [openIndex] }
  )

  return (
    <section ref={scope} id="faq" className="bg-abyss py-24 md:py-36">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 data-reveal className="t-display text-[length:var(--text-4xl)] text-foam">
              Before you ask us.
            </h2>
            <p data-reveal className="mt-6 max-w-sm leading-relaxed text-steel">
              If yours is not here, put it in the enquiry below. We answer questions we
              have not been paid for.
            </p>
          </div>
        </div>

        <dl data-reveal className="border-t border-rule lg:col-span-8">
          {FAQ.map((item, i) => {
            const isOpen = i === openIndex
            return (
              <div key={item.q} className="border-b border-rule">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="group flex w-full items-start justify-between gap-8 py-7 text-left"
                  >
                    <span
                      className={`text-xl font-medium transition-colors duration-200 md:text-2xl ${
                        isOpen ? 'text-foam' : 'text-steel group-hover:text-foam'
                      }`}
                    >
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
                  <p className="max-w-2xl pb-8 pr-10 leading-relaxed text-steel">{item.a}</p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

/** A plus that turns to a cross when its answer is showing. */
function Indicator({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ease-out ${
        open ? 'rotate-45 border-signal bg-signal' : 'border-rule-strong'
      }`}
    >
      <span className="absolute h-px w-3.5 bg-foam" />
      <span className="absolute h-3.5 w-px bg-foam" />
    </span>
  )
}
