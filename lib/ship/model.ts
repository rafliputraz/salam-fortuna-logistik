import * as THREE from 'three'

/**
 * A post-Panamax container ship, built to real proportions in metres.
 *
 * Nothing here is a stock model: the hull is lofted from cross-sections the
 * way a naval architect's lines plan is, the stow is laid out bay by bay in
 * 40ft boxes, and the accommodation sits a third of the way back from the bow
 * where the visibility rules put it on modern tonnage.
 *
 * Axes: +z is the bow, +y is up, waterline at y = 0, centreline at x = 0.
 */
export const HULL = {
  length: 330,
  beam: 48,
  keel: -14,
  deck: 16,
} as const

/** Longitudinal positions of the superstructure, from midships. */
export const BRIDGE_Z = 58
export const FUNNEL_Z = -118

const STERN_Z = -HULL.length / 2

/** Deterministic PRNG so the stow is identical on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Half-breadth as a fraction of half-beam.
 * `u` runs 0 (stern) → 1 (bow); `yn` runs 0 (keel) → 1 (deck).
 */
export function halfBreadth(u: number, yn: number) {
  let w = 1
  if (u > 0.76) {
    const t = (u - 0.76) / 0.24
    w = Math.sqrt(Math.max(0, 1 - t * t))
    // Fine entrance below the waterline, flare above it.
    w *= 1 - 0.5 * t * Math.pow(1 - yn, 1.2)
  }
  if (u < 0.13) {
    const t = (0.13 - u) / 0.13
    // Full transom at deck level, cut away underwater for the propeller.
    w *= 1 - 0.62 * t * Math.pow(1 - yn, 1.6)
  }
  return Math.max(0, w)
}

/** Longitudinal shift that rakes the stem and gives the stern its overhang. */
function zShift(u: number, yn: number) {
  if (u > 0.76) {
    const t = (u - 0.76) / 0.24
    return -Math.pow(1 - yn, 1.3) * t * t * 26
  }
  if (u < 0.06) {
    const t = (0.06 - u) / 0.06
    return Math.pow(1 - yn, 1.5) * t * 10
  }
  return 0
}

/** Cross-section (starboard half), from deck edge round the bilge to the keel. */
const PROFILE: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [
    [1, 1],
    [1, 0.72],
    [1, 0.46],
    [1, 0.24],
  ]
  // Bilge radius: elliptical, a little over six metres.
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    pts.push([0.86 + 0.14 * Math.cos(a), 0.24 - 0.24 * Math.sin(a)])
  }
  pts.push([0.5, 0], [0, 0])
  return pts
})()

function hullColor(y: number, out: THREE.Color) {
  if (y < -0.6) return out.set('#6e1f1a') // antifouling
  if (y < 1.4) return out.set('#141619') // boot-top
  if (y > HULL.deck - 1.1) return out.set('#d9d6cf') // sheer strake
  return out.set('#1a2a3c') // topsides
}

function buildHull() {
  const stations = 140
  // Full section: starboard deck edge → keel → port deck edge.
  const section = [
    ...PROFILE,
    ...PROFILE.slice(0, -1)
      .reverse()
      .map(([x, y]) => [-x, y] as [number, number]),
  ]
  const cols = section.length
  const positions: number[] = []
  const colors: number[] = []
  const c = new THREE.Color()
  const depth = HULL.deck - HULL.keel

  for (let i = 0; i <= stations; i++) {
    const u = i / stations
    for (let j = 0; j < cols; j++) {
      const [xn, yn] = section[j]
      const y = HULL.keel + yn * depth
      const x = xn * halfBreadth(u, yn) * (HULL.beam / 2)
      const z = STERN_Z + u * HULL.length + zShift(u, yn)
      positions.push(x, y, z)
      hullColor(y, c)
      colors.push(c.r, c.g, c.b)
    }
  }

  const index: number[] = []
  for (let i = 0; i < stations; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j
      const b = a + cols
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setIndex(index)
  geo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.25,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geo, mat)
}

