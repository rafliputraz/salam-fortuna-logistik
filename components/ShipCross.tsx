'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/** Where the sea meets the sky, as a fraction of the section's height. */
const HORIZON = 0.58

/**
 * The ship coming in. A dusk sea, the headline in the sky, and the ship,
 * cut out of her photograph, far off on the horizon. She is always making
 * way toward you, creeping closer on her own and rocking gently; scrolling
 * brings her on, growing and dropping down the screen the way a ship does
 * as she nears, the haze of distance clearing, until she rises over the
 * headline and her bow fills the view.
 */
export default function ShipCross() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      if (prefersReducedMotion()) {
        gsap.set(q('[data-anchor]'), { scale: 0.55 })
        gsap.set(q('[data-caption]'), { opacity: 1 })
        return
      }

      // Under way on her own: a slow creep closer, and a gentle roll.
      const creep = gsap.to(q('[data-idle]'), { scale: 1.3, duration: 40, ease: 'none', paused: true })
      ScrollTrigger.create({ trigger: section, start: 'top 90%', onEnter: () => creep.play() })
      gsap.to(q('[data-roll]'), { rotation: 0.8, y: -3, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      const mm = gsap.matchMedia(section)
      mm.add({ wide: '(min-width: 1024px)', narrow: '(max-width: 1023px)' }, (ctx) => {
        const wide = ctx.conditions?.wide
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: wide ? '+=280%' : '+=200%', pin: true, scrub: 1 },
          })
          // Apparent size grows faster the nearer she gets, and her
          // waterline drops down the screen toward you.
          .fromTo(
            q('[data-anchor]'),
            { scale: wide ? 0.07 : 0.12, x: 0, y: 0 },
            { scale: wide ? 2 : 2.4, y: () => window.innerHeight * 0.75, duration: 1, ease: 'power2.in' },
            0
          )
          .fromTo(
            q('[data-haze]'),
            { filter: 'brightness(0.7) contrast(0.7) saturate(0.55) blur(1.2px)' },
            { filter: 'brightness(1) contrast(1) saturate(1) blur(0px)', duration: 0.7 },
            0
          )
          .to(q('[data-words]'), { scale: 1.06, duration: 0.8 }, 0)
          .to(q('[data-words]'), { opacity: 0, duration: 0.15 }, 0.8)
          .fromTo(q('[data-caption]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.9)
      })
    },
    { scope }
  )

  return (
    <section ref={scope} aria-label="One team, every leg" className="relative h-[100svh] overflow-hidden bg-deep">
      {/* Sky at dusk, brightest at the horizon. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, oklch(17% 0.04 262) 0%, oklch(26% 0.05 255) ${HORIZON * 60}%, oklch(58% 0.09 55) ${HORIZON * 100 - 1}%, oklch(70% 0.1 60) ${HORIZON * 100}%, oklch(24% 0.05 250) ${HORIZON * 100}%, oklch(15% 0.04 255) 100%)`,
        }}
      />
      {/* Glints on the water, drifting toward you. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 animate-[glint_7s_linear_infinite] opacity-40 motion-reduce:animate-none"
        style={{
          top: `${HORIZON * 100}%`,
          backgroundImage: 'repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.08) 0 1px, transparent 1px 14px)',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 h-24 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,oklch(80%_0.1_65/0.35),transparent_70%)]" style={{ top: `${HORIZON * 100}%` }} />

      {/* The headline, up in the sky. */}
      <div data-words className="pointer-events-none absolute inset-x-0 top-[17%] z-0 px-5 text-center">
        <p className="text-[clamp(3rem,9.5vw,9.5rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-white">
          One team.
          <br />
          <span className="text-white/60">Every leg.</span>
        </p>
      </div>

      {/* The ship, anchored by her waterline to the horizon. */}
      <div
        data-anchor
        aria-hidden="true"
        className="absolute z-10 will-change-transform"
        style={{
          bottom: `${(1 - HORIZON) * 100}%`,
          width: 'min(94vw, 76rem)',
          left: 'calc(50% - min(47vw, 38rem))',
          transformOrigin: '50% 100%',
          transform: 'scale(0.07)',
        }}
      >
        <div data-idle style={{ transformOrigin: '50% 100%' }}>
          <div data-haze>
            <div data-roll style={{ transformOrigin: '50% 100%' }}>
              <Image
                src="/images/photos/ship-head-on-cut.webp"
                alt=""
                width={1600}
                height={1060}
                sizes="(max-width: 1024px) 94vw, 76rem"
                className="relative h-auto w-full"
              />
              {/* Bow wave where she meets the water. */}
              <span className="absolute -bottom-[2%] left-[18%] right-[18%] h-[5%] rounded-[50%] bg-white/30 blur-md" />
            </div>
            {/* Her reflection. */}
            <Image
              src="/images/photos/ship-head-on-cut.webp"
              alt=""
              width={1600}
              height={1060}
              sizes="(max-width: 1024px) 94vw, 76rem"
              className="absolute left-0 top-full h-auto w-full -scale-y-100 opacity-25 blur-[2px]"
              style={{ maskImage: 'linear-gradient(to top, black, transparent 45%)', WebkitMaskImage: 'linear-gradient(to top, black, transparent 45%)' }}
            />
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-deep/80 to-transparent" />
      <p data-caption className="absolute inset-x-0 bottom-10 z-30 px-6 text-center text-lg font-semibold text-white opacity-0 md:text-2xl">
        Booking, customs, trucking and the port call.
        <span className="block text-white/70">One team on your file from gate to gate.</span>
      </p>
    </section>
  )
}
