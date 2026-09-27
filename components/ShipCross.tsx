'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * The ship coming at you. The section holds still while you scroll; the
 * photograph starts as a small, hazy frame far off on the horizon under the
 * headline and grows and rises until it fills the screen, and the ship
 * keeps closing after that, bow first. The headline turns white once she is behind it, then swells
 * and fades as she sails through it.
 */
export default function ShipCross() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      if (prefersReducedMotion()) {
        gsap.set(q('[data-frame]'), { scale: 1, borderRadius: 0 })
        gsap.set(q('[data-light]'), { opacity: 1 })
        gsap.set(q('[data-dark]'), { opacity: 0 })
        gsap.set(q('[data-caption]'), { opacity: 1 })
        return
      }

      const mm = gsap.matchMedia(section)
      mm.add({ wide: '(min-width: 1024px)', narrow: '(max-width: 1023px)' }, (ctx) => {
        const wide = ctx.conditions?.wide
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: wide ? '+=260%' : '+=180%', pin: true, scrub: 0.8 },
          })
          // Far off: a small frame, hazy with distance, closing in to fill the screen.
          // She starts low, on the horizon under the headline, and rises into place.
          .fromTo(
            q('[data-frame]'),
            { scale: wide ? 0.2 : 0.3, borderRadius: 48, y: 0, yPercent: wide ? 24 : 20 },
            { scale: 1, borderRadius: 0, y: 0, yPercent: 0, duration: 0.55, ease: 'power1.in' },
            0
          )
          .fromTo(q('[data-words]'), { y: 0, yPercent: -12 }, { y: 0, yPercent: 0, duration: 0.45, ease: 'power1.inOut' }, 0)
          .fromTo(q('[data-photo]'), { filter: 'blur(6px) brightness(0.75) saturate(0.7)' }, { filter: 'blur(0px) brightness(1) saturate(1)', duration: 0.5 }, 0)
          // And she keeps coming, bow first, after the frame is full.
          .fromTo(q('[data-photo]'), { scale: 1 }, { scale: 1.9, yPercent: 8, duration: 1, ease: 'power2.in' }, 0)
          .fromTo(q('[data-shade]'), { opacity: 0 }, { opacity: 0.45, duration: 0.4 }, 0.12)
          // The headline swaps to white over the photo, then she sails through it.
          .to(q('[data-dark]'), { opacity: 0, duration: 0.06 }, 0.42)
          .to(q('[data-light]'), { opacity: 1, duration: 0.06 }, 0.42)
          .to(q('[data-words]'), { scale: 1.5, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.7)
          .fromTo(q('[data-caption]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.82)
      })
    },
    { scope }
  )

  const Words = ({ light }: { light?: boolean }) => (
    <p
      className={`text-center text-[clamp(3.4rem,12vw,12rem)] font-extrabold leading-[0.9] tracking-[-0.05em] ${
        light ? 'text-white' : 'text-ink'
      }`}
    >
      One team.
      <br />
      <span className={light ? 'text-white' : 'text-signal'}>Every leg.</span>
    </p>
  )

  return (
    <section ref={scope} aria-label="One team, every leg" className="relative h-[100svh] overflow-hidden bg-white">
      <div aria-hidden="true" className="dots absolute inset-0 opacity-60" />

      {/* The ship, far off to start with. */}
      <div data-frame className="absolute inset-0 overflow-hidden will-change-transform" style={{ transform: 'scale(0.2)', borderRadius: 48 }}>
        <Image
          data-photo
          src="/images/photos/ship-head-on.webp"
          alt="A laden container ship coming head on"
          fill
          sizes="100vw"
          className="object-cover object-[50%_60%] will-change-transform"
        />
        <div data-shade aria-hidden="true" className="absolute inset-0 bg-deep opacity-0" />
      </div>

      {/* The headline sits in front of her the whole way. */}
      <div data-words aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div data-dark>
            <Words />
          </div>
          <div data-light className="absolute inset-0 opacity-0">
            <Words light />
          </div>
        </div>
      </div>

      <p
        data-caption
        className="absolute inset-x-0 bottom-10 px-6 text-center text-lg font-semibold text-white opacity-0 md:text-2xl"
      >
        Booking, customs, trucking and the port call.
        <span className="block text-white/70">One team on your file from gate to gate.</span>
      </p>
    </section>
  )
}
