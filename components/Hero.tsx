'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, PRIMARY_CTA, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { Anchor, ArrowRight, Check, Clock, Phone, Ship } from './icons'

const STEPS = ['Booked', 'Stuffed', 'Sailed', 'Cleared', 'Delivered']
const ROTOR = ['Sea freight', 'Customs clearance', 'Inland trucking', 'Ship agency', 'Husbandry']

/** Steps through the shipment card on a loop, pausing on delivered. */
function useStage(live: boolean) {
  const [stage, setStage] = useState(3)
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setStage((s) => (s >= STEPS.length + 1 ? 0 : s + 1)), 1100)
    return () => window.clearInterval(id)
  }, [live])
  return Math.min(stage, STEPS.length)
}

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
 * Split hero. The words on the left, the badge rolling through what we do;
 * on the right a photograph of the terminal that unmasks as the page opens
 * and leans toward the mouse, with two cards floating over it: one file
 * stepping through the five stages of a shipment on a loop, and the desk's
 * local time. A route sweeps behind it all with a ship working along it.
 */
export default function Hero() {
  const scope = useRef<HTMLElement>(null)
  const desk = useDesk()
  const [live, setLive] = useState(false)
  const stage = useStage(live)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      gsap.set(q('[data-tilt]'), { transformPerspective: 1400 })
      let split: SplitText | undefined
      let cancelled = false

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo(q('[data-frame]'), { clipPath: 'inset(10% 10% 10% 10% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.6, ease: 'power3.inOut' }, 0.1)
        .from(q('[data-photo]'), { scale: 1.25, duration: 2, ease: 'power3.out' }, 0.1)
        .from(q('[data-float]'), { opacity: 0, y: 30, scale: 0.96, duration: 0.9, stagger: 0.15 }, 1)
        .from(q('[data-proof]'), { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, 1.1)
        .from(q('[data-route]'), { drawSVG: '0%', duration: 2.4, ease: 'power2.inOut' }, 0.4)
        .add(() => setLive(true), 1.8)

      // The badge rolls through what we do.
      const rotor = q('[data-rotor]')[0]
      const rows = rotor?.children.length ?? 1
      const roll = gsap.timeline({ repeat: -1, delay: 2 })
      for (let i = 1; i < rows; i++) roll.to(rotor, { yPercent: (-100 / rows) * i, duration: 0.6, ease: 'power3.inOut' }, `+=1.6`)
      roll.set(rotor, { yPercent: 0 })

      // A ship making her way along the route behind everything.
      const route = scope.current!.querySelector<SVGPathElement>('[data-route]')!
      gsap.to(q('[data-route-ship]'), {
        motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true },
        duration: 26,
        repeat: -1,
        ease: 'none',
      })

      // The photo leans toward a mouse, the cards a little further.
      const stageEl = scope.current!.querySelector<HTMLElement>('[data-stage]')!
      const rx = gsap.quickTo(q('[data-tilt]'), 'rotationX', { duration: 0.8, ease: 'power3.out' })
      const ry = gsap.quickTo(q('[data-tilt]'), 'rotationY', { duration: 0.8, ease: 'power3.out' })
      const fx = gsap.quickTo(q('[data-float-wrap]'), 'x', { duration: 1, ease: 'power3.out' })
      const fy = gsap.quickTo(q('[data-float-wrap]'), 'y', { duration: 1, ease: 'power3.out' })
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        const r = stageEl.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        ry(nx * 8)
        rx(-ny * 6)
        fx(nx * 18)
        fy(ny * 14)
      }
      const onLeave = () => {
        rx(0)
        ry(0)
        fx(0)
        fy(0)
      }
      stageEl?.addEventListener('pointermove', onMove)
      stageEl?.addEventListener('pointerleave', onLeave)

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
        stageEl?.removeEventListener('pointermove', onMove)
        stageEl?.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope }
  )

  return (
    <section ref={scope} id="top" className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
      <div aria-hidden="true" className="dots absolute inset-x-0 top-0 h-[70%] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      {/* A shipping route sweeping behind the page, with a ship on it. */}
      <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <path
          data-route
          d="M-40 880 C 240 830, 460 900, 700 862 S 1120 820, 1500 850"
          fill="none"
          className="stroke-signal/40"
          strokeWidth={1.5}
          strokeDasharray="2 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <g data-route-ship>
          <circle r={14} className="fill-signal/10" />
          <path d="M8 0 L-6 -5 L-3 0 L-6 5 Z" className="fill-signal" />
        </g>
      </svg>
      <div className="shell relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p data-hero-fade className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-2 shadow-sm">
            <span className="rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-bold text-signal">{COMPANY.basePort.code}</span>
            <span className="sr-only">{COMPANY.tagline}, {COMPANY.basePort.name}</span>
            <span aria-hidden="true">{COMPANY.basePort.name}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink-3" />
            <span aria-hidden="true" className="relative inline-flex h-[1.5em] overflow-hidden">
              <span data-rotor className="flex flex-col">
                {[...ROTOR, ROTOR[0]].map((w, i) => (
                  <span key={i} className="flex h-[1.5em] items-center whitespace-nowrap font-semibold text-ink">
                    {w}
                  </span>
                ))}
              </span>
            </span>
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

        <div data-stage className="relative lg:col-span-6">
          <div data-tilt className="will-change-transform">
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
          </div>

          {/* One file, five stages. Illustrative of how a shipment reports. */}
          <div data-float-wrap aria-hidden="true" className="absolute -bottom-8 left-4 right-4 sm:left-auto sm:right-[-1rem] sm:w-[22rem] lg:-left-10 lg:right-auto">
          <div data-float>
            <div className="glass float rounded-2xl p-5 shadow-[0_24px_48px_-20px_oklch(var(--c-ink)/0.35)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">One file, end to end</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-300 ${
                    stage >= STEPS.length ? 'bg-go text-white' : 'bg-go/15 text-go'
                  }`}
                >
                  {stage >= STEPS.length ? 'Delivered' : stage === 0 ? 'New booking' : `${STEPS[stage - 1]}`}
                </span>
              </div>
              <div className="relative mt-5">
                <span className="absolute left-3 right-3 top-3 h-0.5 bg-line" />
                <span
                  className="absolute left-3 top-3 h-0.5 origin-left bg-signal transition-transform duration-700 ease-[var(--ease-out)]"
                  style={{ right: '0.75rem', transform: `scaleX(${Math.max(0, stage - 1) / (STEPS.length - 1)})` }}
                />
                <ol className="relative flex justify-between">
                  {STEPS.map((s, i) => {
                    const done = i < stage
                    return (
                      <li key={s} className="flex flex-col items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-[background-color,box-shadow,transform] duration-300 ${
                            done ? 'scale-100 bg-signal text-white' : 'scale-90 bg-white text-ink-3 ring-1 ring-line-strong'
                          } ${i === stage - 1 ? 'shadow-[0_0_0_6px_oklch(var(--c-signal)/0.15)]' : ''}`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        <span className={`text-[0.7rem] font-medium transition-colors duration-300 ${done ? 'text-ink' : 'text-ink-3'}`}>{s}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
          </div>

          <div data-float-wrap className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <div data-float>
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
      </div>
    </section>
  )
}
