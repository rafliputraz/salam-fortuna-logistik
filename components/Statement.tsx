'use client'

import { useRef } from 'react'
import { PORTS, SERVICES, VOYAGE } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

const TEXT =
  'We are a freight forwarder and ship agent at Panjang Port. One team handles your booking, your customs, your trucks and your ship’s port call, so nothing falls between desks.'

/** Every figure here is counted from the site's own data, not claimed. */
const FIGURES = [
  { n: SERVICES.length, suffix: '', label: 'Services under one roof' },
  { n: PORTS.length, suffix: '', label: 'Indonesian gateways covered' },
  { n: 24, suffix: 'h', label: 'Port line, every day' },
  { n: VOYAGE.length, suffix: '', label: 'Legs, one file, one team' },
]

/**
 * What we are, in one sentence that brightens word by word as it passes,
 * then four figures that count up once.
 */
export default function Statement() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const words = q('[data-w]')
      if (prefersReducedMotion()) {
        gsap.set(words, { opacity: 1 })
        return
      }
      gsap.to(words, {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: { trigger: q('[data-text]')[0], start: 'top 80%', end: 'bottom 45%', scrub: true },
      })
      q<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        })
      })
    },
    { scope }
  )

  return (
    <section ref={scope} className="py-24 md:py-32">
      <div className="shell">
        <p data-text className="t-h2 max-w-5xl !font-semibold !leading-[1.2]">
          {TEXT.split(' ').map((w, i) => (
            <span key={i} data-w className="text-ink opacity-[0.18]">
              {w}{' '}
            </span>
          ))}
        </p>

        <dl className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f) => (
            <div key={f.label} data-reveal className="bg-white p-8">
              <dt className="text-sm font-medium text-ink-3">{f.label}</dt>
              <dd className="mt-3 text-5xl font-bold tracking-tight text-ink">
                <span data-count={f.n}>{f.n}</span>
                <span className="text-signal">{f.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
