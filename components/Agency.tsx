'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { Anchor } from './icons'

/**
 * The page's one dark section and its one photograph, duotoned into the
 * palette so it reads as art direction rather than stock. Ship agency earns
 * the emphasis: it is the half of the business a forwarding-only competitor
 * cannot offer, and dropping the ground here marks that.
 */
export default function Agency() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to(gsap.utils.selector(scope)('[data-parallax]'), {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: scope.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="agency"
      className="on-dark relative overflow-hidden bg-oxblood"
    >
      <div className="chart-grid-dark absolute inset-0" aria-hidden="true" />

      <div className="shell relative grid items-stretch lg:grid-cols-12">
        <div className="relative isolate min-h-[22rem] overflow-hidden bg-brand-700 lg:col-span-5 lg:min-h-full">
          <Image
            data-parallax
            src="https://images.pexels.com/photos/12903633/pexels-photo-12903633.jpeg"
            alt="A vessel working cargo alongside at berth"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="scale-110 object-cover opacity-70 grayscale mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-oxblood via-transparent to-transparent" />
          <p className="t-data absolute bottom-5 left-5 text-paper/70">
            Alongside · {new Date().getFullYear()}
          </p>
        </div>

        <div className="py-24 lg:col-span-7 lg:py-32 lg:pl-16">
          <p data-reveal className="eyebrow text-paper/70">
            <span className="text-brand-300">02</span>
            <span>Ship agency &amp; husbandry</span>
          </p>

          <h2
            data-reveal
            className="t-display mt-8 text-[clamp(2rem,4.6vw,3.5rem)] text-paper"
          >
            Alongside before
            <br />
            the pilot boards.
          </h2>

          <div
            data-reveal
            className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-paper/70"
          >
            <p>
              A port call goes wrong in the gaps — the permit nobody filed, the crew
              change nobody booked, the barge nobody confirmed. We work the gaps.
            </p>
            <p>
              Our agents deal with KSOP, Bea Cukai, Karantina, and Imigrasi directly,
              and the master gets one point of contact instead of four phone numbers.
            </p>
          </div>

          <ul
            data-reveal
            className="mt-12 grid gap-px border border-paper/15 bg-paper/15 sm:grid-cols-2"
          >
            {HUSBANDRY.map((item) => (
              <li key={item.title} className="bg-oxblood p-6">
                <h3 className="t-data text-paper">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">{item.body}</p>
              </li>
            ))}
          </ul>

          <p
            data-reveal
            className="t-data mt-10 flex items-center gap-3 text-paper/70"
          >
            <Anchor className="h-4 w-4 text-brand-300" />
            Owner&apos;s protective, charterer&apos;s, or full agency
          </p>
        </div>
      </div>
    </section>
  )
}
