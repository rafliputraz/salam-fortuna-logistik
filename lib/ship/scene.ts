import * as THREE from 'three'
import { buildPhotoShip, BOW, HEADING, photoPoint, STERN } from './photo'
import { buildSky, buildWake, buildWater, HAZE } from './sea'

/**
 * One camera move per chapter, in the ship's frame (x across the photo,
 * y up from the waterline, z toward the viewer). Every shot stays within a
 * few degrees of the angle the photograph was taken from, and at about the
 * photographer's height: the horizon in the photo puts the lens ~29 m up.
 */
type Key = { pos: THREE.Vector3; look: THREE.Vector3 }

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const STACKS = photoPoint(470, 360)
const BRIDGE = photoPoint(1110, 150)
const HULL_SIDE = photoPoint(1420, 690)

function keyframes(portrait: boolean): Key[] {
  if (portrait) {
    return [
      { pos: v(10, 29, 760), look: v(10, -55, 0) },
      { pos: v(HULL_SIDE.x, 20, 300), look: v(HULL_SIDE.x, 2, 0) },
      { pos: v(STACKS.x, 70, 230), look: v(STACKS.x, 48, 0) },
      { pos: v(BRIDGE.x, 108, 190), look: v(BRIDGE.x, 92, 0) },
      { pos: v(40, 29, 760), look: v(230, -40, -420) },
    ]
  }
  return [
    // The whole ship, holding the right of the frame, horizon low as in the photo.
    { pos: v(-100, 29, 560), look: v(-100, 62, 0) },
    // Along the hull toward the bow.
    { pos: v(HULL_SIDE.x - 40, 20, 280), look: v(HULL_SIDE.x - 40, 40, 0) },
    // Into the stow.
    { pos: v(STACKS.x - 40, 68, 185), look: v(STACKS.x - 40, 74, 0) },
    // Up at the bridge.
    { pos: v(BRIDGE.x - 30, 106, 165), look: v(BRIDGE.x - 30, 108, 0) },
    // Standing off while she sails away into the weather.
    { pos: v(-110, 29, 560), look: v(-10, 55, -200) },
  ]
}

/** How far she has sailed by the end of the story, in metres. */
const DEPARTURE = 620

export type ShipScene = {
  setProgress: (p: number) => void
  setIntro: (t: number) => void
  start: () => void
  stop: () => void
  renderOnce: () => void
  dispose: () => void
}

export function createShipScene(canvas: HTMLCanvasElement, onReady?: () => void): ShipScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(HAZE, 0.0004)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 12000)

  const { sky, uniforms: skyU } = buildSky()
  scene.add(sky)
  const { water, uniforms: waterU } = buildWater()
  scene.add(water)

  // Everything that sails: the photo, its reflection, and its wake.
  const vessel = new THREE.Group()
  scene.add(vessel)
  const bobber = new THREE.Group()
  vessel.add(bobber)

  const { wake, uniforms: wakeU } = buildWake({
    stern: STERN,
    sternDir: new THREE.Vector2(-0.55, 0.84),
    bow: BOW,
    bowDir: new THREE.Vector2(0.42, 0.9),
  })
  vessel.add(wake)

  let photo: ReturnType<typeof buildPhotoShip> | null = null
  const src = window.innerWidth < 900 ? '/images/ship/ship-sm.webp' : '/images/ship/ship.webp'
  new THREE.TextureLoader().load(src, (map) => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = renderer.capabilities.getMaxAnisotropy()
    photo = buildPhotoShip(map)
    bobber.add(photo.reflection)
    bobber.add(photo.hull)
    if (!running) frame()
    onReady?.()
  })

  let keys = keyframes(false)
  let posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal')
  let lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal')
  let portrait = false

  let target = 0
  let current = 0
  let intro = 0
  let running = false
  const clock = new THREE.Clock()
  const flow = new THREE.Vector2()

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const isPortrait = camera.aspect < 0.85
    camera.fov = isPortrait ? 52 : 34
    camera.updateProjectionMatrix()
    if (isPortrait !== portrait) {
      portrait = isPortrait
      keys = keyframes(portrait)
      posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal')
      lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal')
    }
  }

  const look = new THREE.Vector3()
  const introOffset = v(-30, 6, 320)

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    current += (target - current) * (1 - Math.exp(-dt * 6))
    const p = THREE.MathUtils.clamp(current, 0, 1)

    // She makes way the whole time; the sea streams past in the opposite sense.
    flow.x += HEADING.x * dt * 7
    flow.y += HEADING.z * dt * 7
    waterU.uTime.value = time
    waterU.uFlow.value.copy(flow)
    wakeU.uTime.value = time
    wakeU.uFlow.value.copy(flow)
    skyU.uTime.value = time

    // In the last chapter she stands out to sea and fades into the weather.
    const leave = THREE.MathUtils.smoothstep(p, 0.76, 1)
    vessel.position.copy(HEADING).multiplyScalar(leave * leave * DEPARTURE)

    bobber.position.y = Math.sin(time * 0.5) * 0.35
    bobber.rotation.z = Math.sin(time * 0.37) * 0.0035

    if (photo) {
      photo.set('uTime', time)
      photo.set('uFlowX', flow.x)
      photo.set('uHaze', leave * 0.5)
    }

    posCurve.getPoint(p, camera.position)
    lookCurve.getPoint(p, look)
    if (intro > 0) {
      const e = intro * intro * (3 - 2 * intro)
      camera.position.addScaledVector(introOffset, e)
    }
    camera.lookAt(look)
    renderer.render(scene, camera)
  }

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
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
        mats.forEach((m) => m.dispose())
      })
      photo?.hull.material && (photo.hull.material as THREE.ShaderMaterial).uniforms.uMap.value.dispose()
      renderer.dispose()
    },
  }
}
