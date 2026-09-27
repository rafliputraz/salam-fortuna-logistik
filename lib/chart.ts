import { CHART, LANES, PORT_XY, PROJ } from './chart-data'

export { CHART, LANES, PORT_XY, PROJ }

/** Longitude/latitude to chart units (the same Mercator the coast was drawn in). */
export function project(lon: number, lat: number): [number, number] {
  const x = ((lon - PROJ.lon0) / (PROJ.lon1 - PROJ.lon0)) * PROJ.W
  const y = PROJ.ty - PROJ.ky * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
  return [x, y]
}

/** Chart units back to longitude/latitude, for the cursor readout. */
export function unproject(x: number, y: number): [number, number] {
  const lon = PROJ.lon0 + (x / PROJ.W) * (PROJ.lon1 - PROJ.lon0)
  const lat = ((2 * Math.atan(Math.exp((PROJ.ty - y) / PROJ.ky)) - Math.PI / 2) * 180) / Math.PI
  return [lon, lat]
}

/** 05°28.1′S style, the way a chart plotter prints a position. */
export function formatLat(lat: number) {
  const a = Math.abs(lat)
  const d = Math.floor(a)
  const m = (a - d) * 60
  return `${String(d).padStart(2, '0')}°${m.toFixed(1).padStart(4, '0')}′${lat < 0 ? 'S' : 'N'}`
}

export function formatLon(lon: number) {
  const a = Math.abs(lon)
  const d = Math.floor(a)
  const m = (a - d) * 60
  return `${String(d).padStart(3, '0')}°${m.toFixed(1).padStart(4, '0')}′${lon < 0 ? 'W' : 'E'}`
}

export type View = { x: number; y: number; w: number; h: number }

/** A view of width `w` centred on a lon/lat, at the chart's own aspect. */
export function viewAt(lon: number, lat: number, w: number, bias: [number, number] = [0.5, 0.5]): View {
  const [cx, cy] = project(lon, lat)
  const h = w * (CHART.h / CHART.w)
  return { x: cx - w * bias[0], y: cy - h * bias[1], w, h }
}

/** Trans-Sumatra road out of Panjang, and the Bakauheni link to Java. */
export const ROADS = {
  sumatra: [
    [105.318, -5.468],
    [105.26, -5.42],
    [105.12, -5.2],
    [104.9, -4.83],
    [104.55, -4.45],
    [104.17, -4.13],
    [104.45, -3.5],
    [104.75, -2.98],
  ],
  bakauheni: [
    [105.318, -5.468],
    [105.45, -5.62],
    [105.62, -5.78],
    [105.75, -5.87],
  ],
} as const

export const toPoints = (pts: ReadonlyArray<readonly [number, number]>) =>
  pts.map(([lon, lat]) => project(lon, lat).map((v) => v.toFixed(1)).join(',')).join(' ')

export const toPath = (pts: ReadonlyArray<readonly number[]>) =>
  'M' + pts.map((p) => `${p[0]},${p[1]}`).join('L')
