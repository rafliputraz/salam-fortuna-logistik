'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'

/**
 * Inertial scrolling, so the camera move on the ship reads as one continuous
 * shot rather than a stepped wheel. Driven off GSAP's ticker so ScrollTrigger
 * and Lenis agree on every frame. Skipped entirely under reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      lerp: 0.09,
      anchors: { offset: -72 },
    })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return null
}
