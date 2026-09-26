'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Ship agency: the half of the business a forwarding-only competitor cannot
 * offer. The photograph opens out from a porthole-sized crop to the full
 * width as you arrive, so the section lands like a ship coming alongside.
 */
export default function Agency() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: q('[data-frame]')[0],
            start: 'top 90%',
            end: 'top 15%',
            scrub: 0.6,
          },
        })
        .fromTo(
          q('[data-frame]'),
          { clipPath: 'inset(16% 20% 16% 20%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' },
          0
        )
        .fromTo(q('[data-photo]'), { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
    },
    { scope }
  )

  return (
    <section ref={scope} id="agency" className="relative bg-abyss pb-24 pt-10 md:pb-36">
      <div
        data-frame
        className="relative h-[78dvh] min-h-[28rem] w-full overflow-hidden bg-hold"
      >
        <div data-photo className="absolute inset-0 will-change-transform">
          <Image
            src="https://images.pexels.com/photos/12903633/pexels-photo-12903633.jpeg"
            alt="A container vessel working cargo alongside at berth"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
        <div className="shell absolute inset-x-0 bottom-0 pb-12 md:pb-16">
          <h2 className="t-display max-w-[14ch] text-[length:var(--text-display-s)] text-foam">
            Alongside before the pilot <span className="text-signal">boards.</span>
          </h2>
        </div>
      </div>

      <div className="shell mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-5 text-lg leading-relaxed text-steel lg:col-span-5">
          <p data-reveal>
            A port call goes wrong in the gaps: the permit nobody filed, the crew
            change nobody booked, the barge nobody confirmed. We work the gaps.
          </p>
          <p data-reveal>
            Our agents deal with KSOP, Bea Cukai, Karantina and Imigrasi directly,
            and the master gets one point of contact instead of four phone numbers.
          </p>
          <ul data-reveal className="flex flex-wrap gap-2 pt-3">
            {["Owner's protective", "Charterer's", 'Full agency'].map((t) => (
              <li key={t} className="rounded-full border border-rule-strong px-4 py-2 text-sm text-foam">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {HUSBANDRY.map((item) => (
            <div key={item.title} data-reveal className="border-t border-rule py-7">
              <dt className="t-head text-[1.7rem] text-foam">{item.title}</dt>
              <dd className="mt-3 leading-relaxed text-steel">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
