import * as THREE from 'three'

/**
 * Reflective sea surface. A TypeScript port of three.js's `Water` object
 * (examples/jsm/objects/Water.js, MIT), which renders the scene into a
 * mirror texture every frame and ripples it with four layers of a normal map
 * taken from real water. That real reflection (the ship, the cloud deck) is
 * most of what makes it read as sea rather than a shaded plane.
 *
 * Changes from upstream: a `flow` offset so the surface streams past a ship
 * that is making way, softer overcast lighting, a mirror target that tracks
 * the canvas size, and haze toward the horizon from the scene fog.
 */
export type OceanOptions = {
  normals: THREE.Texture
  sunDirection: THREE.Vector3
  sunColor: THREE.ColorRepresentation
  waterColor: THREE.ColorRepresentation
  distortionScale: number
  size: number
}

export class Ocean extends THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  readonly target: THREE.WebGLRenderTarget

  constructor(opts: OceanOptions) {
    const geometry = new THREE.PlaneGeometry(20000, 20000)
    const target = new THREE.WebGLRenderTarget(1024, 1024, { type: THREE.HalfFloatType })
    const textureMatrix = new THREE.Matrix4()
    const eye = new THREE.Vector3()

    const material = new THREE.ShaderMaterial({
      name: 'OceanShader',
      lights: true,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        THREE.UniformsLib.lights,
        {
          normalSampler: { value: null },
          mirrorSampler: { value: null },
          time: { value: 0 },
          flow: { value: new THREE.Vector2() },
          size: { value: 1 },
          distortionScale: { value: 3 },
          textureMatrix: { value: new THREE.Matrix4() },
          sunColor: { value: new THREE.Color() },
          sunDirection: { value: new THREE.Vector3() },
          eye: { value: new THREE.Vector3() },
          waterColor: { value: new THREE.Color() },
        },
      ]),
      vertexShader: /* glsl */ `
        uniform mat4 textureMatrix;
        varying vec4 mirrorCoord;
        varying vec4 worldPosition;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          mirrorCoord = modelMatrix * vec4(position, 1.0);
          worldPosition = mirrorCoord.xyzw;
          mirrorCoord = textureMatrix * mirrorCoord;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D mirrorSampler;
        uniform float time;
        uniform vec2 flow;
        uniform float size;
        uniform float distortionScale;
        uniform sampler2D normalSampler;
        uniform vec3 sunColor;
        uniform vec3 sunDirection;
        uniform vec3 eye;
        uniform vec3 waterColor;
        varying vec4 mirrorCoord;
        varying vec4 worldPosition;

        vec4 getNoise(vec2 uv) {
          vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);
          vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);
          vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);
          vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);
          vec4 noise = texture2D(normalSampler, uv0) + texture2D(normalSampler, uv1) +
            texture2D(normalSampler, uv2) + texture2D(normalSampler, uv3);
          return noise * 0.5 - 1.0;
        }

        #include <common>
        #include <fog_pars_fragment>

        void main() {
          vec4 noise = getNoise((worldPosition.xz + flow) * size);
          // Wind chop: tilt the normals harder than upstream's calm-water default.
          vec3 n = normalize(noise.xzy * vec3(2.4, 1.0, 2.4));

          vec3 toEye = eye - worldPosition.xyz;
          float dist = length(toEye);
          vec3 e = toEye / dist;

          // Overcast: a broad, soft sheen rather than a hard sun glint.
          vec3 r = normalize(reflect(-sunDirection, n));
          float d = max(0.0, dot(e, r));
          vec3 spec = sunColor * (pow(d, 60.0) * 0.9 + pow(d, 8.0) * 0.12);
          vec3 diffuse = sunColor * max(dot(sunDirection, n), 0.0) * 0.5;

          vec2 distortion = n.xz * (0.001 + 1.0 / dist) * distortionScale;
          vec3 refl = texture2D(mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion).rgb;

          float theta = max(dot(e, n), 0.0);
          float rf0 = 0.02; // water's real reflectance looking straight down
          float reflectance = rf0 + (1.0 - rf0) * pow(1.0 - theta, 5.0);
          vec3 scatter = max(0.0, dot(n, e)) * waterColor;
          // Rough open water scatters much of the mirror image; keep it dim.
          vec3 col = mix(diffuse * 0.25 + scatter, vec3(0.03) + refl * 0.62 + refl * spec, reflectance);

          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    })

    super(geometry, material)
    this.target = target
    this.rotation.x = -Math.PI / 2

    const u = material.uniforms
    u.mirrorSampler.value = target.texture
    u.textureMatrix.value = textureMatrix
    u.normalSampler.value = opts.normals
    u.sunColor.value = new THREE.Color(opts.sunColor)
    u.waterColor.value = new THREE.Color(opts.waterColor)
    u.sunDirection.value = opts.sunDirection
    u.distortionScale.value = opts.distortionScale
    u.size.value = opts.size
    u.eye.value = eye

    // Mirror pass, straight from upstream: reflect the camera in the plane,
    // clip everything below the surface with an oblique near plane, render.
    const mirrorPlane = new THREE.Plane()
    const normal = new THREE.Vector3()
    const mirrorWorld = new THREE.Vector3()
    const cameraWorld = new THREE.Vector3()
    const rotation = new THREE.Matrix4()
    const lookAt = new THREE.Vector3()
    const clipPlane = new THREE.Vector4()
    const view = new THREE.Vector3()
    const tgt = new THREE.Vector3()
    const q = new THREE.Vector4()
    const mirrorCamera = new THREE.PerspectiveCamera()

    this.onBeforeRender = (renderer, scene, camera) => {
      mirrorWorld.setFromMatrixPosition(this.matrixWorld)
      cameraWorld.setFromMatrixPosition(camera.matrixWorld)
      rotation.extractRotation(this.matrixWorld)
      normal.set(0, 0, 1).applyMatrix4(rotation)
      view.subVectors(mirrorWorld, cameraWorld)
      if (view.dot(normal) > 0) return
      view.reflect(normal).negate().add(mirrorWorld)

      rotation.extractRotation(camera.matrixWorld)
      lookAt.set(0, 0, -1).applyMatrix4(rotation).add(cameraWorld)
      tgt.subVectors(mirrorWorld, lookAt).reflect(normal).negate().add(mirrorWorld)

      mirrorCamera.position.copy(view)
      mirrorCamera.up.set(0, 1, 0).applyMatrix4(rotation).reflect(normal)
      mirrorCamera.lookAt(tgt)
      mirrorCamera.far = (camera as THREE.PerspectiveCamera).far
      mirrorCamera.updateMatrixWorld()
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix)

      textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
      textureMatrix.multiply(mirrorCamera.projectionMatrix)
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse)

      mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorld)
      mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse)
      clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant)
      const pm = mirrorCamera.projectionMatrix.elements
      q.x = (Math.sign(clipPlane.x) + pm[8]) / pm[0]
      q.y = (Math.sign(clipPlane.y) + pm[9]) / pm[5]
      q.z = -1
      q.w = (1 + pm[10]) / pm[14]
      clipPlane.multiplyScalar(2 / clipPlane.dot(q))
      pm[2] = clipPlane.x
      pm[6] = clipPlane.y
      pm[10] = clipPlane.z + 1
      pm[14] = clipPlane.w

      eye.setFromMatrixPosition(camera.matrixWorld)

      const current = renderer.getRenderTarget()
      this.visible = false
      renderer.setRenderTarget(target)
      renderer.state.buffers.depth.setMask(true)
      if (renderer.autoClear === false) renderer.clear()
      renderer.render(scene, mirrorCamera)
      this.visible = true
      renderer.setRenderTarget(current)
    }
  }

  /** Keep the mirror sharp enough without paying for full resolution. */
  setMirrorSize(w: number, h: number) {
    this.target.setSize(Math.max(256, Math.round(w)), Math.max(256, Math.round(h)))
  }

  update(time: number, flow: THREE.Vector2) {
    this.material.uniforms.time.value = time
    this.material.uniforms.flow.value.copy(flow)
  }
}