/** Deck plating and transom, closed off from the same lines as the hull. */
function buildDeckAndTransom() {
  const group = new THREE.Group()
  const steps = 120
  const edge: Array<[number, number]> = []
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    edge.push([halfBreadth(u, 1) * (HULL.beam / 2), STERN_Z + u * HULL.length])
  }

  const shape = new THREE.Shape()
  shape.moveTo(edge[0][0], -edge[0][1])
  edge.forEach(([x, z]) => shape.lineTo(x, -z))
  ;[...edge].reverse().forEach(([x, z]) => shape.lineTo(-x, -z))
  const deckGeo = new THREE.ShapeGeometry(shape, 1)
  deckGeo.rotateX(-Math.PI / 2)
  deckGeo.translate(0, HULL.deck, 0)
  const deck = new THREE.Mesh(
    deckGeo,
    new THREE.MeshStandardMaterial({ color: '#4b5a55', roughness: 0.9, metalness: 0.1 })
  )
  group.add(deck)

  const transomShape = new THREE.Shape()
  const depth = HULL.deck - HULL.keel
  PROFILE.forEach(([xn, yn], k) => {
    const x = xn * halfBreadth(0, yn) * (HULL.beam / 2)
    const y = HULL.keel + yn * depth
    if (k === 0) transomShape.moveTo(x, y)
    else transomShape.lineTo(x, y)
  })
  ;[...PROFILE].reverse().forEach(([xn, yn]) => {
    transomShape.lineTo(-xn * halfBreadth(0, yn) * (HULL.beam / 2), HULL.keel + yn * depth)
  })
  const transom = new THREE.Mesh(
    new THREE.ShapeGeometry(transomShape),
    new THREE.MeshStandardMaterial({ color: '#1a2a3c', roughness: 0.6, side: THREE.DoubleSide })
  )
  transom.position.z = STERN_Z + zShift(0, 1)
  group.add(transom)

  // Forecastle breakwater: the angled plate that keeps green water off the stow.
  const bw = new THREE.Mesh(
    new THREE.BoxGeometry(HULL.beam * 0.7, 5, 0.6),
    new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.7 })
  )
  bw.position.set(0, HULL.deck + 2.2, STERN_Z + HULL.length * 0.845)
  bw.rotation.x = -0.35
  group.add(bw)

  return group
}

/** Corrugated steel, drawn once to a canvas and shared by every box. */
function corrugationTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 256, 64)
  for (let x = 0; x < 256; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0)
    g.addColorStop(0, '#9a9a9a')
    g.addColorStop(0.45, '#ffffff')
    g.addColorStop(1, '#b8b8b8')
    ctx.fillStyle = g
    ctx.fillRect(x, 3, 8, 58)
  }
  // Top and bottom rails.
  ctx.fillStyle = '#7a7a7a'
  ctx.fillRect(0, 0, 256, 3)
  ctx.fillRect(0, 61, 256, 3)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/**
 * Box liveries. Generic, weathered colours in the proportions you actually see
 * on a stow, not any carrier's trade dress.
 */
const LIVERIES: Array<[string, number]> = [
  ['#1f4d86', 16],
  ['#9d2f28', 12],
  ['#6b6e72', 12],
  ['#1b6f6a', 9],
  ['#c7762c', 8],
  ['#dcd8cf', 8],
  ['#6f4630', 7],
  ['#2f6338', 6],
  ['#26364a', 9],
  ['#b99433', 4],
  ['#7d1d2c', 5],
  ['#4f7c9c', 4],
]

function pickLivery(rand: () => number) {
  const total = LIVERIES.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [c, w] of LIVERIES) {
    r -= w
    if (r <= 0) return c
  }
  return LIVERIES[0][0]
}

const BOX = { w: 2.438, h: 2.591, l: 12.192 }
const ROW_PITCH = 2.54
const TIER_PITCH = 2.62
const BAY_PITCH = 13.1

