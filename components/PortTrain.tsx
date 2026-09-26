'use client'

import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { PORTS } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'
import { boxColor, type BoxColor } from './Box'

const COLORS: BoxColor[] = ['cobalt', 'magenta', 'orange', 'green', 'red', 'mustard', 'steel']

/**
 * The gateways we move cargo through, painted on a train of boxes rolling
 * past on flatcars: the page's one marquee. It idles, picks up speed with
 * the scroll, and runs backwards when you scroll back up.
 */
export default function PortTrain() {
  const scope = useRef<HTMLElement>(null)
  const run = [...PORTS, ...PORTS]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = scope.current?.querySelector<HTMLElement>('[data-track]')
      if (!track) return
      const loop = gsap.to(track, { xPercent: -50, duration: 55, ease: 'none', repeat: -1 })
      let settle: gsap.core.Tween | undefined
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity() / 200
          const speed = gsap.utils.clamp(-8, 8, v === 0 ? 1 : v)
          settle?.kill()
          loop.timeScale(speed)
          settle = gsap.to(loop, { timeScale: speed < 0 ? -1 : 1, duration: 1.2, ease: 'power2.out' })
        },
      })
    },
    { scope }
  )

  return (
    <section ref={scope} aria-label="Ports we work" className="relative overflow-hidden bg-paper py-14 md:py-20">
      <h2 className="shell t-label mb-6 text-ink-2">Gateways we book and clear through</h2>
      <div className="mask-fade-x overflow-hidden">
        <ul data-track className="flex w-max items-end will-change-transform">
          {run.map((port, i) => (
            <li
              key={`${port.code}-${i}`}
              aria-hidden={i >= PORTS.length}
              className="mr-3 flex w-[15rem] shrink-0 flex-col md:w-[19rem]"
            >
              <div
                className="steel flex h-[6.5rem] flex-col justify-between px-4 py-3 text-paper md:h-[8rem]"
                style={{ '--c': boxColor(COLORS[i % COLORS.length]), '--rib': '11px' } as CSSProperties}
              >
                <span className="t-label opacity-85">{port.code}</span>
                <span className="t-head text-[1.7rem] md:text-[2.1rem]">{port.name}</span>
              </div>
              {/* Flatcar and bogies. */}
              <div aria-hidden="true" className="relative h-4">
                <div className="absolute inset-x-1 top-0 h-2 bg-ink" />
                <span className="absolute left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-paper" />
                <span className="absolute left-10 top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-paper" />
                <span className="absolute right-10 top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-paper" />
                <span className="absolute right-5 top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-paper" />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="h-[3px] bg-ink/80" />
    </section>
  )
}
