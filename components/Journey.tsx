'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import { useRef } from 'react'
import { VOYAGE } from '@/lib/company'
import { boxColor, containerSrc, type Paint, VIEWS } from '@/lib/containers'
import { gsap, useGSAP } from '@/lib/motion'
import { LEG_ICONS } from './icons'

/** One paint per leg, so the box visibly changes hands as it moves. */
const LEG_PAINTS: Paint[] = ['cobalt', 'orange', 'green', 'magenta', 'red']

/**
 * The five legs of a shipment, told by one box on a crane.
 *
 * The container comes down on its wires as the section arrives and hangs
 * there, swinging gently the way a load does. On a wide screen the section
 * pins and, leg by leg, the crane lifts and slews it while it takes on each
 * leg's colour and the words for that leg cross-fade beside it. On a phone,
 * or with reduced motion, the legs are simply listed under the box.
 */
export default function Journey() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const load = q('[data-load]')[0]
      const paints = q('[data-paint]')
      const legs = q('[data-leg]')
      const ticks = q('[data-tick]')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      // A load on a hook never quite stops: a slow pendulum from the hook.
      gsap.fromTo(load, { rotate: -2.2 }, { rotate: 2.2, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // Lowered in on its wires as the section comes up.
      gsap.from(q('[data-crane]'), {
        yPercent: -70,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 20%', scrub: 0.8 },
      })

      const mm = gsap.matchMedia(section)
      mm.add('(min-width: 1024px)', () => {
        section.classList.add('is-pin')
        gsap.set(legs, { autoAlpha: 0, y: 30 })
        gsap.set(legs[0], { autoAlpha: 1, y: 0 })

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

        // Each leg: the crane hoists and slews, and the box takes the new paint.
        const slew = [0, -9, 6, -4, 8]
        const hoist = [0, -7, 3, -5, 0]
        for (let i = 1; i < VOYAGE.length; i++) {
          const at = i - 1
          // Words swap in the middle of the move, so each leg gets a
          // stretch of scroll where it reads fully.
          tl.to(q('[data-crane]'), { xPercent: slew[i], yPercent: hoist[i], duration: 1 }, at)
            .to(paints[i], { opacity: 1, duration: 0.3 }, at + 0.35)
            .to(legs[i - 1], { autoAlpha: 0, y: -30, duration: 0.2 }, at + 0.3)
            .to(legs[i], { autoAlpha: 1, y: 0, duration: 0.2 }, at + 0.5)
        }
        // A last beat on the final leg before the pin lets go.
        tl.to({}, { duration: 0.4 })
        return () => section.classList.remove('is-pin')
      })
    },
    { scope }
  )

  const hang = VIEWS.hanging

  return (
    <section ref={scope} id="journey" className="group relative overflow-hidden bg-paper-2">
      <div className="shell grid items-center gap-10 py-24 md:py-32 lg:h-[100dvh] lg:grid-cols-12 lg:py-0">
        <div className="lg:col-span-5">
          <h2 data-split className="t-display text-[length:var(--text-4xl)] text-ink">
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
                      className="flex h-9 w-9 items-center justify-center rounded-full text-paper"
                      style={{ background: boxColor(LEG_PAINTS[i]) } as CSSProperties}
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

        {/* The crane's load. The wires run up out of the frame. */}
        <div aria-hidden="true" className="relative order-first h-[23rem] sm:h-[30rem] lg:order-none lg:col-span-7 lg:h-full">
          <div data-crane className="absolute inset-x-0 top-0 mx-auto h-full w-[min(78%,40rem)] will-change-transform lg:w-[min(100%,40rem)]">
            {/* Swings from a trolley far overhead, so the wire and box move as one. */}
            <div
              data-load
              className="absolute left-0 right-0 top-[4%] will-change-transform"
              style={{ transformOrigin: '53.4% -140%' }}
            >
              <span className="absolute inset-x-0 bottom-[99%] h-[150%] bg-[url(/images/containers/cable.webp)] bg-[length:100%_auto] bg-repeat-y" />
              <div className="relative">
                {LEG_PAINTS.map((p, i) => (
                  <Image
                    key={p}
                    data-paint
                    src={containerSrc('hanging', p)}
                    alt=""
                    width={hang.w}
                    height={hang.h}
                    sizes="(max-width: 1024px) 90vw, 40rem"
                    className={`h-auto w-full ${i === 0 ? 'relative' : 'absolute inset-0 opacity-0'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* The quay the box will land on. */}
          <div className="absolute inset-x-[12%] bottom-[6%] h-[5%] rounded-[50%] bg-ink/10 blur-md" />
        </div>
      </div>
    </section>
  )
}