function buildStow(rand: () => number) {
  type Slot = { x: number; y: number; z: number; color: THREE.Color }
  const slots: Slot[] = []
  const hatches: Array<{ z: number; width: number }> = []
  const lashings: Array<{ z: number; width: number }> = []

  const firstBay = STERN_Z + 40
  const lastBay = STERN_Z + HULL.length * 0.86
  const base = HULL.deck + 1.6

  for (let z = firstBay; z < lastBay; z += BAY_PITCH) {
    if (Math.abs(z - BRIDGE_Z) < 13 || Math.abs(z - FUNNEL_Z) < 12) continue

    const u0 = (z - BOX.l / 2 - STERN_Z) / HULL.length
    const u1 = (z + BOX.l / 2 - STERN_Z) / HULL.length
    const halfRoom =
      Math.min(halfBreadth(u0, 1), halfBreadth(u1, 1)) * (HULL.beam / 2) - 1.2
    const rows = Math.min(18, Math.floor((halfRoom * 2) / ROW_PITCH))
    if (rows < 4) continue

    const width = rows * ROW_PITCH
    hatches.push({ z, width })
    lashings.push({ z: z + BAY_PITCH / 2, width })

    // Stack height falls away toward the bow for the bridge's line of sight.
    const uMid = (z - STERN_Z) / HULL.length
    const bowFall = uMid > 0.68 ? Math.round((uMid - 0.68) * 22) : 0
    const bayTiers = 6 + Math.floor(rand() * 3) - bowFall

    for (let r = 0; r < rows; r++) {
      const x = -width / 2 + ROW_PITCH / 2 + r * ROW_PITCH
      let tiers = bayTiers - (rand() < 0.28 ? 1 + Math.floor(rand() * 2) : 0)
      if (rand() < 0.04) tiers = 0
      // Outboard stacks run a tier lower, as they do for stability.
      if (r === 0 || r === rows - 1) tiers -= 1
      for (let t = 0; t < Math.max(0, tiers); t++) {
        const color = new THREE.Color(pickLivery(rand))
        // Cheap ambient occlusion: lower tiers and inner rows sit in shade.
        const shade = 0.5 + 0.5 * ((t + 1) / (bayTiers + 1))
        color.multiplyScalar(shade * (0.9 + rand() * 0.2))
        slots.push({ x, y: base + BOX.h / 2 + t * TIER_PITCH, z, color })
      }
    }
  }

  const tex = corrugationTexture()
  const boxMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.6,
    metalness: 0.08,
  })
  const boxes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(BOX.w, BOX.h, BOX.l),
    boxMat,
    slots.length
  )
  const m = new THREE.Matrix4()
  slots.forEach((s, i) => {
    m.makeTranslation(s.x, s.y, s.z)
    boxes.setMatrixAt(i, m)
    boxes.setColorAt(i, s.color)
  })
  boxes.instanceMatrix.needsUpdate = true
  if (boxes.instanceColor) boxes.instanceColor.needsUpdate = true

  const group = new THREE.Group()
  group.add(boxes)

  const hatchMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1.4, BOX.l + 0.4),
    new THREE.MeshStandardMaterial({ color: '#3b4744', roughness: 0.85 }),
    hatches.length
  )
  hatches.forEach((h, i) => {
    m.compose(
      new THREE.Vector3(0, HULL.deck + 0.7, h.z),
      new THREE.Quaternion(),
      new THREE.Vector3(h.width + 0.6, 1, 1)
    )
    hatchMesh.setMatrixAt(i, m)
  })
  group.add(hatchMesh)

  // Lashing bridges: open steel frames between bays, posts and a top rail.
  const frames: THREE.Matrix4[] = []
  lashings.forEach((l) => {
    const posts = Math.max(2, Math.round(l.width / (ROW_PITCH * 3)))
    for (let k = 0; k <= posts; k++) {
      const x = -l.width / 2 + (k / posts) * l.width
      frames.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, base + 2.6, l.z),
          new THREE.Quaternion(),
          new THREE.Vector3(0.45, 5.2, 0.45)
        )
      )
    }
    frames.push(
      new THREE.Matrix4().compose(
        new THREE.Vector3(0, base + 5.2, l.z),
        new THREE.Quaternion(),
        new THREE.Vector3(l.width + 0.6, 0.5, 0.9)
      )
    )
  })
  const lashMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#8e938f', roughness: 0.7, metalness: 0.3 }),
    frames.length
  )
  frames.forEach((f, i) => lashMesh.setMatrixAt(i, f))
  group.add(lashMesh)

  return { group, count: slots.length }
}

/** Accommodation windows; the same canvas drives the lit-window emissive map. */
function windowTextures(rand: () => number, floors: number, bays: number) {
  const w = 512
  const h = 512
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const base = make()
  const glow = make()
  const b = base.getContext('2d')!
  const g = glow.getContext('2d')!
  b.fillStyle = '#e9e6df'
  b.fillRect(0, 0, w, h)
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  const fh = h / floors
  const bw = w / bays
  for (let f = 0; f < floors; f++) {
    // Deck line under each level.
    b.fillStyle = '#b9b5ac'
    b.fillRect(0, f * fh + fh - 3, w, 3)
    for (let k = 0; k < bays; k++) {
      const x = k * bw + bw * 0.22
      const y = f * fh + fh * 0.3
      b.fillStyle = '#1d2630'
      b.fillRect(x, y, bw * 0.56, fh * 0.38)
      if (rand() < 0.42) {
        g.fillStyle = rand() < 0.5 ? '#ffcf8a' : '#fff1d0'
        g.fillRect(x, y, bw * 0.56, fh * 0.38)
      }
    }
  }
  const map = new THREE.CanvasTexture(base)
  map.colorSpace = THREE.SRGBColorSpace
  const emissive = new THREE.CanvasTexture(glow)
  emissive.colorSpace = THREE.SRGBColorSpace
  return { map, emissive }
}

function glowSprite(color: string, size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.18, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  )
  sprite.scale.setScalar(size)
  return sprite
}

