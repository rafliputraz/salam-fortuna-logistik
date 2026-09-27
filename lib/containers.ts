/**
 * Container artwork: rendered 20ft and 40ft boxes cut out of their
 * backgrounds and repainted into the site's palette (only the painted steel
 * is shifted; hinges, locking bars and interiors keep their own colour).
 * Files live in public/images/containers as `<view>-<paint>.webp`.
 */

export type Paint = 'cobalt' | 'magenta' | 'orange' | 'red' | 'green' | 'mustard' | 'steel'

/** Pixel sizes of each view, for layout and next/image. */
export const VIEWS = {
  side: { w: 903, h: 353 },
  door: { w: 336, h: 352 },
  angled20: { w: 663, h: 351 },
  angled40: { w: 829, h: 351 },
  open: { w: 641, h: 351 },
  top20: { w: 775, h: 455 },
  hanging: { w: 1079, h: 1158 },
} as const

export type View = keyof typeof VIEWS

export const containerSrc = (view: View, paint: Paint) => `/images/containers/${view}-${paint}.webp`

/** Container paint as a CSS colour, for flat panels, chips and text. */
export const boxColor = (c: Paint) => `oklch(var(--c-box-${c}))`

export type BoxColor = Paint
