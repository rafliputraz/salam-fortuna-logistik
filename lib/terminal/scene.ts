import * as THREE from 'three'

/**
 * A container terminal from a single photograph, rebuilt in depth.
 *
 * A depth map (estimated offline with Depth Anything V2) lifts every pixel
 * of the photo back out to where it stood, so the stacks, the cranes and
 * the ship at berth become a relief the camera can move through. The sky is
 * a separate plate, with the cranes painted out, far behind; the relief
 * lets it show through wherever the photo was sky. Moving the camera then
 * gives real parallax: cranes slide against the clouds, front rows against
 * the back.
 *
 * Seen from the origin with the photo's own field of view, the scene is
 * exactly the photograph; every shot stays on or near a ray from that point
 * so the relief never has to show anything the camera didn't see.
 */

/** The photo's pixel size, and the lens it was taken with (a guess: a short tele). */
const PHOTO_W = 2000
const PHOTO_H = 1334
const HFOV = 42
const TAN_X = Math.tan(THREE.MathUtils.degToRad(HFOV / 2))
const TAN_Y = TAN_X * (PHOTO_H / PHOTO_W)

/** Depth-map values (0 = sky, 1 = nearest) mapped to metres from the lens. */
const NEAR = 150
const FAR = 2500
const SKY_DIST = 4200

/** Below this depth-map value a pixel counts as sky. */
const SKY_EDGE: [number, number] = [0.035, 0.075]

/** Margin of stretched edge pixels around the relief, so a moving camera never sees past it. */
const MARGIN = 0.035

const distFor = (d: number) => 1 / (d * (1 / NEAR - 1 / FAR) + 1 / FAR)

/**
 * A shot: which pixel to frame, how far to zoom the lens, and a small
 * physical camera move (metres) for parallax. Magnification comes from the
 * lens, never from flying in: the relief only holds up to modest moves.
 */
type Shot = { px: number; py: number; zoom: number; move: [number, number, number] }

const SHOTS: Shot[] = [
  // The whole terminal: exactly the photograph.
  { px: 1000, py: 667, zoom: 1, move: [0, 0, 0] },
  // The ship-to-shore cranes working the berth.
  { px: 1000, py: 690, zoom: 1.9, move: [10, 4, -18] },
  // Down into the stack yard.
  { px: 880, py: 1060, zoom: 2.1, move: [-10, 3, -20] },
  // The ship at berth, her bridge above the stow (text sits right for this one).
  { px: 560, py: 800, zoom: 2.2, move: [6, 1, -10] },
  // The rail line carrying boxes inland, along the foot of the frame.
  { px: 1250, py: 1240, zoom: 1.45, move: [-10, 2, -16] },
]

/** Portrait screens see a narrow slice; open on the ship and cranes. */
const PORTRAIT_OVERVIEW: Shot = { px: 620, py: 740, zoom: 1, move: [0, 0, 0] }

export type TerminalScene = {
  setProgress: (p: number) => void
  setIntro: (t: number) => void
  start: () => void
  stop: () => void
  renderOnce: () => void
  dispose: () => void
}

function loadImageData(src: string): Promise<{ data: Uint8ClampedArray; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      resolve({ data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height })
    }
    img.onerror = reject
    img.src = src
  })
}

