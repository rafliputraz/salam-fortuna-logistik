'use client'

import { useRef } from 'react'
import { COMPANY, PRIMARY_CTA, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '@/lib/motion'
import Box, { type BoxColor } from './Box'
import { ArrowRight, Phone } from './icons'

/**
 * One slot in the hero stack, in container units: bay across (x), row in
 * depth (z, + is toward the viewer) and tier up (y). The front row carries
 * the services, stencilled on the side the way a line paints its name.
 */
type Slot = { bay: number; row: number; tier: number; color: BoxColor; label?: string }

const STACK: Slot[] = [
  // Bottom tier.
  { bay: -1, row: -1, tier: 0, color: 'steel' },
  { bay: 1, row: -1, tier: 0, color: 'green' },
  { bay: -1, row: 0, tier: 0, color: 'orange' },
  { bay: 1, row: 0, tier: 0, color: 'cobalt' },
  { bay: -1, row: 1, tier: 0, color: 'cobalt', label: 'Sea freight' },
  { bay: 1, row: 1, tier: 0, color: 'magenta', label: 'Customs' },
  // Second tier.
  { bay: -1, row: -1, tier: 1, color: 'magenta' },
  { bay: 1, row: -1, tier: 1, color: 'mustard' },
  { bay: -1, row: 0, tier: 1, color: 'green' },
  { bay: 1, row: 0, tier: 1, color: 'steel' },
  { bay: -1, row: 1, tier: 1, color: 'red', label: 'Ship agency' },
  { bay: 1, row: 1, tier: 1, color: 'orange', label: 'Inland' },
  // Top tier, stepped back.
  { bay: -1, row: -1, tier: 2, color: 'cobalt' },
  { bay: -1, row: 0, tier: 2, color: 'mustard', label: 'Project cargo' },
  { bay: 1, row: -1, tier: 2, color: 'magenta' },
]

/** Container pitch in units: length + gap across, depth + gap in, height + gap up. */
const PITCH = { x: 6.25, z: 2.62, y: 2.72 }

export default function Hero() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const world = q('[data-world]')[0] as HTMLElement
      const bodies = q('[data-box-body]')
      if (prefersReducedMotion() || !world) return

      // Headline in by the line once the webfont has settled the breaks.
      let split: SplitText | undefined
      let cancelled = false
      const fontsSettled = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => window.setTimeout(r, 1500)),
      ])
      fontsSettled.then(() => {
        if (cancelled) return
        split = SplitText.create(q('[data-headline]'), { type: 'lines', mask: 'lines' })
        gsap
          .timeline({ defaults: { ease: 'power4.out' }, onComplete: () => split?.revert() })
          .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, delay: 0.1 })
          .from(q('[data-hero-fade]'), { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, '-=0.7')
      })

      // The crane sets the stack down, bottom tier first.
      gsap.from(bodies, {
        y: -420,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.15)',
        stagger: 0.07,
        delay: 0.35,
      })

      // Scrolling turns the stack round and opens it up into its tiers.
      const mm = gsap.matchMedia(scope)
      mm.add('(min-width: 768px)', () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: '+=110%',
              pin: true,
              scrub: 0.8,
            },
          })
          .fromTo(world, { '--ry': '-34deg', '--spread': 0 }, { '--ry': '38deg', '--spread': 0.55, ease: 'none' })
          .to(q('[data-hero-copy]'), { y: -60, opacity: 0.25, ease: 'none' }, 0)
      })
      mm.add('(max-width: 767px)', () => {
        gsap.fromTo(
          world,
          { '--ry': '-30deg' },
          {
            '--ry': '30deg',
            ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          }
        )
      })

      // A small lean toward the pointer, sprung so it never snaps.
      const tilt = gsap.quickTo(world, '--rx', { duration: 0.9, ease: 'power3.out', unit: 'deg' })
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        tilt(-18 - (e.clientY / window.innerHeight - 0.5) * 8)
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

  return (
    <section
      ref={scope}
      id="top"
      className="relative overflow-hidden bg-paper pb-16 pt-28 md:min-h-[100dvh] md:pb-10 md:pt-32"
    >
      <div className="shell grid items-center gap-10 md:min-h-[calc(100dvh-10rem)] md:grid-cols-12">
        <div data-hero-copy className="relative z-10 md:col-span-6">
          <p data-hero-fade className="t-label text-ink-2">
            {COMPANY.tagline} <span className="text-signal">/</span> {COMPANY.basePort.name}
          </p>
          <h1 data-headline className="t-display mt-5 text-[length:var(--text-display)] text-ink">
            We clear the port before your ship <span className="text-signal">arrives.</span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-[30rem] text-lg leading-relaxed text-ink-2">
            Sea freight, customs, trucking and ship agency out of Panjang. One team,
            one file, one person who answers.
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

        <div className="relative h-[20rem] sm:h-[26rem] md:col-span-6 md:h-[36rem]" style={{ perspective: '1700px' }}>
          <div
            data-world
            className="absolute left-1/2 top-[60%] [--u:8px] sm:[--u:11px] md:[--u:clamp(12px,1.3vw,19px)]"
            style={
              {
                '--rx': '-18deg',
                '--ry': '-34deg',
                '--spread': 0,
                transformStyle: 'preserve-3d',
                transform: 'rotateX(var(--rx)) rotateY(var(--ry))',
              } as React.CSSProperties
            }
          >
            {/* The yard floor, painted with bay lines. */}
            <div
              aria-hidden="true"
              className="absolute left-0 top-0"
              style={{
                width: 'calc(var(--u) * 44)',
                height: 'calc(var(--u) * 26)',
                transform: 'translate(-50%, -50%) translateY(calc(var(--u) * 1.3)) rotateX(90deg)',
                background:
                  'repeating-linear-gradient(90deg, transparent 0 calc(var(--u) * 12.3), oklch(var(--c-box-mustard) / 0.9) calc(var(--u) * 12.3) calc(var(--u) * 12.6)), radial-gradient(closest-side, oklch(var(--c-ink) / 0.18), transparent)',
                backgroundPosition: 'calc(var(--u) * 1.1) 0, 0 0',
              }}
            />
            {STACK.map((s, i) => {
              const x = s.bay * PITCH.x
              const y = -s.tier * PITCH.y
              const z = s.row * PITCH.z
              return (
                <Box
                  key={i}
                  color={s.color}
                  label={s.label}
                  style={{
                    transform: `translate3d(calc(var(--u) * ${x} * (1 + var(--spread))), calc(var(--u) * ${y} * (1 + var(--spread) * 1.5)), calc(var(--u) * ${z} * (1 + var(--spread) * 1.8)))`,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
