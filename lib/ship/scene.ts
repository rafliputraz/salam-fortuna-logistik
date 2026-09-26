import * as THREE from 'three'
import { buildShip, BRIDGE_Z } from './model'
import { buildFoam, buildSky, buildWater, HAZE, SUN_DIR } from './sea'

/**
 * One camera move per chapter of the story. Positions and targets are in
 * metres in the ship's frame (bow +z). `up` lets the overhead shot lay the
 * ship across the frame instead of pointing it at the top of the screen.
 */
type Key = { pos: THREE.Vector3; look: THREE.Vector3; up: THREE.Vector3 }

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

function keyframes(portrait: boolean): Key[] {
  if (portrait) {
    return [
      { pos: v(-210, 30, 520), look: v(10, 22, 0), up: v(0, 1, 0) },
      { pos: v(95, 30, 330), look: v(0, 26, 90), up: v(0, 1, 0) },
      { pos: v(0, 620, 0), look: v(0, 0, 4), up: v(0, 0, 1) },
      { pos: v(-30, 58, BRIDGE_Z - 6), look: v(8, 36, 230), up: v(0, 1, 0) },
      { pos: v(-150, 120, -640), look: v(0, 22, 0), up: v(0, 1, 0) },
    ]
  }
  return [
    // Bow-on, low to the water, the ship holding the right of the frame.
    { pos: v(-112, 15, 345), look: v(-58, 27, 30), up: v(0, 1, 0) },
    // In close on the starboard bow, looking down the length of the hull.
    { pos: v(78, 22, 250), look: v(-6, 30, 60), up: v(0, 1, 0) },
    // Straight overhead: the whole stow laid out, bow to the right.
    { pos: v(0, 600, -112), look: v(0, 0, -112), up: v(1, 0, -0.16) },
    // The bridge wing, looking forward over the boxes.
    { pos: v(-33, 57, BRIDGE_Z - 2), look: v(22, 18, 190), up: v(0, 1, 0) },
    // Falling astern as she sails on.
    { pos: v(70, 70, -560), look: v(118, 18, -40), up: v(0, 1, 0) },
  ]
}

export type ShipScene = {
  setProgress: (p: number) => void
  setIntro: (t: number) => void
  start: () => void
  stop: () => void
  renderOnce: () => void
  dispose: () => void
  boxes: number
}

export function createShipScene(canvas: HTMLCanvasElement): ShipScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(HAZE, 0.00055)

  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 12000)

  const hemi = new THREE.HemisphereLight('#a9bdd3', '#1a2530', 1.7)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#ffc48f', 3.2)
  sun.position.copy(SUN_DIR).multiplyScalar(1000)
  scene.add(sun)
  // Cool fill from the open sky side, so the lit-away faces keep their colour.
  const fill = new THREE.DirectionalLight('#8aa5c4', 1.5)
  fill.position.set(-600, 500, 700)
  scene.add(fill)

  scene.add(buildSky())
  const { water, uniforms: waterU } = buildWater()
  scene.add(water)
  const { foam, uniforms: foamU } = buildFoam()
  scene.add(foam)
  const { ship, boxes } = buildShip()
  scene.add(ship)
  const radar = ship.getObjectByName('radar')

  let keys = keyframes(false)
  let posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal')
  let lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal')

  let target = 0
  let current = 0
  let intro = 0 // 1 = still arriving, 0 = settled
  let running = false
  let portrait = false
  const clock = new THREE.Clock()

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const isPortrait = camera.aspect < 0.85
    // Hold a steady horizontal field so a phone sees the same width of sea.
    camera.fov = isPortrait ? 52 : 34
    camera.updateProjectionMatrix()
    if (isPortrait !== portrait || !posCurve) {
      portrait = isPortrait
      keys = keyframes(portrait)
      posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal')
      lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal')
    }
  }

  const upA = new THREE.Vector3()
  const upB = new THREE.Vector3()
  const look = new THREE.Vector3()
  const introOffset = v(-40, 26, 260)

  function placeCamera(p: number) {
    const t = THREE.MathUtils.clamp(p, 0, 1)
    posCurve.getPoint(t, camera.position)
    lookCurve.getPoint(t, look)

    const seg = t * (keys.length - 1)
    const i = Math.min(Math.floor(seg), keys.length - 2)
    const f = THREE.MathUtils.smoothstep(seg - i, 0, 1)
    upA.copy(keys[i].up)
    upB.copy(keys[i + 1].up)
    camera.up.copy(upA.lerp(upB, f).normalize())

    if (intro > 0) {
      const e = intro * intro * (3 - 2 * intro)
      camera.position.addScaledVector(introOffset, e)
    }
    camera.lookAt(look)
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    // Critically damped follow: scroll input stays smooth even on a wheel.
    current += (target - current) * (1 - Math.exp(-dt * 6))

    waterU.uTime.value = time
    waterU.uFlow.value = time * 6.5
    foamU.uTime.value = time
    foamU.uFlow.value = time * 6.5

    // A laden ship barely moves in a swell; the motion is felt, not seen.
    ship.position.y = Math.sin(time * 0.55) * 0.28
    ship.rotation.z = Math.sin(time * 0.42) * 0.0045
    ship.rotation.x = Math.sin(time * 0.31 + 1.2) * 0.0022
    if (radar) radar.rotation.y = time * 2.2

    placeCamera(current)
    renderer.render(scene, camera)
  }

  const ro = new ResizeObserver(() => {
    resize()
    if (!running) frame()
  })
  ro.observe(canvas)
  resize()

  return {
    boxes,
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
          Object.values(m).forEach((val) => {
            if (val instanceof THREE.Texture) val.dispose()
          })
          m.dispose()
        })
      })
      renderer.dispose()
    },
  }
}
