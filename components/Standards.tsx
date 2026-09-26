'use client'

import { useRef } from 'react'
import { PRINCIPLES, VISION } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Four promises, set as stencils that fill in as you read down to them, the
 * way lettering is painted onto a hull a stroke at a time. The vision closes
 * the section and lights word by word under the scroll.
 */
export default function Standards() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)

      q('[data-paint]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'top 45%', scrub: 0.5 },
          }
        )
      })

      gsap.fromTo(
        q('[data-word]'),
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-vision]')[0], start: 'top 80%', end: 'bottom 55%', scrub: 0.5 },
        }
      )
    },
    { scope }
  )

  return (
    <section ref={scope} id="standards" className="border-t border-rule bg-hull py-24 md:py-36">
      <div className="shell">
        <h2 data-reveal className="t-display max-w-[16ch] text-[length:var(--text-4xl)] text-steel">
          Four promises you can hold us to.
        </h2>

        <dl className="mt-14 md:mt-20">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="grid gap-4 border-t border-rule py-8 md:grid-cols-12 md:items-center md:gap-10 md:py-10"
            >
              <dt className="relative md:col-span-7">
                <span aria-hidden="true" className="t-display t-stencil block text-[clamp(2.6rem,7vw,6.5rem)]">
                  {p.title}
                </span>
                <span
                  data-paint
                  className="t-display absolute inset-0 block text-[clamp(2.6rem,7vw,6.5rem)] text-foam"
                >
                  {p.title}
                </span>
              </dt>
              <dd className="max-w-[28rem] leading-relaxed text-steel md:col-span-5">{p.body}</dd>
            </div>
          ))}
        </dl>

        <figure data-vision className="mt-20 border-t border-signal pt-10 md:mt-28">
          <blockquote className="t-head max-w-[26ch] text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.02] text-foam">
            {VISION.split(' ').map((w, i) => (
              <span key={i} data-word>
                {w}{' '}
              </span>
            ))}
          </blockquote>
          <figcaption className="t-label mt-6 text-fog">Company vision</figcaption>
        </figure>
      </div>
    </section>
  )
}
