'use client'

import { useRef } from 'react'
import { COMPANY } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

const LINES = [
  ['GPS fix', COMPANY.basePort.coords],
  ['Chart', 'Sunda · Java Sea · Malacca'],
  ['AIS', 'Online'],
  ['Desk', `${COMPANY.basePort.code} standing by`],
]

/** Tells ChartStage whether to wait for the boot sequence before its own entrance. */
export const introPlaying = () =>
  typeof document !== 'undefined' && !document.documentElement.classList.contains('booted') && !prefersReducedMotion()

/**
 * The bridge powering up, once per visit: a sweep, four status lines
 * scrambling into place, then the screen closes down to a point over the
 * chart. Hidden before paint for anyone who has already seen it this
 * session, for reduced motion, and without scripts.
 */
export default function Intro() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = scope.current
      if (!el || !introPlaying()) return
      const done = () => {
        document.documentElement.classList.add('booted')
        try {
          sessionStorage.setItem('sfl-booted', '1')
        } catch {}
      }
      const q = gsap.utils.selector(el)
      gsap
        .timeline({ onComplete: done })
        .from(q('[data-ring]'), { scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.08, ease: 'power3.out' })
        .from(q('[data-brand]'), { opacity: 0, y: 10, duration: 0.4 }, 0.2)
        .add(() => {}, 0.3)
        .to(q('[data-val]'), { duration: 0.5, stagger: 0.18, scrambleText: { text: '{original}', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789°′', speed: 0.8 } }, 0.35)
        .from(q('[data-line]'), { opacity: 0, x: -12, duration: 0.3, stagger: 0.18 }, 0.35)
        .to(q('[data-meter]'), { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.3)
        .to(el, { clipPath: 'circle(0% at 64% 50%)', duration: 0.75, ease: 'power3.inOut' }, 1.85)
    },
    { scope }
  )

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="intro fixed inset-0 z-[90] hidden items-center justify-center bg-paper"
      style={{ clipPath: 'circle(150% at 64% 50%)' }}
    >
      <div className="scanlines absolute inset-0" />
      <div className="relative flex flex-col items-center gap-10">
        <svg viewBox="-100 -100 200 200" className="h-40 w-40 text-cyan">
          {[30, 60, 90].map((r) => (
            <circle key={r} data-ring r={r} fill="none" stroke="currentColor" strokeOpacity="0.4" />
          ))}
          <g className="sweep" style={{ transformOrigin: '0 0' }}>
            <path d="M0 0 L90 0 A90 90 0 0 0 78 -45 Z" fill="currentColor" fillOpacity="0.35" />
          </g>
          <circle r="4" className="fill-signal" />
        </svg>
        <div className="w-[min(88vw,26rem)]">
          <p data-brand className="t-head text-center text-3xl text-ink">
            {COMPANY.shortName}
          </p>
          <ul className="mt-6 space-y-2">
            {LINES.map(([k, v]) => (
              <li key={k} data-line className="t-label flex justify-between gap-6 border-b border-line/60 pb-2 text-ink-3">
                {k}
                <span data-val className="text-cyan">
                  {v}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 h-px bg-line">
            <span data-meter className="block h-full origin-left scale-x-0 bg-signal" />
          </div>
        </div>
      </div>
    </div>
  )
}
