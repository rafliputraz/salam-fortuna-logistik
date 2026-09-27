'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, PRIMARY_CTA, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { Anchor, ArrowRight, Check, Clock, Phone, Ship } from './icons'

const STEPS = ['Booked', 'Stuffed', 'Sailed', 'Cleared', 'Delivered']

/** Time in Panjang, and whether the office is staffed, from the published hours. */
function useDesk() {
  const [state, setState] = useState<{ time: string; open: boolean } | null>(null)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 7 * 60) * 60_000)
      const h = COMPANY.hours
      setState({
        time: `${String(wib.getHours()).padStart(2, '0')}:${String(wib.getMinutes()).padStart(2, '0')}`,
        open: (h.openDays as readonly number[]).includes(wib.getDay()) && wib.getHours() >= h.openHour && wib.getHours() < h.closeHour,
      })
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])
  return state
}

/**
 * Split hero. The words on the left; on the right a photograph of the
 * terminal that unmasks as the page opens, with two small cards floating
 * over it: one file ticking through the five stages of a shipment, and the
 * desk's local time. The photo drifts slower than the page on scroll.
 */
export default function Hero() {
  const scope = useRef<HTMLElement>(null)
  const desk = useDesk()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      let split: SplitText | undefined
      let cancelled = false

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo(q('[data-frame]'), { clipPath: 'inset(10% 10% 10% 10% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.6, ease: 'power3.inOut' }, 0.1)
        .from(q('[data-photo]'), { scale: 1.25, duration: 2, ease: 'power3.out' }, 0.1)
        .from(q('[data-float]'), { opacity: 0, y: 30, scale: 0.96, duration: 0.9, stagger: 0.15 }, 1)
        .from(q('[data-step]'), { opacity: 0.25, duration: 0.3, stagger: 0.28, ease: 'none' }, 1.5)
        .from(q('[data-bar]'), { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power2.inOut' }, 1.5)
        .from(q('[data-proof]'), { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, 1.1)

      Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(() => {
        if (cancelled) return
        split = SplitText.create(q('[data-headline]'), { type: 'lines', mask: 'lines' })
        tl.from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.09, onComplete: () => split?.revert() }, 0.2).from(
          q('[data-hero-fade]'),
          { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 },
          0.6
        )
      })

      gsap.to(q('[data-photo]'), {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope }
  )

  return (
    <section ref={scope} id="top" className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
      <div aria-hidden="true" className="dots absolute inset-x-0 top-0 h-[70%] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="shell relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p data-hero-fade className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-2 shadow-sm">
            <span className="rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-bold text-signal">{COMPANY.basePort.code}</span>
            {COMPANY.tagline}, {COMPANY.basePort.name}
          </p>
          <h1 data-headline className="t-display mt-7 text-[length:var(--text-display)] text-ink">
            Freight, customs and port calls, handled end to end.
          </h1>
          <p data-hero-fade className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-2">
            Sea freight, customs clearance, inland trucking and ship agency out of Panjang,
            Lampung. One team on your file from booking to delivery.
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className="btn-signal">
              {PRIMARY_CTA}
              <ArrowRight className="btn-arrow h-4 w-4" />
            </a>
            <a href={telHref} className="btn-ghost">
              <Phone className="h-4 w-4" />
              Call the desk
            </a>
          </div>

          <ul className="mt-12 grid max-w-xl gap-5 border-t border-line pt-8 sm:grid-cols-3">
            {[
              { Icon: Ship, t: 'Booked direct', d: 'with the carriers' },
              { Icon: Anchor, t: 'Own staff', d: `at ${COMPANY.basePort.name}` },
              { Icon: Clock, t: 'Port line', d: 'answers 24 hours' },
            ].map(({ Icon, t, d }) => (
              <li key={t} data-proof className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper-3 text-ink">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-sm leading-snug">
                  <span className="block font-semibold text-ink">{t}</span>
                  <span className="text-ink-3">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6">
          <div data-frame className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-paper-3 sm:aspect-[5/4] lg:aspect-[6/7]">
            <Image
              data-photo
              src="/images/photos/terminal.webp"
              alt="Container terminal with ship-to-shore cranes over stacked containers"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42rem"
              className="object-cover object-[30%_50%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent" />
          </div>

          {/* One file, five stages. Illustrative of how a shipment reports. */}
          <div data-float aria-hidden="true" className="absolute -bottom-8 left-4 right-4 sm:left-auto sm:right-[-1rem] sm:w-[22rem] lg:-left-10 lg:right-auto">
            <div className="glass float rounded-2xl p-5 shadow-[0_24px_48px_-20px_oklch(var(--c-ink)/0.35)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">One file, end to end</p>
                <span className="rounded-full bg-go/15 px-2.5 py-0.5 text-xs font-semibold text-go">On track</span>
              </div>
              <div className="relative mt-5">
                <span className="absolute left-3 right-3 top-3 h-0.5 bg-line" />
                <span data-bar className="absolute left-3 top-3 h-0.5 w-[70%] bg-signal" />
                <ol className="relative flex justify-between">
                  {STEPS.map((s, i) => (
                    <li key={s} data-step className="flex flex-col items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i < 4 ? 'bg-signal text-white' : 'bg-white text-ink-3 ring-1 ring-line-strong'}`}>
                        {i < 4 ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </span>
                      <span className="text-[0.7rem] font-medium text-ink-2">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div data-float className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <div className="glass float rounded-2xl px-4 py-3 shadow-lg [animation-delay:-3s]">
              <p className="text-xs font-medium text-ink-3">Panjang desk · WIB</p>
              <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="tabular-nums">{desk?.time ?? '--:--'}</span>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${desk?.open ? 'bg-go' : 'bg-ink-3'}`} />
                <span className="font-medium text-ink-2">{desk ? (desk.open ? 'Office open' : 'Port line open') : ''}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
