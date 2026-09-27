'use client'

import { useRef } from 'react'
import { PRINCIPLES, VISION } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Four promises as numbered cards, with a red rule that draws across the
 * top of each as it arrives, then the vision set as a pull quote that
 * lights up word by word as it scrolls through.
 */
export default function Standards() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      if (prefersReducedMotion()) {
        gsap.set(q('[data-vw]'), { opacity: 1 })
        return
      }
      gsap.from(q('[data-rule]'), {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 1,
        stagger: 0.12,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: q('[data-grid]')[0], start: 'top 80%', once: true },
      })
      gsap.to(q('[data-vw]'), {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: { trigger: q('[data-vision]')[0], start: 'top 75%', end: 'bottom 55%', scrub: true },
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="standards" className="py-24 md:py-32">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">Our standards</p>
          <h2 data-split className="t-h2 mt-4 text-ink">
            Four promises you can hold us to.
          </h2>
        </div>

        <ol data-grid className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} data-reveal className="relative pt-8">
              <span className="absolute inset-x-0 top-0 h-px bg-line" />
              <span data-rule className="absolute left-0 top-0 h-0.5 w-16 bg-signal" />
              <p className="text-sm font-semibold text-signal">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="t-h3 mt-3 text-2xl text-ink">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-2">{p.body}</p>
            </li>
          ))}
        </ol>

        <figure data-reveal className="mt-24 rounded-[2rem] bg-paper-2 px-8 py-14 md:px-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-3">Our vision</p>
          <blockquote data-vision className="t-h2 mt-6 max-w-5xl !font-semibold text-ink">
            {`“${VISION}”`.split(' ').map((w, i) => (
              <span key={i} data-vw className="opacity-20">
                {w}{' '}
              </span>
            ))}
          </blockquote>
        </figure>
      </div>
    </section>
  )
}
