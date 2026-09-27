'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, NAV, PRIMARY_CTA } from '@/lib/company'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { ArrowRight, Close, Menu } from './icons'

/** Panjang's clock, since that is where the desk is. */
function useWib() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

/**
 * The instrument bar across the top of the bridge: mark, nav, the time in
 * Panjang and the one action. It tucks away on the way down and comes back
 * on the way up; an amber hairline along its foot is the scroll position.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const wib = useWib()

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
          show(self.direction === 1 && self.scroll() > 240 ? -110 : 0)
        },
      })
    },
    { scope: header, dependencies: [open] }
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50">
      <div className="glass relative border-x-0 border-t-0">
        <div className="shell flex h-16 items-center gap-6">
          <a href="#top" className="flex shrink-0 items-center gap-3" aria-label={`${COMPANY.legalName}, back to top`}>
            <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} priority className="h-8 w-auto" />
            <span className="t-head hidden text-[1.35rem] tracking-wide text-ink sm:block">{COMPANY.shortName}</span>
          </a>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="navlink">
                {item.label}
              </a>
            ))}
          </nav>

          <p aria-label="Local time in Panjang" className="t-label hidden items-center gap-2 border-l border-line pl-6 text-ink-3 xl:flex">
            WIB <span className="min-w-[4.6rem] tabular-nums text-cyan">{wib || '--:--:--'}</span>
          </p>

          <a href="#contact" className="btn-signal hidden py-2.5 lg:inline-flex">
            {PRIMARY_CTA}
            <ArrowRight className="btn-arrow h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-auto flex h-11 w-11 items-center justify-center border border-line text-ink lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <span
          data-progress
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-signal"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <div id="mobile-nav" hidden={!open} className="glass border-x-0 border-t-0 lg:hidden">
        <nav className="shell flex flex-col py-3" aria-label="Primary, mobile">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="t-head flex items-baseline gap-4 border-b border-line py-4 text-3xl text-ink"
            >
              <span className="t-label text-cyan">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-signal mb-3 mt-5">
            {PRIMARY_CTA}
            <ArrowRight className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  )
}
