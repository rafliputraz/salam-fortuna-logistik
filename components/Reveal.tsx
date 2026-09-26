'use client'

import { useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * One reveal behaviour for the whole page.
 *
 * Anything marked `data-reveal` lifts and fades in as it enters the viewport.
 * Elements that cross the line together are animated as one batch with a
 * stagger, so a grid of cards reads as a single move rather than four
 * independent ones. Content is pre-hidden in CSS and un-hidden here, so a
 * reduced-motion visitor, or a failed script, still sees everything.
 */
export default function Reveal({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (!targets.length) return

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      gsap.set(targets, { opacity: 0, y: 24 })

      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
      })

      // Every trigger on the page is measured once. Webfonts arriving, the
      // FAQ settling and the like all change the page's height afterwards,
      // which would leave triggers further down in the wrong place, so
      // re-measure whenever the height actually moves.
      let timer = 0
      let lastHeight = document.documentElement.scrollHeight
      const remeasure = () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          const h = document.documentElement.scrollHeight
          if (h !== lastHeight) {
            lastHeight = h
            ScrollTrigger.refresh()
          }
        }, 150)
      }
      const ro = new ResizeObserver(remeasure)
      ro.observe(document.body)
      document.fonts?.ready.then(() => ScrollTrigger.refresh())

      return () => {
        ro.disconnect()
        window.clearTimeout(timer)
      }
    },
    { scope }
  )

  return <div ref={scope}>{children}</div>
}
