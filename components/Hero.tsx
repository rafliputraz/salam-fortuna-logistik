'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { COMPANY, PRIMARY_CTA, telHref } from '@/lib/company'
import { containerSrc, type Paint, type View, VIEWS } from '@/lib/containers'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import { ArrowRight, Phone } from './icons'

/**
 * The stack, bottom tier first. Positions are percentages of the stack's
 * width so the whole thing scales as one; `tag` is the service called out
 * beside that box.
 */
const TIERS: Array<{ view: View; paint: Paint; left: number; width: number; tag: string }> = [
  { view: 'angled40', paint: 'cobalt', left: 0, width: 84, tag: 'Sea freight' },
  { view: 'angled40', paint: 'magenta', left: 7, width: 84, tag: 'Customs' },
  { view: 'angled40', paint: 'orange', left: 2, width: 84, tag: 'Inland delivery' },
  { view: 'angled20', paint: 'mustard', left: 16, width: 62, tag: 'Ship agency' },
]

/** How far up each tier sits, as a fraction of a 40ft box's drawn height. */
const STEP = 0.8

export default function Hero() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      const tiers = q('[data-tier]')
      const tags = q('[data-tag]')

      // Headline in by the line once the webfont has settled the breaks.
      let split: SplitText | undefined
      let cancelled = false
      Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(() => {
        if (cancelled) return
        split = SplitText.create(q('[data-headline]'), { type: 'lines', mask: 'lines' })
        gsap
          .timeline({ defaults: { ease: 'power4.out' }, onComplete: () => split?.revert() })
          .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, delay: 0.1 })
          .from(q('[data-hero-fade]'), { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, '-=0.7')
      })

      // The crane sets each box down in turn, then the tags come out.
      gsap
        .timeline({ delay: 0.3 })
        .from(tiers, { y: -520, opacity: 0, duration: 0.85, ease: 'back.out(1.2)', stagger: 0.22 })
        .from(tags, { opacity: 0, x: -14, scale: 0.9, duration: 0.45, ease: 'back.out(2)', stagger: 0.1 }, '-=0.35')

      // Scrolling away, the tiers lift apart, the higher ones faster.
      tiers.forEach((tier, i) => {
        gsap.to(tier, {
          y: -i * 46,
          x: (i % 2 ? 1 : -1) * i * 10,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
      })

      // And they sit at different depths under the pointer.
      const movers = tiers.map((t) => gsap.quickTo(t.querySelector('[data-depth]'), 'x', { duration: 0.8, ease: 'power3.out' }))
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        const dx = e.clientX / window.innerWidth - 0.5
        movers.forEach((m, i) => m(dx * (8 + i * 8)))
      }
      window.addEventListener('pointermove', onMove)

      return () => {
        cancelled = true
        split?.revert()
        window.removeEventListener('pointermove', onMove)
      }
    },
    { scope }
  )

  const box40 = VIEWS.angled40
  const tierHeight = (box40.h / box40.w) * 84 // % of stack width
  const stackHeight = tierHeight * (1 + STEP * (TIERS.length - 1)) + 4 // % of stack width

  return (
    <section ref={scope} id="top" className="relative overflow-hidden bg-paper pb-16 pt-28 md:min-h-[100dvh] md:pb-10 md:pt-32">
      <div className="shell grid items-center gap-12 md:min-h-[calc(100dvh-10rem)] md:grid-cols-12">
        <div className="relative z-10 md:col-span-6">
          <p data-hero-fade className="t-label text-ink-2">
            {COMPANY.tagline} <span className="text-signal">/</span> {COMPANY.basePort.name}
          </p>
          <h1 data-headline className="t-display mt-5 text-[length:var(--text-display)] text-ink">
            We clear the port before your ship <span className="text-signal">arrives.</span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-[30rem] text-lg leading-relaxed text-ink-2">
            Sea freight, customs, trucking and ship agency out of Panjang. One team, one
            file, one person who answers.
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-signal">
              {PRIMARY_CTA}
              <ArrowRight className="btn-arrow h-4 w-4" />
            </a>
            <a href={telHref} className="btn-line">
              <Phone className="h-4 w-4" />
              Call the desk
            </a>
          </div>
        </div>

        {/* The stack. Width-driven so every tier keeps its place at any size. */}
        <div aria-hidden="true" className="md:col-span-6">
          <div
            className="relative mx-auto w-full max-w-[30rem]"
            style={{ aspectRatio: `100 / ${stackHeight}` }}
          >
            {/* The quay under the stack. */}
            <div className="absolute -inset-x-6 bottom-[-2%] h-[7%] rounded-[50%] bg-ink/15 blur-md" />
            {TIERS.map((t, i) => {
              const v = VIEWS[t.view]
              return (
                <div
                  key={i}
                  data-tier
                  className="absolute will-change-transform"
                  style={{
                    left: `${t.left}%`,
                    width: `${t.width}%`,
                    // `bottom` resolves against the stack's height, not its width.
                    bottom: `${((tierHeight * STEP * i) / stackHeight) * 100}%`,
                    zIndex: i,
                  }}
                >
                  <div data-depth className="relative">
                    <Image
                      src={containerSrc(t.view, t.paint)}
                      alt=""
                      width={v.w}
                      height={v.h}
                      priority={i < 2}
                      sizes="(max-width: 768px) 80vw, 30rem"
                      className="h-auto w-full drop-shadow-[0_10px_12px_oklch(var(--c-ink)/0.25)]"
                    />
                    <span
                      data-tag
                      className="absolute left-[92%] top-[38%] flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="h-[2px] w-6 bg-ink/40 md:w-10" />
                      <span className="t-label rounded-full bg-ink px-3 py-1.5 text-paper">{t.tag}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
