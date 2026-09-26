import * as THREE from 'three'
import { buildShip } from './model'
import { buildFoam, buildSky, HAZE, SUN_DIR } from './sea'
import { Ocean } from './water'

/**
 * The hero: a to-scale container ship making way at dusk, and a camera that
 * circles her as the page scrolls. One full turn over the story, starting
 * off the port bow, passing broadside, rising over the stern for a look down
 * the stow, round the far side and back toward the bow as it pulls away.
 */

/** Centre of the orbit: amidships, a little above the deck. */
const CENTRE = new THREE.Vector3(0, 22, 0)
/** Where the camera starts, as an angle round the ship (0 = dead ahead). */
const START = THREE.MathUtils.degToRad(-38)
/** How far round the camera travels over the whole story. */
const SWEEP = THREE.MathUtils.degToRad(330)

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
  renderer.toneMappingExposure = 1.1
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(HAZE, 0.0005)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 12000)

  scene.add(new THREE.HemisphereLight('#a9bdd3', '#1a2530', 1.7))
  const sun = new THREE.DirectionalLight('#ffc48f', 3.2)
  sun.position.copy(SUN_DIR).multiplyScalar(1000)
  scene.add(sun)
  // Cool fill from the open-sky side, so the faces turned from the sun keep their colour.
  const fill = new THREE.DirectionalLight('#8aa5c4', 1.5)
  fill.position.set(-600, 500, 700)
  scene.add(fill)

  scene.add(buildSky())

  const normals = new THREE.TextureLoader().load('/images/ship/waternormals.jpg', () => onReady?.())
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping
  const ocean = new Ocean({
    normals,
    sunDirection: SUN_DIR,
    sunColor: '#ffbf8c',
    waterColor: '#0b1b23',
    distortionScale: 14,
    size: 1.3,
  })
  scene.add(ocean)

  const { foam, uniforms: foamU } = buildFoam()
  scene.add(foam)
  const { ship } = buildShip()
  scene.add(ship)
  const radar = ship.getObjectByName('radar')

  let target = 0
  let current = 0
  let intro = 0
  let running = false
  let portrait = false
  const clock = new THREE.Clock()
  const flow = new THREE.Vector2()
  const look = new THREE.Vector3()
  const toShip = new THREE.Vector3()
  const right = new THREE.Vector3()
  const UP = new THREE.Vector3(0, 1, 0)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    const dpr = renderer.getPixelRatio()
    ocean.setMirrorSize(w * dpr * 0.6, h * dpr * 0.6)
    camera.aspect = w / h
    portrait = camera.aspect < 0.85
    camera.fov = portrait ? 52 : 34
    camera.updateProjectionMatrix()
  }

  /** Place the camera on its orbit for story progress `p` (0 to 1). */
  function orbit(p: number, time: number) {
    // A slow drift on top of the scroll, so a still page still breathes.
    const angle = START + p * SWEEP + Math.sin(time * 0.09) * 0.02
    const side = Math.abs(Math.sin(angle))

    // Stand further off when she is broadside, so all 330 m stay in frame.
    let radius = (portrait ? 470 : 290) + (portrait ? 190 : 200) * side
    radius += 160 * p * p * p // pulling away at the end
    // Low on the water, rising over the stern mid-story, higher as she leaves.
    const height = 12 + 95 * Math.sin(Math.PI * p) ** 2 + 60 * p * p

    if (intro > 0) radius *= 1 + 0.45 * intro * intro * (3 - 2 * intro)

    camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius)

    // Frame her to the right of the text on wide screens, high on phones.
    look.copy(CENTRE)
    toShip.subVectors(CENTRE, camera.position).setY(0).normalize()
    right.crossVectors(toShip, UP).normalize()
    if (portrait) look.y -= radius * 0.2
    else look.addScaledVector(right, -radius * 0.17)
    camera.lookAt(look)
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    current += (target - current) * (1 - Math.exp(-dt * 5))

    // She makes way along +z; the sea streams past the other way.
    flow.y += dt * 6.5
    ocean.update(time * 0.7, flow)
    foamU.uTime.value = time
    foamU.uFlow.value = flow.y

    // A laden ship barely moves in a swell; the motion is felt, not seen.
    ship.position.y = Math.sin(time * 0.55) * 0.28
    ship.rotation.z = Math.sin(time * 0.42) * 0.0045
    ship.rotation.x = Math.sin(time * 0.31 + 1.2) * 0.0022
    if (radar) radar.rotation.y = time * 2.2

    orbit(THREE.MathUtils.clamp(current, 0, 1), time)
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
        mats.forEach((m) => {
          Object.values(m).forEach((val) => val instanceof THREE.Texture && val.dispose())
          m.dispose()
        })
      })
      normals.dispose()
      ocean.target.dispose()
      renderer.dispose()
    },
  }
}
