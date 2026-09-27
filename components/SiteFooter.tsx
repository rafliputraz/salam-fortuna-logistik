'use client'

import type { CSSProperties } from 'react'
import { useRef } from 'react'
import Image from 'next/image'
import { COMPANY, NAV } from '@/lib/company'
import { boxColor, type BoxColor } from '@/lib/containers'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

const TIER: Array<{ word: string; color: BoxColor }> = [
  { word: 'Salam', color: 'cobalt' },
  { word: 'Fortuna', color: 'magenta' },
  { word: 'Logistik', color: 'orange' },
]

/**
 * A statement footer: the company name stencilled across three boxes,
 * stacked the way they'd sit on a quay.
 */
export default function SiteFooter() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-word]', scope.current).forEach((el, i) => {
        gsap.from(el, {
          xPercent: i % 2 ? 60 : -60,
          opacity: 0,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 70%', scrub: 0.6 },
        })
      })
    },
    { scope }
  )

  return (
    <footer ref={scope} className="overflow-hidden bg-paper pt-20">
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} className="h-10 w-auto" />
            <div>
              <p className="t-head text-xl text-ink">{COMPANY.legalName}</p>
              <p className="mt-1 text-sm text-ink-2">{COMPANY.tagline}</p>
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

        <div aria-hidden="true" className="mt-14 flex flex-col items-start gap-2">
          {TIER.map((t, i) => (
            <p
              key={t.word}
              data-word
              className="steel t-display px-4 py-1 text-[clamp(3rem,13vw,12rem)] leading-[0.95] text-paper md:px-8"
              style={{ '--c': boxColor(t.color), '--rib': '18px', marginLeft: `${i * 6}%` } as CSSProperties}
            >
              {t.word}
            </p>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t-2 border-ink/10 py-6 text-sm text-ink-2 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p className="t-label">
            {COMPANY.basePort.code} {COMPANY.basePort.coords}
          </p>
        </div>
      </div>
    </footer>
  )
}