export function createTerminalScene(canvas: HTMLCanvasElement, onReady?: () => void): TerminalScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor('#0b141b')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 20000)

  // Ready once the three images and the readable depth pixels are all in.
  let pending = 5
  const loaded = () => {
    pending -= 1
    if (pending > 0) return
    if (!running) frame()
    onReady?.()
  }
  const loader = new THREE.TextureLoader()
  const small = window.innerWidth < 900
  // Phones see a narrow slice of the photo, so they need its full resolution too.
  const photo = loader.load('/images/terminal/photo.webp', loaded)
  const sky = loader.load('/images/terminal/sky.webp', loaded)
  const depth = loader.load('/images/terminal/depth.png', loaded)
  // Undilated depth: decides, per pixel, what is sky.
  const mask = loader.load('/images/terminal/mask.png', loaded)
  photo.colorSpace = sky.colorSpace = THREE.SRGBColorSpace
  ;[photo, sky, depth, mask].forEach((t) => {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    t.anisotropy = 8
  })

  const uniforms = {
    uPhoto: { value: photo },
    uSky: { value: sky },
    uDepth: { value: depth },
    uMask: { value: mask },
    uTan: { value: new THREE.Vector2(TAN_X, TAN_Y) },
    uNear: { value: NEAR },
    uFar: { value: FAR },
    uSkyEdge: { value: new THREE.Vector2(...SKY_EDGE) },
    uTime: { value: 0 },
  }

  // --- Sky plate: far behind everything, oversized so it always fills. ----
  const skyGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
  const skyMat = new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform vec2 uTan;
      varying vec2 vUv;
      void main() {
        // Extend the plate 60% past the photo on every side.
        vec2 uv = (uv - 0.5) * 2.2 + 0.5;
        vUv = uv;
        vec3 p = vec3((uv.x - 0.5) * 2.0 * uTan.x, (uv.y - 0.5) * 2.0 * uTan.y, -1.0) * ${SKY_DIST.toFixed(1)};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uSky;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        // The cloud deck drifts, a little faster higher up where it is nearer.
        float lift = smoothstep(0.35, 1.0, vUv.y);
        vec2 uv = vUv + vec2(uTime * (0.0012 + 0.0022 * lift), 0.0);
        uv.y = clamp(uv.y, 0.0, 1.0);
        uv.x = abs(mod(uv.x + 1.0, 2.0) - 1.0);
        gl_FragColor = texture2D(uSky, uv);
        #include <colorspace_fragment>
      }
    `,
  })
  const skyMesh = new THREE.Mesh(skyGeo, skyMat)
  skyMesh.frustumCulled = false
  skyMesh.renderOrder = -1
  scene.add(skyMesh)

  // --- The terminal, lifted into relief by the depth map. -------------------
  const cols = small ? 420 : 520
  const rows = Math.round((cols * PHOTO_H) / PHOTO_W)
  const reliefGeo = new THREE.PlaneGeometry(1, 1, cols, rows)
  const uvAttr = reliefGeo.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uvAttr.count; i++) {
    uvAttr.setXY(i, uvAttr.getX(i) * (1 + 2 * MARGIN) - MARGIN, uvAttr.getY(i) * (1 + 2 * MARGIN) - MARGIN)
  }
  const reliefMat = new THREE.ShaderMaterial({
    uniforms,
    alphaToCoverage: true,
    transparent: false,
    vertexShader: /* glsl */ `
      uniform sampler2D uDepth;
      uniform vec2 uTan;
      uniform float uNear;
      uniform float uFar;
      varying vec2 vUv;
      void main() {
        vec2 cuv = clamp(uv, 0.0, 1.0);
        float d = texture2D(uDepth, cuv).r;
        float dist = 1.0 / (d * (1.0 / uNear - 1.0 / uFar) + 1.0 / uFar);
        vec3 p = vec3((uv.x - 0.5) * 2.0 * uTan.x, (uv.y - 0.5) * 2.0 * uTan.y, -1.0) * dist;
        vUv = cuv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPhoto;
      uniform sampler2D uMask;
      uniform vec2 uSkyEdge;
      varying vec2 vUv;
      void main() {
        float d = texture2D(uMask, vUv).r;
        float a = smoothstep(uSkyEdge.x, uSkyEdge.y, d);
        if (a < 0.02) discard;
        gl_FragColor = vec4(texture2D(uPhoto, vUv).rgb, a);
        #include <colorspace_fragment>
      }
    `,
  })
  const relief = new THREE.Mesh(reliefGeo, reliefMat)
  relief.frustumCulled = false
  scene.add(relief)

  // --- Camera ----------------------------------------------------------------
  // Shots are resolved to 3D once the depth map is readable.
  type Resolved = { pos: THREE.Vector3; look: THREE.Vector3; zoom: number }
  let shots: Resolved[] = []
  let portraitOverview: Resolved | null = null
  let depthPixels: { data: Uint8ClampedArray; w: number; h: number } | null = null

  const point = (px: number, py: number) => {
    const u = px / PHOTO_W
    const v = 1 - py / PHOTO_H
    let d = 0.2
    if (depthPixels) {
      // Nearest solid thing around the target, so a gap between crane legs
      // doesn't send the camera off toward the sky.
      const { data, w, h } = depthPixels
      const cx = Math.round(u * (w - 1))
      const cy = Math.round((1 - v) * (h - 1))
      let best = 0
      for (let y = -6; y <= 6; y++)
        for (let x = -6; x <= 6; x++) {
          const i = (Math.min(h - 1, Math.max(0, cy + y)) * w + Math.min(w - 1, Math.max(0, cx + x))) * 4
          best = Math.max(best, data[i] / 255)
        }
      d = best
    }
    const dist = distFor(d)
    return new THREE.Vector3((u - 0.5) * 2 * TAN_X, (v - 0.5) * 2 * TAN_Y, -1).multiplyScalar(dist)
  }

  // A portrait frame is already a tight crop of the photo, so it takes far
  // less lens and less camera travel before the relief starts to show.
  const resolve = (s: Shot): Resolved => ({
    pos: new THREE.Vector3(...s.move).multiplyScalar(portrait ? 0.5 : 1),
    look: point(s.px, s.py),
    zoom: portrait ? 1 + (s.zoom - 1) * 0.35 : s.zoom,
  })

  let posCurve: THREE.CatmullRomCurve3
  let lookCurve: THREE.CatmullRomCurve3
  let zoomCurve: THREE.CatmullRomCurve3
  let portrait = false

  const build = () => {
    shots = SHOTS.map(resolve)
    portraitOverview = resolve(PORTRAIT_OVERVIEW)
    const list = shots.map((s, i) => (i === 0 && portrait && portraitOverview ? portraitOverview : s))
    posCurve = new THREE.CatmullRomCurve3(list.map((s) => s.pos), false, 'centripetal')
    lookCurve = new THREE.CatmullRomCurve3(list.map((s) => s.look), false, 'centripetal')
    zoomCurve = new THREE.CatmullRomCurve3(list.map((s) => new THREE.Vector3(s.zoom, 0, 0)))
  }
  build()

  let target = 0
  let current = 0
  let intro = 0
  let running = false
  const clock = new THREE.Clock()
  const look = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const zoomV = new THREE.Vector3()
  let baseTanV = TAN_Y

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Cover: the photo always fills the frame, cropped on the long side.
    const photoAspect = PHOTO_W / PHOTO_H
    baseTanV = camera.aspect > photoAspect ? TAN_X / camera.aspect : TAN_Y
    const isPortrait = camera.aspect < 1
    if (isPortrait !== portrait) {
      portrait = isPortrait
      build()
    }
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    current += (target - current) * (1 - Math.exp(-dt * 5))
    const p = THREE.MathUtils.clamp(current, 0, 1)
    uniforms.uTime.value = time

    posCurve.getPoint(p, camera.position)
    lookCurve.getPoint(p, look)
    let zoom = zoomCurve.getPoint(p, zoomV).x

    // A slow handheld breath, so even a still frame has depth to it.
    camera.position.x += Math.sin(time * 0.21) * 1.6
    camera.position.y += Math.sin(time * 0.17 + 1.3) * 0.8

    // Opening move: the lens pulls back out to the full photograph.
    if (intro > 0) zoom *= 1 + 0.22 * intro * intro * (3 - 2 * intro)

    const tanV = baseTanV / zoom
    const tanH = tanV * camera.aspect
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanV))
    camera.updateProjectionMatrix()

    // Never aim so far off-centre that the frame runs past the photo's edges.
    dir.subVectors(look, camera.position)
    const tx = THREE.MathUtils.clamp(dir.x / -dir.z, -(TAN_X - tanH), TAN_X - tanH)
    const ty = THREE.MathUtils.clamp(dir.y / -dir.z, -(TAN_Y - tanV), TAN_Y - tanV)
    look.set(camera.position.x + tx, camera.position.y + ty, camera.position.z - 1)
    camera.lookAt(look)
    renderer.render(scene, camera)
  }

  loadImageData('/images/terminal/depth.png')
    .then((px) => {
      depthPixels = px
      build()
      loaded()
    })
    .catch(loaded)

  const ro = new ResizeObserver(() => {
    resize()
    if (!running) frame()
  })
  ro.observe(canvas)
  resize()

  return {
    setProgress(p) {
      target = p
    },
    setIntro(t) {
      intro = t
    },
    start() {
      if (running) return
      running = true
      clock.getDelta()
      renderer.setAnimationLoop(frame)
    },
    stop() {
      running = false
      renderer.setAnimationLoop(null)
    },
    renderOnce() {
      current = target
      frame()
    },
    dispose() {
      running = false
      renderer.setAnimationLoop(null)
      ro.disconnect()
      ;[photo, sky, depth, mask].forEach((t) => t.dispose())
      skyGeo.dispose()
      reliefGeo.dispose()
      skyMat.dispose()
      reliefMat.dispose()
      renderer.dispose()
    },
  }
}
