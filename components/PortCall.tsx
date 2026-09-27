'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { HUSBANDRY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/** What the AIS tag says as she comes in. */
const STATUS = ['Underway, 12.4 kn', 'Pilot on board', 'Making fast', 'All fast · alongside']

const wave = (w: number, h: number, amp: number, opacity: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Cpath d='M0 ${h / 2} Q${w / 8} ${h / 2 - amp} ${w / 4} ${h / 2} T${w / 2} ${h / 2} T${(w * 3) / 4} ${h / 2} T${w} ${h / 2}' fill='none' stroke='%237fe3f0' stroke-opacity='${opacity}' stroke-width='1.5'/%3E%3C/svg%3E")`

/**
 * Ship agency. The ship comes in from the left as you scroll, her AIS tag
 * riding with her and updating as she closes the berth, while the four
 * things we have ready for the master tick off one by one. On a wide screen
 * the section holds still for the whole approach.
 */
export default function PortCall() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = scope.current
      if (!section || prefersReducedMotion()) return
      const q = gsap.utils.selector(section)
      const items = q('[data-item]')
      const status = q('[data-status]')[0]

      const onUpdate = (p: number) => {
        items.forEach((el, i) => el.classList.toggle('is-done', p > 0.15 + i * 0.2))
        const s = STATUS[Math.min(STATUS.length - 1, Math.floor(p * STATUS.length))]
        if (status && status.textContent !== s) status.textContent = s
      }

      const build = (extra: ScrollTrigger.Vars) =>
        gsap.fromTo(
          q('[data-ship]'),
          // x is pinned to 0 so a remount can't leave a pixel offset stacked on the percent.
          { xPercent: -110, x: 0 },
          { xPercent: 45, x: 0, ease: 'none', scrollTrigger: { scrub: 0.8, onUpdate: (self) => onUpdate(self.progress), ...extra } }
        )

      const mm = gsap.matchMedia(section)
      mm.add('(min-width: 1024px)', () => build({ trigger: section, start: 'top top', end: '+=140%', pin: true }))
      mm.add('(max-width: 1023px)', () => build({ trigger: q('[data-sea]')[0], start: 'top bottom', end: 'bottom 30%' }))
    },
    { scope }
  )

  return (
    <section ref={scope} id="agency" className="relative flex flex-col overflow-hidden border-t border-line bg-paper lg:h-[100svh]">
      <div className="shell relative z-20 grid gap-10 pt-24 md:pt-28 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-7">
          <p className="t-label text-cyan">Ship agency · port call</p>
          <h2 data-split className="t-display mt-5 max-w-[13ch] text-[length:var(--text-display-s)] text-ink">
            Alongside before the pilot boards.
          </h2>
          <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            A port call goes wrong in the gaps: the permit nobody filed, the crew change
            nobody booked. Our agents deal with KSOP, Bea Cukai, Karantina and Imigrasi
            directly, and the master gets one point of contact.
          </p>
        </div>

        <div data-reveal className="bezel self-end p-6 lg:col-span-5">
          <p className="t-label text-ink-3">Pre-arrival checklist</p>
          <ul className="mt-4 space-y-4">
            {HUSBANDRY.map((h) => (
              <li key={h.title} data-item className="group flex gap-4 [&.is-done_.box]:border-go [&.is-done_.box]:bg-go/15 [&.is-done_.tick]:opacity-100">
                <span className="box mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-line-strong transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="tick h-4 w-4 text-go opacity-0 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                </span>
                <div>
                  <p className="t-head text-[1.45rem] text-ink">{h.title}</p>
                  <p className="text-[0.95rem] leading-relaxed text-ink-2">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The sea, at night, with her in it. */}
      <div data-sea aria-hidden="true" className="relative mt-10 h-[17rem] sm:h-[22rem] lg:mt-0 lg:h-auto lg:min-h-[21rem] lg:flex-1">
        <div className="chart-grid absolute inset-0 opacity-60" />
        <div
          className="absolute inset-x-0 bottom-0 h-[45%] animate-[swell_22s_linear_infinite] motion-reduce:animate-none"
          style={{ backgroundImage: wave(260, 36, 7, 0.35), backgroundSize: '260px 36px' }}
        />

        <div data-ship className="absolute bottom-[14%] left-[18%] w-[min(88vw,40rem)] will-change-transform">
          {/* AIS tag riding with her. */}
          <div className="absolute -top-2 left-[58%] z-10 hidden -translate-y-full sm:block">
            <div className="bezel whitespace-nowrap px-4 py-3">
              <p className="t-label text-cyan">AIS · your vessel</p>
              <p className="t-label mt-1 text-ink">
                <span data-status>{STATUS[0]}</span>
              </p>
              <p className="t-label mt-1 text-ink-3">Agent · SFL IDPNJ</p>
            </div>
            <span className="ml-6 block h-10 w-px bg-cyan/60" />
          </div>
          <div className="animate-[bob_5s_ease-in-out_infinite] motion-reduce:animate-none">
            <Image
              src="/images/ship/ship.webp"
              alt=""
              width={1750}
              height={860}
              sizes="(max-width: 768px) 88vw, 40rem"
              loading="eager"
              className="h-auto w-full brightness-[0.8] saturate-[0.85] drop-shadow-[0_0_30px_oklch(var(--c-cyan)/0.15)]"
            />
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 z-10 h-[20%] animate-[swell_11s_linear_infinite_reverse] motion-reduce:animate-none"
          style={{
            backgroundImage: `${wave(180, 26, 5, 0.5)}, linear-gradient(to bottom, oklch(var(--c-paper) / 0.6), oklch(var(--c-paper)))`,
            backgroundSize: '180px 26px, 100% 100%',
          }}
        />
      </div>
    </section>
  )
}
