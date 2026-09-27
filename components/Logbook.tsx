'use client'

import { useRef } from 'react'
import { PRINCIPLES, VISION } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Four promises, kept as entries in the ship's log. On a wide screen the
 * section pins and the log slides sideways under a fixed rule while you
 * scroll; the vision is the last entry, its words lighting up as they pass
 * the rule. On a phone the entries simply stack.
 */
export default function Logbook() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const track = q('[data-track]')[0]
      const words = q('[data-word]')
      if (prefersReducedMotion()) {
        gsap.set(words, { opacity: 1 })
        return
      }

      const mm = gsap.matchMedia(section)
      mm.add('(min-width: 1024px)', () => {
        const distance = () => track.scrollWidth - window.innerWidth
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        tl.to(track, { x: () => -distance(), ease: 'none', duration: 1 })
          .to(q('[data-meter]'), { scaleX: 1, ease: 'none', duration: 1 }, 0)
          .to(words, { opacity: 1, stagger: 0.02, duration: 0.05, ease: 'none' }, 0.72)
        q('[data-entry]').forEach((entry) => {
          gsap.from(entry.querySelector('[data-num]'), {
            yPercent: 40,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, containerAnimation: tl, start: 'left 85%', end: 'left 45%', scrub: true },
          })
        })
      })
      mm.add('(max-width: 1023px)', () => {
        gsap.to(words, {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-vision]')[0], start: 'top 80%', end: 'bottom 50%', scrub: true },
        })
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="standards" className="relative overflow-hidden border-t border-line bg-paper-2 lg:h-[100svh]">
      <div data-track className="flex flex-col gap-px py-24 lg:h-full lg:w-max lg:flex-row lg:items-stretch lg:py-0">
        <div className="shell flex flex-col justify-center lg:w-[38rem] lg:max-w-none lg:shrink-0 lg:pl-10">
          <p className="t-label text-cyan">Ship&apos;s log · standing orders</p>
          <h2 data-split className="t-display mt-5 text-[length:var(--text-display-s)] text-ink">
            Four promises you can hold us to.
          </h2>
          <p className="t-label mt-8 hidden text-ink-3 lg:block">Scroll · the log runs east →</p>
        </div>

        {PRINCIPLES.map((p, i) => (
          <article
            key={p.title}
            data-entry
            className="shell relative flex flex-col justify-center border-line py-10 lg:w-[34rem] lg:max-w-none lg:shrink-0 lg:border-l lg:px-12 lg:py-0"
          >
            <p data-num className="t-display t-outline text-[clamp(7rem,16vw,15rem)] leading-none">
              {String(i + 1).padStart(2, '0')}
            </p>
            <p className="t-label mt-6 text-ink-3">Entry {String(i + 1).padStart(2, '0')} · always</p>
            <h3 className="t-head mt-3 text-[clamp(2.4rem,3.6vw,3.4rem)] text-signal">{p.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">{p.body}</p>
          </article>
        ))}

        <div data-vision className="shell flex flex-col justify-center py-10 lg:w-[62rem] lg:max-w-none lg:shrink-0 lg:border-l lg:border-line lg:px-16 lg:py-0">
          <p className="t-label text-cyan">Heading · our vision</p>
          <p className="t-display mt-6 text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[0.95]">
            {VISION.split(' ').map((w, i) => (
              <span key={i} data-word className="text-ink opacity-20">
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-px bg-line lg:block">
        <span data-meter className="block h-full origin-left scale-x-0 bg-signal" />
      </div>
    </section>
  )
}
