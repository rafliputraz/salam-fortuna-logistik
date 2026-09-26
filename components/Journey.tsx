'use client'

import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { VOYAGE } from '@/lib/company'
import { gsap, useGSAP } from '@/lib/motion'
import Box, { type BoxColor } from './Box'
import { LEG_ICONS } from './icons'

/** One paint per leg, so the box visibly changes hands as it moves. */
const LEG_COLORS: BoxColor[] = ['cobalt', 'orange', 'green', 'magenta', 'red']

const paintOf = (c: BoxColor) =>
  `oklch(${getComputedStyle(document.documentElement).getPropertyValue(`--c-box-${c}`).trim()})`

/**
 * The five legs of a shipment, told by one box.
 *
 * On a wide screen the section pins and a single container turns a quarter
 * at a time as the story moves from leg to leg, repainting as it goes, while
 * the words for each leg cross-fade beside it. On a phone, or with reduced
 * motion, the legs are simply listed in order.
 */
export default function Journey() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const rig = q('[data-rig]')[0] as HTMLElement
      const legs = q('[data-leg]')
      const ticks = q('[data-tick]')
      const mm = gsap.matchMedia(section)

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-pin')
        gsap.set(legs, { autoAlpha: 0, y: 30 })
        gsap.set(legs[0], { autoAlpha: 1, y: 0 })
        rig.style.setProperty('--c', paintOf(LEG_COLORS[0]))

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * (VOYAGE.length - 1) * 0.9}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const active = Math.round(self.progress * (VOYAGE.length - 1))
              ticks.forEach((t, i) => t.classList.toggle('is-active', i <= active))
            },
          },
        })

        for (let i = 1; i < VOYAGE.length; i++) {
          const at = i - 1
          tl.fromTo(
            rig,
            { '--ry': `${-30 + (i - 1) * 90}deg`, '--c': paintOf(LEG_COLORS[i - 1]) },
            { '--ry': `${-30 + i * 90}deg`, '--c': paintOf(LEG_COLORS[i]), duration: 1, immediateRender: i === 1 },
            at
          )
            .to(legs[i - 1], { autoAlpha: 0, y: -30, duration: 0.45 }, at + 0.1)
            .to(legs[i], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.5)
        }
        return () => section.classList.remove('is-pin')
      })
    },
    { scope }
  )

  return (
    <section ref={scope} id="journey" className="group relative overflow-hidden bg-paper-2">
      <div className="shell grid items-center gap-12 py-24 md:py-32 lg:h-[100dvh] lg:grid-cols-12 lg:py-0">
        <div className="lg:col-span-5">
          <h2 data-reveal className="t-display text-[length:var(--text-4xl)] text-ink">
            One file, from your gate to theirs.
          </h2>
          <p data-reveal className="mt-5 max-w-md leading-relaxed text-ink-2">
            Most forwarders hand you off three times between booking and delivery. The
            same team carries this one the whole way.
          </p>

          <ol aria-hidden="true" className="mt-8 hidden gap-2 group-[.is-pin]:flex">
            {VOYAGE.map((leg) => (
              <li
                key={leg.code}
                data-tick
                className="h-1.5 flex-1 rounded-full bg-ink/10 transition-colors duration-300 [&.is-active]:bg-signal"
              />
            ))}
          </ol>

          <ol className="mt-10 grid gap-10 group-[.is-pin]:mt-8 group-[.is-pin]:gap-0">
            {VOYAGE.map((leg, i) => {
              const Icon = LEG_ICONS[leg.code]
              return (
                <li key={leg.code} data-leg className="group-[.is-pin]:[grid-area:1/1]">
                  <div className="flex items-center gap-3">
                    <span
                      className="steel flex h-9 w-14 items-center justify-center text-paper"
                      style={{ '--c': `oklch(var(--c-box-${LEG_COLORS[i]}))`, '--rib': '7px' } as CSSProperties}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="t-label text-ink-2">
                      Leg {i + 1} of {VOYAGE.length}
                    </span>
                  </div>
                  <h3 className="t-head mt-4 text-[clamp(1.8rem,3vw,2.6rem)] text-ink">{leg.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-ink-2">{leg.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {leg.detail.map((d) => (
                      <li key={d} className="rounded-full border-2 border-ink/10 px-3.5 py-1.5 text-sm font-medium text-ink">
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
        </div>

        <div
          aria-hidden="true"
          className="relative hidden h-[30rem] lg:col-span-7 group-[.is-pin]:block"
          style={{ perspective: '1600px' }}
        >
          <div
            data-rig
            className="absolute left-1/2 top-1/2 [--u:clamp(26px,2.7vw,38px)]"
            style={
              {
                '--ry': '-30deg',
                '--c': 'oklch(var(--c-box-cobalt))',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(-16deg) rotateY(var(--ry))',
              } as CSSProperties
            }
          >
            <div
              className="absolute left-0 top-0"
              style={{
                width: 'calc(var(--u) * 18)',
                height: 'calc(var(--u) * 18)',
                transform: 'translate(-50%, -50%) translateY(calc(var(--u) * 1.35)) rotateX(90deg)',
                background: 'radial-gradient(closest-side, oklch(var(--c-ink) / 0.22), transparent)',
              }}
            />
            <Box label="Your cargo" code="One file" />
          </div>
        </div>
      </div>
    </section>
  )
}
