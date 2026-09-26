'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { COMPANY, NAV } from '@/lib/company'
import { gsap, useGSAP } from '@/lib/motion'
import { ArrowRight, Close, Menu } from './icons'

/** Gap the three pills settle to once the bar has converged. */
const CLOSED_GAP = 6

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)

  /**
   * At the top of the page the three pills sit spread to the edges of the
   * column; scrolling draws them together into a single centred capsule.
   *
   * The whole move is one animated property — the flex `gap`. Because the row
   * is centre-justified, shrinking the gap pulls both outer pills inward on
   * its own, so nothing has to be positioned by hand and the layout stays
   * correct at any width.
   */
  useGSAP(
    () => {
      const q = gsap.utils.selector(header)
      const shell = q('[data-nav-shell]')[0]
      const pills = q('[data-nav-pill]')
      if (!shell || pills.length < 2) return

      // Measured, not guessed: the open gap is whatever space is left over
      // once the pills themselves are accounted for.
      const openGap = () => {
        const used = pills.reduce((sum, pill) => sum + pill.offsetWidth, 0)
        const room = shell.parentElement!.clientWidth - used
        return Math.max(CLOSED_GAP, room / (pills.length - 1))
      }

      const mm = gsap.matchMedia(header)

      mm.add(
        {
          canConverge: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          isStatic: '(max-width: 1023px), (prefers-reduced-motion: reduce)',
        },
        (context) => {
          if (!context.conditions!.canConverge) {
            gsap.set(shell, { gap: CLOSED_GAP })
            return
          }

          gsap.fromTo(
            shell,
            { gap: openGap },
            {
              gap: CLOSED_GAP,
              ease: 'power2.out',
              immediateRender: true,
              scrollTrigger: {
                start: 0,
                end: 220,
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            }
          )
        }
      )
    },
    { scope: header }
  )

  return (
    <header ref={header} className="fixed inset-x-0 top-4 z-50">
      <div className="shell">
        <div
          data-nav-shell
          className="flex items-center justify-center gap-1.5"
        >
          {/* z-10 so the logo tucks over the nav pill's rounded edge once the
              two meet, rather than butting awkwardly against it. */}
          <a
            data-nav-pill
            href="#top"
            className="navpill z-10 flex shrink-0 items-center gap-3 py-2.5 pl-3 pr-5"
            aria-label={`${COMPANY.legalName} — home`}
          >
            <Image
              src="/images/logo-sfl-nobg.png"
              alt=""
              width={120}
              height={40}
              priority
              className="h-8 w-auto"
            />
            <span className="hidden leading-none sm:block">
              <span className="t-display-sm block text-[0.9rem] text-ink">
                {COMPANY.shortName}
              </span>
              <span className="t-data mt-1 block text-[0.6rem] text-ink-soft">
                {COMPANY.basePort.code}
              </span>
            </span>
          </a>

          <nav
            data-nav-pill
            aria-label="Primary"
            className="navpill hidden shrink-0 items-center gap-8 px-8 py-4 lg:flex"
          >
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="navlink">
                {item.label}
              </a>
            ))}
          </nav>

          <a
            data-nav-pill
            href="#contact"
            className="btn-primary hidden shrink-0 !rounded-full py-2.5 pl-6 pr-2.5 lg:inline-flex"
          >
            Request a rate
            <span className="btn-badge">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="navpill ml-auto p-3.5 text-ink lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          id="mobile-nav"
          hidden={!open}
          className="mt-2 border border-line bg-surface-raised lg:hidden"
        >
          <nav className="flex flex-col px-5 py-2" aria-label="Primary, mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="t-display-sm border-b border-line py-4 text-lg text-ink"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="btn-primary mb-4 mt-5"
            >
              Request a rate
              <span className="btn-badge">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
