'use client'

import { useRef } from 'react'
import { PORTS } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * The gateways we book through, drifting past under the hero. Scrolling
 * speeds the strip up and turns it with you; it eases back to its own
 * pace when you stop.
 */
export default function PortStrip() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = scope.current!.querySelector('[data-track]')
      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
      // Scroll kicks the speed up and sets the direction; it eases back.
      let dir = 1
      let target = 1
      let speed = 1
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          dir = self.direction
          target = dir * gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 300)
        },
      })
      const tick = () => {
        target += (dir - target) * 0.04
        speed += (target - speed) * 0.1
        loop.timeScale(speed)
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope }
  )

  const run = [...PORTS, ...PORTS]
  return (
    <div ref={scope} aria-hidden="true" className="overflow-hidden border-y border-line bg-white py-6">
      <div data-track className="flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {run.map((p, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-4 whitespace-nowrap px-8 text-2xl font-semibold tracking-tight text-ink/80 md:text-3xl">
                <span className="rounded-md bg-paper-3 px-2 py-1 text-xs font-bold tracking-normal text-ink-3">{p.code}</span>
                {p.name}
                <span className="ml-8 h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
