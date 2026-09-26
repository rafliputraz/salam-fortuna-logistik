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
    <section ref={scope} id="faq" className="bg-paper-2 py-24 md:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 data-reveal className="t-display text-[length:var(--text-4xl)] text-ink">
              Before you ask us.
            </h2>
            <p data-reveal className="mt-5 max-w-sm leading-relaxed text-ink-2">
              If yours is not here, put it on the booking label below. We answer
              questions we have not been paid for.
            </p>
          </div>
        </div>

        <dl data-reveal className="lg:col-span-8">
          {FAQ.map((item, i) => {
            const isOpen = i === openIndex
            return (
              <div
                key={item.q}
                className={`mb-3 border-2 transition-colors duration-200 ${
                  isOpen ? 'border-ink bg-paper' : 'border-ink/10 bg-paper/60'
                }`}
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  >
                    <span className="t-head text-[1.25rem] text-ink md:text-[1.45rem]">{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-300 ease-out ${
                        isOpen ? 'rotate-45 bg-signal text-paper' : 'bg-ink/5 text-ink'
                      }`}
                    >
                      <span className="absolute h-[2px] w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-[2px] bg-current" />
                    </span>
                  </button>
                </dt>
                <dd
                  data-panel
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl px-6 pb-6 leading-relaxed text-ink-2">{item.a}</p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
