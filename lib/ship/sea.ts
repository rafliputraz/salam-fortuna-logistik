import * as THREE from 'three'

/**
 * Sky, sea and wake, lit to match the ship photograph: a low overcast, the
 * light coming broad and soft from high on the left, no hard sun.
 */
export const SUN_DIR = new THREE.Vector3(-0.35, 0.55, -0.75).normalize()

/** Horizon haze, shared with the ship's aerial perspective as she sails off. */
export const HAZE = new THREE.Color('#7f8a93')

export const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return v;
  }
`

const SKY_GLSL = /* glsl */ `
  uniform vec3 uSunDir;

  vec3 skyColor(vec3 d) {
    float y = clamp(d.y, -0.2, 1.0);
    vec3 horizon = vec3(0.56, 0.60, 0.64);
    vec3 mid = vec3(0.33, 0.38, 0.44);
    vec3 zenith = vec3(0.10, 0.13, 0.18);
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.22, y));
    col = mix(col, zenith, smoothstep(0.2, 0.85, y));
    // Where the overcast thins toward the light.
    float s = max(dot(normalize(d), uSunDir), 0.0);
    col += vec3(0.30, 0.30, 0.28) * pow(s, 6.0);
    return col;
  }
`

export function buildSky() {
  const uniforms = { uSunDir: { value: SUN_DIR }, uTime: { value: 0 } }
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform float uTime;
      ${SKY_GLSL}
      ${NOISE_GLSL}
      void main() {
        vec3 d = normalize(vDir);
        vec3 col = skyColor(d);
        if (d.y > 0.0) {
          // Cloud deck projected onto a plane overhead, drifting slowly.
          vec2 uv = d.xz / (d.y + 0.12) * 0.85 + vec2(uTime * 0.006, uTime * 0.002);
          float c = fbm(uv * 1.3);
          float c2 = fbm(uv * 3.2 + 7.0);
          float cover = smoothstep(0.32, 0.72, c * 0.75 + c2 * 0.35);
          vec3 lit = vec3(0.80, 0.82, 0.84);
          vec3 dark = vec3(0.26, 0.30, 0.35);
          vec3 cloud = mix(lit, dark, smoothstep(0.35, 0.85, c2 + (1.0 - c) * 0.4));
          col = mix(col, cloud, cover * smoothstep(0.0, 0.1, d.y) * 0.92);
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), mat)
  sky.frustumCulled = false
  sky.renderOrder = -1
  return { sky, uniforms }
}

export function buildWater() {
  const uniforms = {
    uTime: { value: 0 },
    uFlow: { value: new THREE.Vector2() },
    uSunDir: { value: SUN_DIR },
    uDeep: { value: new THREE.Color('#1d2b33') },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform float uTime;
      uniform vec2 uFlow;
      uniform vec3 uDeep;
      ${SKY_GLSL}
      ${NOISE_GLSL}

      // Sum of directional waves, returned as the surface gradient.
      vec2 waves(vec2 p, float t) {
        vec2 g = vec2(0.0);
        for (int i = 0; i < 9; i++) {
          float fi = float(i);
          float ang = fi * 2.399 + 0.4;
          vec2 dir = normalize(vec2(cos(ang), sin(ang) * 0.7 - 0.3));
          float k = 0.05 * pow(1.55, fi);
          float amp = 0.9 / pow(1.6, fi);
          float speed = sqrt(9.8 / k) * 0.35;
          g += dir * cos(dot(dir, p) * k + t * speed * k) * amp * k;
        }
        return g;
      }

      void main() {
        vec2 p = vWorld.xz + uFlow;
        vec3 toCam = cameraPosition - vWorld;
        float dist = length(toCam);
        vec3 v = toCam / dist;

        float fade = 1.0 / (1.0 + dist * 0.0025);
        vec2 g = waves(p, uTime) * (0.5 + 0.5 * fade);
        float r = fbm(p * 0.12 + uTime * 0.06);
        float r2 = fbm(p * 0.12 + vec2(3.1, 7.7) + uTime * 0.06);
        g += (vec2(r, r2) - 0.5) * 0.45 * fade;
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));

        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
        vec3 rd = reflect(-v, n);
        rd.y = abs(rd.y);
        vec3 refl = skyColor(rd);

        vec3 body = uDeep * (0.75 + 0.35 * max(dot(n, uSunDir), 0.0));
        vec3 col = mix(body, refl, fres);
        // Wind-roughened glints under the bright patch of cloud.
        float spec = pow(max(dot(n, normalize(uSunDir + v)), 0.0), 160.0);
        col += vec3(0.5) * spec;

        vec3 flatV = normalize(vec3(-v.x, 0.02, -v.z));
        float haze = 1.0 - exp(-dist * 0.00055);
        col = mix(col, skyColor(flatV), clamp(haze, 0.0, 1.0));

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const geo = new THREE.PlaneGeometry(16000, 16000, 1, 1)
  geo.rotateX(-Math.PI / 2)
  return { water: new THREE.Mesh(geo, mat), uniforms }
}

/**
 * White water on the surface: the propeller wash streaming back from the
 * stern and the bow wave peeling off the stem. Built in the ship's own frame
 * so it travels with her; the noise is sampled in sea coordinates so the
 * foam itself stays put on the water while she moves through it.
 */
export function buildWake(opts: {
  stern: THREE.Vector2
  sternDir: THREE.Vector2
  bow: THREE.Vector2
  bowDir: THREE.Vector2
}) {
  const uniforms = {
    uFlow: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uStern: { value: opts.stern },
    uSternDir: { value: opts.sternDir.clone().normalize() },
    uBow: { value: opts.bow },
    uBowDir: { value: opts.bowDir.clone().normalize() },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vLocal;
      void main() {
        vLocal = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vLocal;
      uniform vec2 uFlow;
      uniform float uTime;
      uniform vec2 uStern;
      uniform vec2 uSternDir;
      uniform vec2 uBow;
      uniform vec2 uBowDir;
      ${NOISE_GLSL}

      float trail(vec2 rel, vec2 dir, float w0, float grow, float decay, float n) {
        float along = dot(rel, dir);
        float across = dot(rel, vec2(-dir.y, dir.x));
        if (along < -4.0) return 0.0;
        float a = max(along, 0.0);
        float w = w0 + a * grow;
        float q = across / w;
        float core = exp(-q * q) * exp(-a * decay);
        return core * smoothstep(-4.0, 6.0, along) * smoothstep(0.22, 0.62, n);
      }

      void main() {
        vec2 wp = vLocal + uFlow;
        float n = fbm(wp * 0.16 + uTime * 0.12);
        float n2 = fbm(wp * 0.45 - uTime * 0.2);
        float nn = n * 0.65 + n2 * 0.45;
        float foam = trail(vLocal - uStern, uSternDir, 20.0, 0.3, 0.0026, nn);
        foam += 0.8 * trail(vLocal - uBow, uBowDir, 8.0, 0.35, 0.01, nn);
        foam = clamp(foam, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.93, 0.96, 0.97) * (0.85 + 0.15 * n2), foam);
        #include <colorspace_fragment>
      }
    `,
  })
  const geo = new THREE.PlaneGeometry(1400, 1400, 1, 1)
  geo.rotateX(-Math.PI / 2)
  const wake = new THREE.Mesh(geo, mat)
  wake.position.y = 0.12
  wake.renderOrder = 1
  return { wake, uniforms }
}
