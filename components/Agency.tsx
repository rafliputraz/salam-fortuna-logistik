'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/** A swell line, drawn once and tiled. */
const wave = (w: number, h: number, amp: number, stroke: number, opacity: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Cpath d='M0 ${h / 2} Q${w / 8} ${h / 2 - amp} ${w / 4} ${h / 2} T${w / 2} ${h / 2} T${(w * 3) / 4} ${h / 2} T${w} ${h / 2}' fill='none' stroke='white' stroke-opacity='${opacity}' stroke-width='${stroke}'/%3E%3C/svg%3E")`

/**
 * Ship agency, on the page's one full colour block.
 *
 * The real ship comes in bow first from the left and crosses to the right as
 * you scroll past, riding a few layers of drifting swell. The four things we
 * handle for the master tick off beneath her.
 */
export default function Agency() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      // She crosses left to right while the sea is on screen.
      gsap.fromTo(
        q('[data-ship]'),
        { xPercent: -95 },
        {
          xPercent: 70,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-sea]')[0], start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        }
      )

      // Each thing we handle ticks off as it comes into view.
      q('[data-tick] path').forEach((path) => {
        gsap.from(path, {
          drawSVG: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: path, start: 'top 85%' },
        })
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="agency" className="relative overflow-hidden bg-box-cobalt text-paper">
      <div className="flex h-full flex-col">
        <div className="shell relative z-20 pt-24 md:pt-28">
          <div>
            <h2 data-split className="t-display max-w-[13ch] text-[length:var(--text-display-s)]">
              Alongside before the pilot boards.
            </h2>
            <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
              A port call goes wrong in the gaps: the permit nobody filed, the crew
              change nobody booked. Our agents deal with KSOP, Bea Cukai, Karantina and
              Imigrasi directly, and the master gets one point of contact.
            </p>
          </div>
        </div>

        {/* The sea, and her in it. */}
        <div data-sea aria-hidden="true" className="relative mt-6 h-[15rem] sm:h-[20rem] lg:h-[26rem]">
          <div
            className="swell absolute inset-x-0 bottom-0 h-[46%] [--swell-dist:-640px] [--swell-speed:26s]"
            style={{ backgroundImage: wave(320, 44, 9, 2, 0.14), backgroundSize: '320px 44px' }}
          />

          <div data-ship className="absolute bottom-[20%] left-[20%] w-[min(82vw,46rem)] will-change-transform">
            <div className="ship-bob relative">
              {/* Wake churning astern, and the bow wave ahead. */}
              <span className="wake absolute bottom-[1%] right-[88%] h-[11%] w-[75%]" />
              <span className="bow-wave absolute bottom-[1%] left-[88%] h-[9%] w-[14%]" />
              <Image
                src="/images/ship/ship.webp"
                alt=""
                width={1750}
                height={860}
                sizes="(max-width: 768px) 82vw, 46rem"
                className="relative h-auto w-full drop-shadow-[0_24px_24px_oklch(var(--c-ink)/0.35)]"
              />
            </div>
          </div>

          {/* The nearest swell washes over her waterline. */}
          <div
            className="swell absolute inset-x-0 bottom-0 z-10 h-[24%] [--swell-dist:-660px] [--swell-speed:14s]"
            style={{
              backgroundImage: `${wave(220, 30, 6, 2.5, 0.28)}, linear-gradient(to bottom, oklch(var(--c-box-cobalt) / 0.55), oklch(var(--c-box-cobalt)))`,
              backgroundSize: '220px 30px, 100% 100%',
            }}
          />
          <div
            className="swell swell-reverse absolute inset-x-0 bottom-0 z-10 h-[12%] [--swell-dist:-640px] [--swell-speed:9s]"
            style={{ backgroundImage: wave(160, 22, 4, 2, 0.35), backgroundSize: '160px 22px' }}
          />
        </div>

        <div className="relative z-20 bg-ink/25">
          <dl className="shell grid gap-x-10 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-8">
            {HUSBANDRY.map((item) => (
              <div key={item.title} data-reveal className="flex gap-3 border-t-2 border-paper/25 py-5">
                <svg
                  data-tick
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="mt-1 h-6 w-6 shrink-0 text-box-mustard"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12.5l5 5L20 6.5" />
                </svg>
                <div>
                  <dt className="t-head text-[1.35rem]">{item.title}</dt>
                  <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-paper/80">{item.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
