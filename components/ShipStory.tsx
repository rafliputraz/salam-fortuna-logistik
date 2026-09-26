'use client'

import { useEffect, useRef, useState } from 'react'
import { CHAPTERS, PRIMARY_CTA, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from '@/lib/motion'
import type { ShipScene } from '@/lib/ship/scene'
import { ArrowRight, Phone } from './icons'

/** Screens of scroll the camera flight takes, after the hero screen itself. */
const FLIGHT_SCREENS = 4.5

/** How far either side of its mark a chapter stays fully readable. */
const HOLD = 0.055
const FADE = 0.07

type Mode = 'motion' | 'static'

/**
 * The hero and the story in one pinned stage.
 *
 * A real container ship, cut out of a photograph and set on a rendered sea
 * in WebGL, holds the screen while the page scrolls. The scroll drives a
 * camera through five moves (the whole ship, along the hull, into the
 * stow, up at the bridge, and standing off as she sails away), and each
 * move carries one line of what we do. Every chapter is framed on the part
 * of the ship it is about.
 *
 * Reduced motion drops the pin and the flight. The ship is rendered once as
 * a still behind the hero and the chapters are set as ordinary text below.
 */
export default function ShipStory() {
  const scope = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ShipScene | null>(null)
  const [mode, setMode] = useState<Mode>('motion')
  const [ready, setReady] = useState(false)
  const [glFailed, setGlFailed] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) setMode('static')
  }, [])

  // Build the scene lazily: three.js is the heaviest thing on the page and
  // the gradient behind the canvas carries the hero until it lands.
  useEffect(() => {
    let cancelled = false
    let io: IntersectionObserver | undefined

    import('@/lib/ship/scene')
      .then(({ createShipScene }) => {
        if (cancelled || !canvas.current) return
        const scene = createShipScene(canvas.current, () => !cancelled && setReady(true))
        sceneRef.current = scene
        const still = prefersReducedMotion()

        if (still) {
          scene.renderOnce()
        } else {
          scene.setIntro(1)
          const proxy = { t: 1 }
          gsap.to(proxy, {
            t: 0,
            duration: 3.2,
            ease: 'power3.out',
            onUpdate: () => scene.setIntro(proxy.t),
          })
          // Pinning re-parents the stage, which can deliver a stale entry
          // and a fresh one in the same batch; only the latest counts.
          io = new IntersectionObserver((entries) =>
            entries[entries.length - 1].isIntersecting ? scene.start() : scene.stop()
          )
          if (stage.current) io.observe(stage.current)
        }
      })
      .catch(() => setGlFailed(true))

    return () => {
      cancelled = true
      io?.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  // Pin, scrub the camera, and cross-fade the chapters against it.
  useGSAP(
    () => {
      if (mode !== 'motion') return
      const q = gsap.utils.selector(scope)
      const chapters = q('[data-chapter]')
      const ticks = q('[data-tick]')
      const fill = q('[data-hud-fill]')[0]
      const n = chapters.length - 1

      const paint = (p: number) => {
        chapters.forEach((el, i) => {
          const d = p - i / n
          const ad = Math.abs(d)
          let o = ad <= HOLD ? 1 : Math.max(0, 1 - (ad - HOLD) / FADE)
          // The hero is on screen before any scroll, and the last line stays.
          if (i === 0 && d < 0) o = 1
          if (i === n && d > 0) o = 1
          el.style.opacity = String(o)
          el.style.transform = `translate3d(0, ${(-d * 260).toFixed(1)}px, 0)`
          el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
          el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false')
        })
        const active = Math.round(p * n)
        ticks.forEach((t, i) => t.classList.toggle('is-active', i === active))
        if (fill) fill.style.transform = `scaleY(${p})`
      }
      paint(0)

      ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * FLIGHT_SCREENS}`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          sceneRef.current?.setProgress(self.progress)
          paint(self.progress)
        },
      })

      // Headline in by the line, once the webfont has settled the breaks.
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
          .from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.09, delay: 0.25 })
          .from(q('[data-hero-fade]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, '-=0.75')
      })
      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope, dependencies: [mode], revertOnUpdate: true }
  )

  const [hero, ...rest] = CHAPTERS

  return (
    <section ref={scope} id="top" aria-label="Salam Fortuna Logistik" className="relative">
      <div ref={stage} className="relative h-[100dvh] min-h-[34rem] overflow-hidden bg-abyss">
        {/* Poster: carries the hero while three.js loads, and if WebGL can't. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 60% at 70% 62%, oklch(62% 0.12 45 / 0.55), transparent 60%), linear-gradient(to bottom, oklch(var(--c-abyss)) 0%, oklch(24% 0.05 240) 55%, oklch(var(--c-abyss)) 100%)',
          }}
        />
        {!glFailed && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Scrims keep the type legible over any frame of the flight. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent md:bg-gradient-to-r md:from-abyss/85 md:via-abyss/25 md:to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-abyss to-transparent"
        />

        <div className="shell relative flex h-full items-end pb-14 md:items-center md:pb-0">
          {/* Every chapter shares one grid cell, so they cross-fade in place. */}
          <div className="relative grid w-full max-w-[44rem]">
            <div data-chapter className="self-end will-change-transform [grid-area:1/1] md:self-center">
              <h1
                data-headline
                className="t-display text-[length:var(--text-display)] text-foam"
              >
                We clear the port before your ship <span className="text-signal">arrives.</span>
              </h1>
              <p
                data-hero-fade
                className="mt-6 max-w-[34rem] text-lg leading-relaxed text-steel md:text-xl"
              >
                {hero.body}
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

            {mode === 'motion' &&
              rest.map((c) => (
                <article
                  key={c.id}
                  data-chapter
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="self-end will-change-transform [grid-area:1/1] md:self-center"
                >
                  <h2 className="t-display text-[length:var(--text-display-s)] text-foam">
                    {c.title}
                  </h2>
                  <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-steel">{c.body}</p>
                </article>
              ))}
          </div>
        </div>

        {mode === 'motion' && (
          <nav
            aria-label="Story chapters"
            className="pointer-events-none absolute bottom-10 right-6 hidden lg:block xl:right-10"
          >
            <div className="glass relative flex gap-5 px-5 py-4">
              <span className="relative w-px self-stretch bg-foam/15">
                <span
                  data-hud-fill
                  className="absolute inset-0 origin-top bg-signal"
                  style={{ transform: 'scaleY(0)' }}
                />
              </span>
              <ol className="flex flex-col gap-5">
                {CHAPTERS.map((c) => (
                  <li
                    key={c.id}
                    data-tick
                    className="t-label text-fog transition-colors duration-300 [&.is-active]:text-foam"
                  >
                    {c.label}
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        )}
      </div>

      {mode === 'static' && (
        <div className="shell grid gap-10 py-20 md:grid-cols-2">
          {rest.map((c) => (
            <article key={c.id}>
              <h2 className="t-head text-[length:var(--text-4xl)] text-foam">{c.title}</h2>
              <p className="mt-4 max-w-[32rem] leading-relaxed text-steel">{c.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
