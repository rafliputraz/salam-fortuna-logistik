import * as THREE from 'three'
import { BOW, buildPhotoShip, HEADING, STERN } from './photo'
import { buildSky, buildWake, HAZE, SUN_DIR } from './sea'
import { Ocean } from './water'

/**
 * The hero: the real ship, lifted into relief, making way on a reflective sea
 * under an overcast sky, and a camera that swings round her as the page
 * scrolls.
 *
 * The swing is a rotation, not a zoom. It opens on exactly the angle the
 * photograph was taken from, swings out past her stern quarter, climbs to
 * look down across the stow, then carries round toward her bow. A photo only
 * has one side, so the arc stays within the angles the relief can hold.
 */

/** Centre of the orbit: amidships, about deck height. */
const CENTRE = new THREE.Vector3(0, 40, 0)

/**
 * The swing through the story, as (angle in degrees round the ship, camera
 * height in metres, distance in metres). 0 degrees is the photographer's
 * position; negative swings toward her stern, positive toward her bow.
 */
const ARC: Array<[number, number, number]> = [
  [0, 29, 600],
  [-24, 34, 560],
  [-6, 110, 540],
  [18, 46, 560],
  [24, 30, 650],
]

export type ShipScene = {
  setProgress: (p: number) => void
  setIntro: (t: number) => void
  start: () => void
  stop: () => void
  renderOnce: () => void
  dispose: () => void
}

export function createShipScene(canvas: HTMLCanvasElement, onReady?: () => void): ShipScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(HAZE, 0.0004)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 12000)

  const { sky, uniforms: skyU } = buildSky()
  scene.add(sky)
  const normals = new THREE.TextureLoader().load('/images/ship/waternormals.jpg')
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping
  const ocean = new Ocean({
    normals,
    sunDirection: SUN_DIR,
    sunColor: '#aeb6bd',
    waterColor: '#1c2b32',
    distortionScale: 24,
    size: 1.6,
  })
  scene.add(ocean)

  // Everything that moves with her: the relief and its wake.
  const vessel = new THREE.Group()
  scene.add(vessel)
  const { wake, uniforms: wakeU } = buildWake({
    stern: STERN,
    sternDir: new THREE.Vector2(-0.55, 0.84),
    bow: BOW,
    bowDir: new THREE.Vector2(0.42, 0.9),
  })
  vessel.add(wake)

  // The photo and its depth map both have to land before she appears.
  let photo: ReturnType<typeof buildPhotoShip> | null = null
  const loader = new THREE.TextureLoader()
  const src = window.innerWidth < 900 ? '/images/ship/ship-sm.webp' : '/images/ship/ship.webp'
  Promise.all([loader.loadAsync(src), loader.loadAsync('/images/ship/ship-depth.png')]).then(
    ([map, depth]) => {
      map.colorSpace = THREE.SRGBColorSpace
      map.anisotropy = renderer.capabilities.getMaxAnisotropy()
      photo = buildPhotoShip(map, depth)
      vessel.add(photo.hull)
      if (!running) frame()
      onReady?.()
    }
  )

  const arc = (list: Array<[number, number, number]>) =>
    new THREE.CatmullRomCurve3(list.map(([a, h, r]) => new THREE.Vector3(a, h, r)), false, 'centripetal')
  let curve = arc(ARC)
  let portrait = false

  let target = 0
  let current = 0
  let intro = 0
  let running = false
  const clock = new THREE.Clock()
  const flow = new THREE.Vector2()
  const look = new THREE.Vector3()
  const toShip = new THREE.Vector3()
  const right = new THREE.Vector3()
  const sample = new THREE.Vector3()
  const UP = new THREE.Vector3(0, 1, 0)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    const dpr = renderer.getPixelRatio()
    ocean.setMirrorSize(w * dpr * 0.6, h * dpr * 0.6)
    camera.aspect = w / h
    const isPortrait = camera.aspect < 0.85
    camera.fov = isPortrait ? 52 : 34
    camera.updateProjectionMatrix()
    if (isPortrait !== portrait) {
      portrait = isPortrait
      // A phone needs more distance to fit her length across a narrow frame.
      curve = arc(portrait ? ARC.map(([a, h, r]) => [a, h, r * 1.45]) : ARC)
    }
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    current += (target - current) * (1 - Math.exp(-dt * 5))
    const p = THREE.MathUtils.clamp(current, 0, 1)

    // She makes way the whole time; the sea streams past in the opposite sense.
    flow.x += HEADING.x * dt * 7
    flow.y += HEADING.z * dt * 7
    ocean.update(time * 0.7, flow)
    wakeU.uTime.value = time
    wakeU.uFlow.value.copy(flow)
    skyU.uTime.value = time

    if (photo) {
      photo.set('uTime', time)
      photo.set('uFlowX', flow.x)
      photo.hull.position.y = Math.sin(time * 0.5) * 0.35
      photo.hull.rotation.z = Math.sin(time * 0.37) * 0.0035
    }

    // Where the camera sits on its arc, with a slow drift so a still page breathes.
    curve.getPoint(p, sample)
    let radius = sample.z
    if (intro > 0) radius *= 1 + 0.35 * intro * intro * (3 - 2 * intro)
    const angle = THREE.MathUtils.degToRad(sample.x) + Math.sin(time * 0.11) * 0.012
    camera.position.set(Math.sin(angle) * radius, sample.y, Math.cos(angle) * radius)

    // Frame her to the right of the text on wide screens, high on phones.
    look.copy(CENTRE)
    toShip.subVectors(CENTRE, camera.position).setY(0).normalize()
    right.crossVectors(toShip, UP).normalize()
    if (portrait) look.y -= radius * 0.12
    else look.addScaledVector(right, -radius * 0.2)
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
      if (photo) {
        const u = (photo.hull.material as THREE.ShaderMaterial).uniforms
        u.uMap.value.dispose()
        u.uDepth.value.dispose()
      }
      normals.dispose()
      ocean.target.dispose()
      renderer.dispose()
    },
  }
}
