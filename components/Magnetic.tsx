'use client'

import { useEffect } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/motion'

/**
 * Buttons that lean toward a mouse as it comes near, and spring back when it
 * leaves. Moves the `translate` property through CSS variables, so the
 * press scale on `transform` still works. Mouse only, and never under
 * reduced motion.
 */
export default function Magnetic() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.btn, [data-magnetic]'))
    const offs = els.map((el) => {
      const toX = gsap.quickTo(el, '--mx', { duration: 0.5, ease: 'power3.out', unit: 'px' })
      const toY = gsap.quickTo(el, '--my', { duration: 0.5, ease: 'power3.out', unit: 'px' })
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        toX((e.clientX - (r.left + r.width / 2)) * 0.3)
        toY((e.clientY - (r.top + r.height / 2)) * 0.4)
      }
      const leave = () => {
        gsap.to(el, { '--mx': '0px', '--my': '0px', duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: true })
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })
    return () => offs.forEach((off) => off())
  }, [])
  return null
}
