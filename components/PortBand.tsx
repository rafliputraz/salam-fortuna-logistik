'use client'

import { useRef } from 'react'
import { PORTS } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * The gateways we move cargo through, running as the page's one marquee.
 * It idles slowly and picks up with the scroll, the way a quay seems to
 * move faster the harder the ship is making way; scroll back up and it
 * runs astern.
 */
export default function PortBand() {
  const scope = useRef<HTMLElement>(null)
  const run = [...PORTS, ...PORTS]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = scope.current?.querySelector<HTMLElement>('[data-track]')
      if (!track) return

      const loop = gsap.to(track, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 })
      let settle: gsap.core.Tween | undefined

      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity() / 220
          const speed = gsap.utils.clamp(-7, 7, v === 0 ? 1 : v)
          settle?.kill()
          loop.timeScale(speed)
          settle = gsap.to(loop, { timeScale: speed < 0 ? -1 : 1, duration: 1.1, ease: 'power2.out' })
        },
      })
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      aria-label="Ports we work"
      className="relative overflow-hidden border-y border-rule bg-abyss py-10 md:py-14"
    >
      <h2 className="sr-only">Ports we work</h2>
      <div className="mask-fade-x overflow-hidden">
        <ul data-track className="flex w-max items-baseline will-change-transform">
          {run.map((port, i) => (
            <li
              key={`${port.code}-${i}`}
              className="flex shrink-0 items-baseline"
              aria-hidden={i >= PORTS.length}
            >
              <span
                className={`t-display text-[clamp(3rem,8vw,7rem)] ${
                  i % 2 ? 't-stencil' : 'text-foam'
                }`}
              >
                {port.name}
              </span>
              <span className="t-label ml-4 text-signal-lift">{port.code}</span>
              <span aria-hidden="true" className="mx-8 h-2 w-2 rotate-45 bg-rule-strong md:mx-14" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
