import type { SVGProps } from 'react'

/**
 * Line icons drawn on a 24px grid at 1.5 stroke, so they sit at the same
 * optical weight as the hairlines and mono type around them.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12h17M14 6l6 6-6 6" />
  </Icon>
)

export const ArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v17M6 14l6 6 6-6" />
  </Icon>
)

export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
)

export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Icon>
)

export const Pin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
)

export const Phone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 4h5l2 5-3 2a13 13 0 0 0 5 5l2-3 5 2v5h-2A15 15 0 0 1 4 6V4Z" />
  </Icon>
)

export const Mail = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 5h18v14H3z" />
    <path d="m3 6 9 7 9-7" />
  </Icon>
)

export const Clock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.4l3.6 2.1" />
  </Icon>
)

/** A container ship in profile — hull, stacked boxes, waterline. */
export const Ship = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 15h19l-2.6 5H5.1z" />
    <path d="M6 15V9h12v6" />
    <path d="M10 9V5.5h4V9M10 12h4" />
    <path d="M2 21.5c1.6 0 1.6-1 3.2-1s1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1" />
  </Icon>
)

/** Prime mover with a container on the chassis. */
export const Truck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 6h11v10H2zM13 9h5l3 3.5V16h-8z" />
    <circle cx="6.5" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Icon>
)

/** A declaration with a clearance stamp on it. */
export const Doc = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 2.5h9l5 5v14H5z" />
    <path d="M14 2.5v5h5" />
    <path d="M8.5 13.5h7M8.5 17h4.5" />
  </Icon>
)

/** Anchor — ship agency and husbandry. */
export const Anchor = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="4.5" r="2" />
    <path d="M12 6.5V21M8 10h8" />
    <path d="M4 14a8 8 0 0 0 16 0" />
  </Icon>
)

/** A stack of three containers — booking and rates. */
export const Boxes = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 13h8v7H3zM13 13h8v7h-8zM8 4h8v7H8z" />
  </Icon>
)

/** A slot grid with one cell taken — a confirmed booking on a sailing. */
export const Slot = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 4h18v16H3z" />
    <path d="M3 9.5h18M9 9.5V20M15 9.5V20" />
    <path d="M9 9.5h6V20H9z" fill="currentColor" stroke="none" opacity={0.85} />
  </Icon>
)

export const LEG_ICONS = {
  BOOKING: Slot,
  ORIGIN: Boxes,
  SEA: Ship,
  CLEARANCE: Doc,
  INLAND: Truck,
} as const