function buildSuperstructure(rand: () => number) {
  const group = new THREE.Group()
  const white = new THREE.MeshStandardMaterial({ color: '#e9e6df', roughness: 0.6, metalness: 0.1 })

  // Accommodation block: tall and shallow, the bridge on top spanning the beam.
  const floors = 9
  const blockH = floors * 3.1
  const { map, emissive } = windowTextures(rand, floors, 12)
  const faced = new THREE.MeshStandardMaterial({
    map,
    emissiveMap: emissive,
    emissive: new THREE.Color('#ffd9a0'),
    emissiveIntensity: 1.4,
    roughness: 0.55,
  })
  const block = new THREE.Mesh(new THREE.BoxGeometry(30, blockH, 14), [
    faced,
    faced,
    white,
    white,
    faced,
    faced,
  ])
  block.position.set(0, HULL.deck + blockH / 2, BRIDGE_Z)
  group.add(block)

  const bridgeY = HULL.deck + blockH + 1.8
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(HULL.beam + 2, 3.6, 8), white)
  bridge.position.set(0, bridgeY, BRIDGE_Z + 2)
  group.add(bridge)

  // Bridge glazing: a dark band wrapping the front and wings.
  const glazing = new THREE.Mesh(
    new THREE.BoxGeometry(HULL.beam + 2.1, 1.5, 8.1),
    new THREE.MeshStandardMaterial({
      color: '#10161d',
      roughness: 0.15,
      metalness: 0.6,
      emissive: new THREE.Color('#2a4a5a'),
      emissiveIntensity: 0.35,
    })
  )
  glazing.position.set(0, bridgeY + 0.3, BRIDGE_Z + 2)
  group.add(glazing)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(HULL.beam + 3, 0.5, 9), white)
  roof.position.set(0, bridgeY + 2.05, BRIDGE_Z + 2)
  group.add(roof)

  // Radar mast.
  const mastMat = new THREE.MeshStandardMaterial({ color: '#d4d0c8', roughness: 0.5, metalness: 0.4 })
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 11, 8), mastMat)
  mast.position.set(0, bridgeY + 7.5, BRIDGE_Z)
  group.add(mast)
  const yard = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 0.35), mastMat)
  yard.position.set(0, bridgeY + 10, BRIDGE_Z)
  group.add(yard)
  const radar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 0.6), mastMat)
  radar.position.set(0, bridgeY + 5, BRIDGE_Z - 1)
  radar.name = 'radar'
  group.add(radar)

  // Funnel, set well aft over the engine room.
  const funnelBase = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 16), white)
  funnelBase.position.set(0, HULL.deck + 4, FUNNEL_Z)
  group.add(funnelBase)
  const funnel = new THREE.Mesh(
    new THREE.BoxGeometry(10, 16, 11),
    new THREE.MeshStandardMaterial({ color: '#23272c', roughness: 0.7 })
  )
  funnel.position.set(0, HULL.deck + 16, FUNNEL_Z)
  group.add(funnel)
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(10.1, 3, 11.1),
    new THREE.MeshStandardMaterial({ color: '#c8151c', roughness: 0.6 })
  )
  band.position.set(0, HULL.deck + 18.5, FUNNEL_Z)
  group.add(band)

  // Foremast with the masthead light.
  const foremast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 18, 8), mastMat)
  const foreZ = STERN_Z + HULL.length * 0.93
  foremast.position.set(0, HULL.deck + 9, foreZ)
  group.add(foremast)

  // Navigation lights: masthead white, port red, starboard green, stern white.
  const lights: Array<[string, THREE.Vector3, number]> = [
    ['#fff4d6', new THREE.Vector3(0, HULL.deck + 18.5, foreZ), 3.2],
    ['#fff4d6', new THREE.Vector3(0, bridgeY + 11, BRIDGE_Z), 3],
    ['#ff3b30', new THREE.Vector3(-(HULL.beam / 2 + 1.2), bridgeY, BRIDGE_Z + 5), 3.4],
    ['#3dff8a', new THREE.Vector3(HULL.beam / 2 + 1.2, bridgeY, BRIDGE_Z + 5), 3.4],
    ['#fff4d6', new THREE.Vector3(0, HULL.deck + 2, STERN_Z + 3), 2.6],
  ]
  lights.forEach(([color, pos, size]) => {
    const s = glowSprite(color, size)
    s.position.copy(pos)
    group.add(s)
  })

  return group
}

export function buildShip() {
  const rand = mulberry32(20240517)
  const ship = new THREE.Group()
  ship.add(buildHull())
  ship.add(buildDeckAndTransom())
  const stow = buildStow(rand)
  ship.add(stow.group)
  ship.add(buildSuperstructure(rand))
  return { ship, boxes: stow.count }
}
