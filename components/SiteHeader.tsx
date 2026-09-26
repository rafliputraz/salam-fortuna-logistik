'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, NAV, PRIMARY_CTA } from '@/lib/company'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { ArrowRight, Close, Menu } from './icons'

/**
 * A floating pill that tucks away on the way down and returns on the way up,
 * so it never sits over the ship while you are watching it. A red hairline
 * along its foot tracks how far down the page you are.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const bar = header.current
      const progress = bar?.querySelector<HTMLElement>('[data-progress]')
      if (!bar) return

      const show = gsap.quickTo(bar, 'yPercent', { duration: 0.45, ease: 'power3.out' })
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`
          if (open) return
          show(self.direction === 1 && self.scroll() > 240 ? -160 : 0)
        },
      })
    },
    { scope: header, dependencies: [open] }
  )

  // Escape closes the sheet, and the page behind it stops scrolling.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header ref={header} className="fixed inset-x-0 top-3 z-50 md:top-4">
      <div className="shell">
        <div className="glass relative flex items-center gap-4 overflow-hidden rounded-full py-2 pl-3 pr-2">
          <a
            href="#top"
            className="flex shrink-0 items-center gap-3 rounded-full pr-2"
            aria-label={`${COMPANY.legalName}, back to top`}
          >
            <Image
              src="/images/logo-sfl-nobg.png"
              alt=""
              width={120}
              height={40}
              priority
              className="h-8 w-auto"
            />
            <span className="t-head hidden text-[1.05rem] tracking-wide text-foam sm:block">
              {COMPANY.shortName}
            </span>
          </a>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="navlink">
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#contact" className="btn-signal ml-6 hidden py-2.5 lg:inline-flex">
            {PRIMARY_CTA}
            <ArrowRight className="btn-arrow h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="btn ml-auto h-11 w-11 !p-0 text-foam lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <span
            data-progress
            aria-hidden="true"
            className="absolute inset-x-6 bottom-0 h-px origin-left bg-signal"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        <div
          id="mobile-nav"
          hidden={!open}
          className="glass mt-2 origin-top animate-[sheet_220ms_var(--ease-out)] lg:hidden"
        >
          <nav className="flex flex-col px-5 py-3" aria-label="Primary, mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="t-head border-b border-rule py-4 text-2xl text-foam"
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="btn-signal mb-3 mt-5">
              {PRIMARY_CTA}
              <ArrowRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
