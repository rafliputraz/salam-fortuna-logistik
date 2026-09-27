'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { Check } from './icons'

/**
 * Ship agency, on the one deep navy band. The photograph opens from a
 * narrow frame to full as it scrolls into view and keeps drifting inside
 * it; the four things we handle for the master rise in beneath, and two
 * lines of big type slide against each other as the band scrolls out.
 */
export default function Agency() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      gsap.fromTo(
        q('[data-frame]'),
        { clipPath: 'inset(8% 14% 8% 14% round 2rem)' },
        { clipPath: 'inset(0% 0% 0% 0% round 2rem)', ease: 'none', scrollTrigger: { trigger: q('[data-frame]')[0], start: 'top 90%', end: 'top 30%', scrub: true } }
      )
      gsap.fromTo(
        q('[data-photo]'),
        { scale: 1.2, yPercent: -6 },
        { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: q('[data-frame]')[0], start: 'top bottom', end: 'bottom top', scrub: true } }
      )
      // The scope of the call, in big type, running against each other.
      q('[data-run]').forEach((row, i) => {
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -30 : 0 },
          { xPercent: i % 2 ? 0 : -30, ease: 'none', scrollTrigger: { trigger: q('[data-runs]')[0], start: 'top bottom', end: 'bottom top', scrub: true } }
        )
      })
      q('[data-husb]').forEach((card, i) => {
        gsap.from(card, { opacity: 0, y: 50, duration: 0.9, delay: i * 0.1, ease: 'power3.out', scrollTrigger: { trigger: q('[data-husb-grid]')[0], start: 'top 85%', once: true } })
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="agency" className="bg-deep py-24 text-white md:py-32">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow !text-sky">Ship agency</p>
            <h2 data-split className="t-h2 mt-4">
              Alongside before the pilot boards.
            </h2>
          </div>
          <p data-reveal className="text-white/70 lg:col-span-5">
            A port call goes wrong in the gaps: the permit nobody filed, the crew change nobody
            booked. Our agents deal with KSOP, Bea Cukai, Karantina and Imigrasi directly, and
            the master gets one point of contact.
          </p>
        </div>

        <div data-frame className="relative mt-14 aspect-[16/10] overflow-hidden rounded-[2rem] md:aspect-[21/9]">
          <Image
            data-photo
            src="/images/photos/ship-at-sea.webp"
            alt="Container ship underway, fully laden"
            fill
            sizes="(max-width: 1400px) 100vw, 84rem"
            className="object-cover object-[50%_45%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md md:bottom-8 md:left-8">
            Owner&apos;s, charterer&apos;s and full agency
          </p>
        </div>

        <dl data-husb-grid className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HUSBANDRY.map((h) => (
            <div key={h.title} data-husb className="rounded-3xl bg-deep-2 p-7 ring-1 ring-inset ring-white/10 transition-colors duration-300 hover:bg-white/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/15 text-sky">
                <Check className="h-5 w-5" />
              </span>
              <dt className="t-h3 mt-6 text-xl">{h.title}</dt>
              <dd className="mt-2 text-[0.95rem] leading-relaxed text-white/70">{h.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div data-runs aria-hidden="true" className="mt-20 space-y-2 overflow-hidden md:mt-28">
        {[RUN_A, RUN_B].map((run, i) => (
          <p
            key={i}
            data-run
            className={`whitespace-nowrap text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-none tracking-[-0.04em] ${
              i ? 'text-white/10' : 'text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.25)]'
            }`}
          >
            {run} {run}
          </p>
        ))}
      </div>
    </section>
  )
}

const RUN_A = 'Port clearance · Crew change · Cash to master ·'
const RUN_B = 'Bunkers & stores · Fresh water · Owner’s protective ·'
