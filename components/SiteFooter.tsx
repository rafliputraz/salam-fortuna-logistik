'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { COMPANY, CTA, NAV, PRIMARY_CTA, SERVICES, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { ArrowRight, Phone } from './icons'

/**
 * A closing call card over the footer's navy, then the footer proper in
 * columns. The card rises and settles into place as it arrives.
 */
export default function SiteFooter() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from(scope.current!.querySelector('[data-cta]'), {
        y: 80,
        scale: 0.94,
        ease: 'power2.out',
        scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'top 45%', scrub: 0.6 },
      })
    },
    { scope }
  )

  return (
    <footer ref={scope} className="bg-deep text-white">
      <div className="shell pt-16 md:pt-20">
        <div data-cta className="relative overflow-hidden rounded-[2rem] bg-signal px-8 py-14 md:px-14 md:py-20">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="t-h2">{CTA.headline}</h2>
              <p className="mt-4 max-w-xl text-white/85">{CTA.body}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <a href={telHref} className="btn-light">
                <Phone className="h-4 w-4" />
                {COMPANY.phone}
              </a>
              <a href="#contact" className="btn bg-white/15 text-white ring-1 ring-inset ring-white/40 hover:bg-white/25">
                {PRIMARY_CTA}
                <ArrowRight className="btn-arrow h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white p-1.5">
              <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} className="h-8 w-auto" />
            </span>
            <p className="text-lg font-bold">{COMPANY.legalName}</p>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            {COMPANY.tagline} out of {COMPANY.basePort.name}, {COMPANY.basePort.city}. {COMPANY.hours.office}.{' '}
            {COMPANY.hours.port}.
          </p>
        </div>
        <nav aria-label="Footer" className="lg:col-span-2">
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold">Services</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {SERVICES.map((s) => (
              <li key={s.title}>{s.title}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <p className="text-sm font-semibold">Office</p>
          <address className="mt-4 space-y-1 text-sm not-italic text-white/60">
            <span className="block">{COMPANY.address.street}</span>
            <span className="block">
              {COMPANY.address.area}, {COMPANY.address.city} {COMPANY.address.postcode}
            </span>
            <a href={`mailto:${COMPANY.email}`} className="block pt-3 text-white hover:text-sky">
              {COMPANY.email}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p>
            {COMPANY.basePort.code} · {COMPANY.basePort.coords}
          </p>
        </div>
      </div>
    </footer>
  )
}
