'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * A single motion moment between the statement and the services. The ship
 * sails left to right across two lines of outlined type; behind her the
 * letters fill in solid, as though she were painting them as she goes. On
 * a wide screen the section holds still for the crossing.
 */
export default function ShipCross() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      if (prefersReducedMotion()) {
        gsap.set(q('[data-fill]'), { clipPath: 'inset(0 0% 0 0)' })
        gsap.set(q('[data-ship]'), { xPercent: 30 })
        return
      }
      const build = (st: ScrollTrigger.Vars) =>
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { scrub: 0.8, ...st } })
          .fromTo(q('[data-ship]'), { xPercent: -120, x: 0 }, { xPercent: 150, x: 0, duration: 1 }, 0)
          .fromTo(q('[data-fill]'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.85 }, 0.12)
          .fromTo(q('[data-wake]'), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)

      const mm = gsap.matchMedia(section)
      mm.add('(min-width: 1024px)', () => build({ trigger: section, start: 'top top', end: '+=160%', pin: true }))
      mm.add('(max-width: 1023px)', () => build({ trigger: section, start: 'top 80%', end: 'bottom 20%' }))
    },
    { scope }
  )

  const Lines = ({ solid }: { solid?: boolean }) => (
    <p
      className={`text-center text-[clamp(3.6rem,13.5vw,13rem)] font-extrabold leading-[0.9] tracking-[-0.05em] ${
        solid ? 'text-ink' : 'text-transparent [-webkit-text-stroke:1.5px_oklch(var(--c-ink)/0.2)]'
      }`}
    >
      One team.
      <br />
      <span className={solid ? 'text-signal' : ''}>Every leg.</span>
    </p>
  )

  return (
    <section ref={scope} aria-label="One team, every leg" className="relative flex min-h-[70svh] items-center overflow-hidden bg-white lg:h-[100svh]">
      <div aria-hidden="true" className="dots absolute inset-0 opacity-60" />
      <div className="relative w-full">
        <Lines />
        <div data-fill aria-hidden="true" className="absolute inset-0" style={{ clipPath: 'inset(0 100% 0 0)' }}>
          <Lines solid />
        </div>

        {/* The ship, riding across the middle of the type. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[40%]">
          <div data-ship className="relative w-[min(70vw,46rem)] will-change-transform">
            <span data-wake className="absolute bottom-[4%] right-[85%] h-2 w-[70%] origin-right rounded-full bg-gradient-to-l from-sky/60 to-transparent" />
            <div className="float">
              <Image
                src="/images/ship/ship.webp"
                alt=""
                width={1750}
                height={860}
                sizes="(max-width: 1024px) 70vw, 46rem"
                className="h-auto w-full drop-shadow-[0_30px_30px_oklch(var(--c-ink)/0.25)]"
              />
            </div>
          </div>
        </div>
      </div>
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-sm font-medium text-ink-3">
        Booking, customs, trucking and the port call. One team on your file.
      </p>
    </section>
  )
}
