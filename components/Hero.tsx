'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { COMPANY, PARTICULARS } from '@/lib/company'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { ArrowDown, ArrowRight } from './icons'
import SeaField from './SeaField'

const SCOPE = [
  'Panjang · Priok · Perak · Belawan',
  'FCL · LCL · breakbulk · project',
  'Port cover, 24 hours',
]

export default function Hero() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const intro = q('[data-intro]')

      if (prefersReducedMotion()) {
        gsap.set(intro, { opacity: 1 })
        return
      }

      let split: SplitText | undefined
      let cancelled = false
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        paused: true,
        // Put the headline markup back once the reveal is done, so later
        // resizes re-wrap natively instead of inside frozen line wrappers.
        onComplete: () => split?.revert(),
      })

      // Split after webfonts settle, otherwise the line breaks are measured
      // against the fallback face and the mask reveals the wrong slices. The
      // race is a safety net: a stalled font must never leave the hero blank.
      const fontsSettled = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ])

      fontsSettled.then(() => {
        if (cancelled) return

        split = SplitText.create(q('[data-headline]'), {
          type: 'lines',
          mask: 'lines',
        })

        gsap.set(intro, { opacity: 1 })

        tl.from(q('[data-intro-eyebrow]'), { opacity: 0, y: 12, duration: 0.5 })
          .from(
            split.lines,
            { yPercent: 108, duration: 1.05, stagger: 0.085 },
            '-=0.2'
          )
          .from(q('[data-intro-lede]'), { opacity: 0, y: 16, duration: 0.7 }, '-=0.6')
          .from(
            q('[data-intro-cta]'),
            { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
            '-=0.45'
          )
          .from(q('[data-intro-scope]'), { opacity: 0, duration: 0.6 }, '-=0.35')
          .from(q('[data-plate]'), { opacity: 0, y: 28, duration: 0.9 }, '-=1.15')
          .from(
            q('[data-plate-row]'),
            { opacity: 0, x: -14, duration: 0.5, stagger: 0.07 },
            '-=0.55'
          )

        tl.play()
      })

      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="top"
      className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
    >
      <SeaField />

      <div className="shell relative grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p data-intro data-intro-eyebrow className="eyebrow max-w-lg">
            <span className="text-brand-600">{COMPANY.basePort.code}</span>
            <span>
              {COMPANY.basePort.name} · {COMPANY.basePort.city}
            </span>
          </p>

          <h1
            data-intro
            data-headline
            className="t-display mt-8 text-[clamp(2.15rem,7.4vw,5.6rem)] text-ink"
          >
            {/* The breaks are a desktop composition. On a phone the line is
                already wrapping, and forcing it again strands single words. */}
            We clear the port
            <br className="hidden md:inline" />
            before your ship
            <br className="hidden md:inline" />
            <span className="text-brand">arrives.</span>
          </h1>

          <p
            data-intro
            data-intro-lede
            className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl"
          >
            {COMPANY.legalName} is a freight forwarder and ship agency working out of{' '}
            {COMPANY.basePort.name}. Sea freight, customs, inland trucking, and full
            husbandry — one team, one file, one person who answers.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a data-intro data-intro-cta href="#contact" className="btn-primary">
              Request a rate
              <span className="btn-badge">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <a data-intro data-intro-cta href="#voyage" className="btn-ghost">
              See what we handle
              <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </div>

          <ul
            data-intro
            data-intro-scope
            className="mt-14 grid gap-px border-y border-line bg-line sm:grid-cols-3"
          >
            {SCOPE.map((item) => (
              <li
                key={item}
                className="t-data bg-surface py-4 pr-4 text-ink-soft sm:px-4 sm:first:pl-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <ServicePlate />
        </div>
      </div>
    </section>
  )
}

/**
 * Every shipping container carries a stamped plate listing what it is and what
 * it can take. This is ours. Fixed particulars rather than a live board — the
 * page states what the company does, and never implies a feed it does not have.
 */
function ServicePlate() {
  return (
    <figure data-intro data-plate className="panel shadow-[0_28px_60px_-40px_rgba(7,32,39,0.5)]">
      <figcaption className="flex items-center justify-between gap-4 bg-ink px-5 py-4">
        <span className="t-data text-paper">Service particulars</span>
        <Image
          src="/images/logo-sfl-nobg.png"
          alt=""
          width={90}
          height={30}
          className="h-6 w-auto brightness-0 invert"
        />
      </figcaption>

      <dl className="px-5 py-2">
        {PARTICULARS.map((row) => (
          <div
            key={row.label}
            data-plate-row
            className="grid grid-cols-1 gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="t-data pt-0.5 text-ink-soft">{row.label}</dt>
            <dd className="text-[0.95rem] leading-snug text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="flex items-center gap-3 border-t border-line bg-surface-sunken px-5 py-4 text-sm leading-relaxed text-ink-soft">
        <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />
        Ask for any of it by name. We quote what we can do, not what we hope to.
      </p>
    </figure>
  )
}
