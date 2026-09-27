'use client'

import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { PRINCIPLES, VISION } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { boxColor, type BoxColor } from '@/lib/containers'

const COLORS: BoxColor[] = ['magenta', 'orange', 'green', 'cobalt']
/** Where each card comes to rest, clear of the header, and how much of each stays showing. */
const STACK_TOP = 6
const STACK_STEP = 22

/**
 * Four promises, each painted on the side of a box. The boxes stack as you
 * scroll, each one landing on the last with a few centimetres of the one
 * below still showing, like a tier going up on a quay. The vision closes the
 * section and lights word by word under the scroll.
 */
export default function Standards() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      const cards = q('[data-card]')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
          scale: 0.94,
          filter: 'brightness(0.86)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: `top ${STACK_TOP * 16 + (i + 1) * STACK_STEP}px`, scrub: true },
        })
      })
      gsap.fromTo(
        q('[data-word]'),
        { opacity: 0.15 },
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
    <section ref={scope} id="standards" className="bg-paper py-24 md:py-32">
      <div className="shell">
        <h2 data-split className="t-display max-w-[14ch] text-[length:var(--text-display-s)] text-ink">
          Four promises you can hold us to.
        </h2>

        <ol className="mt-14">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className="sticky"
              style={{ top: `calc(${STACK_TOP}rem + ${i * STACK_STEP}px)`, marginBottom: i === PRINCIPLES.length - 1 ? 0 : '2rem' }}
            >
              <article
                data-card
                className="steel flex min-h-[15rem] origin-top flex-col justify-between gap-6 p-7 text-paper md:min-h-[19rem] md:flex-row md:items-end md:p-10"
                style={{ '--c': boxColor(COLORS[i]), '--rib': '14px' } as CSSProperties}
              >
                <h3 className="t-display max-w-[12ch] text-[clamp(2.4rem,5.6vw,5rem)]">{p.title}</h3>
                <p className="max-w-sm text-lg leading-relaxed text-paper/90">{p.body}</p>
              </article>
            </li>
          ))}
        </ol>

        <figure data-vision className="mt-28 md:mt-40">
          <blockquote className="t-display max-w-[22ch] text-[clamp(2rem,4.4vw,4rem)] leading-[1] text-ink">
            {VISION.split(' ').map((w, i) => (
              <span key={i} data-word>
                {w}{' '}
              </span>
            ))}
          </blockquote>
          <figcaption className="t-label mt-6 text-ink-2">Our vision</figcaption>
        </figure>
      </div>
    </section>
  )
}
