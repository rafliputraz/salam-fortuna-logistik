'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { COMPANY, NAV, PRIMARY_CTA } from '@/lib/company'
import { ArrowRight, Close, Menu } from './icons'

/**
 * A plain bar: mark, nav, one action. Clear over the hero, it takes on a
 * frosted ground and a hairline once the page is scrolled.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
        solid ? 'glass border-x-0 border-t-0 !border-b-line shadow-[0_6px_24px_-18px_oklch(var(--c-ink)/0.4)]' : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-[4.5rem] items-center gap-8">
        <a href="#top" className="flex shrink-0 items-center gap-3" aria-label={`${COMPANY.legalName}, back to top`}>
          <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} priority className="h-9 w-auto" />
          <span className="hidden text-[1.02rem] font-bold tracking-tight text-ink sm:block">{COMPANY.shortName}</span>
        </a>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="navlink">
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn-signal hidden !py-2.5 lg:inline-flex">
          {PRIMARY_CTA}
          <ArrowRight className="btn-arrow h-4 w-4" />
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink ring-1 ring-line-strong lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div id="mobile-nav" hidden={!open} className="border-t border-line lg:hidden">
        <nav className="shell flex flex-col py-4" aria-label="Primary, mobile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-line py-4 text-xl font-semibold text-ink">
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-signal mb-2 mt-6">
            {PRIMARY_CTA}
            <ArrowRight className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  )
}
