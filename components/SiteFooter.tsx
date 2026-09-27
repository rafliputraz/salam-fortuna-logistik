'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { COMPANY, CTA, NAV, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { ArrowRight } from './icons'

/**
 * The call band and the footer in one: the number set as big as a headline
 * for anyone who would rather just call, then the name across the whole
 * width, its letters rising off the waterline as the page runs out.
 */
export default function SiteFooter() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      let split: SplitText | undefined
      let cancelled = false
      document.fonts?.ready.then(() => {
        if (cancelled) return
        split = SplitText.create(scope.current!.querySelector('[data-mark]'), { type: 'chars' })
        gsap.from(split.chars, {
          yPercent: 100,
          ease: 'power3.out',
          stagger: 0.03,
          scrollTrigger: { trigger: scope.current!.querySelector('[data-mark-wrap]'), start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
        })
      })
      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope }
  )

  return (
    <footer ref={scope} className="relative overflow-hidden border-t border-line bg-paper">
      {/* The call band. */}
      <div className="shell py-20 md:py-28">
        <p className="t-label text-cyan">Or skip the form</p>
        <h2 data-split className="t-display mt-5 max-w-[16ch] text-[length:var(--text-4xl)] text-ink">
          {CTA.headline}
        </h2>
        <p data-reveal className="mt-5 max-w-xl leading-relaxed text-ink-2">
          {CTA.body}
        </p>
        <a data-reveal href={telHref} className="group mt-12 flex items-center justify-between gap-6 border-y border-line py-8">
          <span className="t-display text-[clamp(2.6rem,9vw,9rem)] text-signal transition-colors duration-300 group-hover:text-ink">
            {COMPANY.phone}
          </span>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-signal text-paper transition-transform duration-300 ease-out group-hover:translate-x-1 group-active:scale-95 md:h-20 md:w-20">
            <ArrowRight className="h-6 w-6" />
          </span>
        </a>
      </div>

      <div className="shell flex flex-col gap-10 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} className="h-10 w-auto" />
          <div>
            <p className="t-head text-2xl text-ink">{COMPANY.legalName}</p>
            <p className="t-label mt-1 text-ink-3">{COMPANY.tagline}</p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="navlink">
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div data-mark-wrap aria-hidden="true" className="overflow-hidden">
        <p data-mark className="t-display t-outline whitespace-nowrap px-2 text-center text-[13.2vw] leading-[0.8]">
          Salam Fortuna
        </p>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:justify-between">
        <p className="t-label text-ink-3">
          © {new Date().getFullYear()} {COMPANY.legalName}
        </p>
        <p className="t-label text-ink-3">
          {COMPANY.basePort.code} · {COMPANY.basePort.coords}
        </p>
      </div>
    </footer>
  )
}
