'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Ship agency, on the page's one full colour block. The real ship sails in
 * from the right as you scroll through, over a sea of drawn swell lines,
 * because that is the job: she arrives, and we have already cleared the way.
 */
export default function Agency() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      gsap.fromTo(
        q('[data-ship]'),
        { xPercent: 55 },
        {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      )
      gsap.to(q('[data-swell]'), { backgroundPositionX: '-=240px', duration: 6, ease: 'none', repeat: -1 })
    },
    { scope }
  )

  return (
    <section ref={scope} id="agency" className="relative overflow-hidden bg-box-cobalt text-paper">
      <div className="shell relative z-10 pt-24 md:pt-32">
        <h2 data-reveal className="t-display max-w-[13ch] text-[length:var(--text-display-s)]">
          Alongside before the pilot boards.
        </h2>
        <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85">
          A port call goes wrong in the gaps: the permit nobody filed, the crew change
          nobody booked. Our agents deal with KSOP, Bea Cukai, Karantina and Imigrasi
          directly, and the master gets one point of contact.
        </p>
      </div>

      {/* The ship, riding a band of swell lines. */}
      <div aria-hidden="true" className="relative mt-8 h-[14rem] sm:h-[19rem] md:mt-10 md:h-[27rem]">
        <div
          data-swell
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='36'%3E%3Cpath d='M0 18 Q30 6 60 18 T120 18 T180 18 T240 18' fill='none' stroke='white' stroke-opacity='.22' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '240px 36px',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
            maskImage: 'linear-gradient(to bottom, black, transparent)',
          }}
        />
        <div data-ship className="absolute bottom-[26%] left-[20%] w-[min(86vw,50rem)] will-change-transform">
          <Image
            src="/images/ship/ship.webp"
            alt=""
            width={1750}
            height={860}
            sizes="(max-width: 768px) 86vw, 50rem"
            className="h-auto w-full drop-shadow-[0_30px_30px_oklch(var(--c-ink)/0.35)]"
          />
        </div>
      </div>

      <div className="relative z-10 bg-ink/25">
        <dl className="shell grid gap-x-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {HUSBANDRY.map((item) => (
            <div key={item.title} data-reveal className="border-t-2 border-paper/25 py-6">
              <dt className="t-head text-[1.5rem]">{item.title}</dt>
              <dd className="mt-2 leading-relaxed text-paper/80">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
