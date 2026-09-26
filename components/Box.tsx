import type { CSSProperties, ReactNode } from 'react'

export type BoxColor = 'magenta' | 'orange' | 'cobalt' | 'green' | 'mustard' | 'steel' | 'red'

export const boxColor = (c: BoxColor) => `oklch(var(--c-box-${c}))`

/**
 * A 40ft container in CSS 3D: two corrugated sides, two door ends and a
 * roof, around a zero-size anchor. Place it with `style` (a transform on the
 * anchor) and size a whole group at once with the `--u` unit on a parent.
 * Purely decorative; anything it says is repeated in real text elsewhere.
 */
export default function Box({
  color,
  label,
  code,
  className = '',
  style,
  children,
}: {
  /** Omit to inherit --c from a parent, e.g. to animate the paint. */
  color?: BoxColor
  label?: string
  code?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const paint = (color ? { '--c': boxColor(color) } : {}) as CSSProperties
  return (
    <div aria-hidden="true" className={`box3d ${className}`} style={style}>
      <div className="box-body" data-box-body>
        <div className="face face-front steel" style={paint}>
          {(label || code) && (
            <span className="face-label">
              <span>{label}</span>
              <span className="opacity-75">{code}</span>
            </span>
          )}
        </div>
        <div className="face face-back steel" style={paint} />
        <div className="face face-end-r steel-door" style={paint} />
        <div className="face face-end-l steel-door" style={paint} />
        <div className="face face-top" style={paint} />
        {children}
      </div>
    </div>
  )
}
