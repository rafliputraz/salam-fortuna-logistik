import * as THREE from 'three'
import { HULL } from './model'

/**
 * Low sun astern of the ship, just over the horizon. Everything that reflects
 * or glows keys off this one direction, so the light stays consistent as the
 * camera travels round the vessel.
 */
export const SUN_DIR = new THREE.Vector3(0.32, 0.075, -1).normalize()

/** Horizon haze colour, shared with the scene fog so the ship sits in the air. */
export const HAZE = new THREE.Color('#8d8f97')

const SKY_GLSL = /* glsl */ `
  uniform vec3 uSunDir;

  vec3 skyColor(vec3 d) {
    float y = clamp(d.y, -0.2, 1.0);
    vec3 zenith = vec3(0.020, 0.045, 0.090);
    vec3 mid = vec3(0.105, 0.180, 0.285);
    vec3 horizonCool = vec3(0.260, 0.300, 0.370);
    vec3 horizonWarm = vec3(1.050, 0.560, 0.300);
    vec2 flatS = normalize(uSunDir.xz);
    // Looking straight up or down there is no horizon bearing to speak of.
    float lxz = length(d.xz);
    vec2 flatD = lxz > 1e-3 ? d.xz / lxz : flatS;
    float toward = max(dot(flatD, flatS), 0.0);
    vec3 horizon = mix(horizonCool, horizonWarm, pow(toward, 4.0));
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.22, y));
    col = mix(col, zenith, smoothstep(0.18, 0.75, y));
    float s = max(dot(normalize(d), uSunDir), 0.0);
    col += vec3(1.0, 0.50, 0.24) * pow(s, 10.0) * 0.55;
    col += vec3(1.0, 0.78, 0.52) * pow(s, 120.0) * 0.9;
    col += vec3(1.0, 0.86, 0.62) * smoothstep(0.99975, 0.99992, s) * 3.0;
    return col;
  }
`

const NOISE_GLSL = /* glsl */ `
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
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return v;
  }
`

export function buildSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uSunDir: { value: SUN_DIR } },
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
      ${SKY_GLSL}
      void main() {
        gl_FragColor = vec4(skyColor(normalize(vDir)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), mat)
  sky.frustumCulled = false
  sky.renderOrder = -1
  return sky
}

/** GLSL twin of `halfBreadth` in model.ts, at the waterline. */
const HULL_GLSL = /* glsl */ `
  float hullHalf(float z) {
    float u = (z + ${(HULL.length / 2).toFixed(1)}) / ${HULL.length.toFixed(1)};
    float yn = ${(-HULL.keel / (HULL.deck - HULL.keel)).toFixed(4)};
    if (u < 0.0 || u > 1.0) return -1.0;
    float w = 1.0;
    if (u > 0.76) {
      float t = (u - 0.76) / 0.24;
      w = sqrt(max(0.0, 1.0 - t * t));
      w *= 1.0 - 0.5 * t * pow(1.0 - yn, 1.2);
    }
    if (u < 0.13) {
      float t = (0.13 - u) / 0.13;
      w *= 1.0 - 0.62 * t * pow(1.0 - yn, 1.6);
    }
    return w * ${(HULL.beam / 2).toFixed(1)};
  }
`

/**
 * The white water: the turbulent strip astern, and the bow
 * wave and side wash along the hull. Drawn as one transparent sheet laid a
 * hair above the sea so it reads as foam on the surface, not paint on glass.
 */
export function buildFoam() {
  const uniforms = { uFlow: { value: 0 }, uTime: { value: 0 } }
  const stern = -HULL.length / 2
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      uniform float uFlow;
      uniform float uTime;
      ${NOISE_GLSL}
      ${HULL_GLSL}

      void main() {
        float x = vPos.x;
        float z = vPos.z;
        vec2 wp = vec2(x, z + uFlow);
        float n = fbm(wp * 0.11 + uTime * 0.15);
        float n2 = fbm(wp * 0.35 - uTime * 0.2);
        float foam = 0.0;

        // Astern: the turbulent propeller wash, widening as it falls behind.
        float a = ${stern.toFixed(1)} - z;
        if (a > -6.0) {
          float along = max(a, 0.0);
          float cw = 16.0 + along * 0.075;
          float qx = x / cw;
          float core = exp(-qx * qx) * exp(-along * 0.0024);
          foam += core * smoothstep(0.34, 0.78, n * 0.7 + n2 * 0.5) * (0.35 + 0.65 * n2) * exp(-along * 0.0015);
          foam *= smoothstep(-6.0, 4.0, a);
        }

        // Alongside: wash hugging the hull, heaviest at the bow.
        float hw = hullHalf(z);
        if (hw > 0.0) {
          float d = abs(x) - hw;
          float u = (z - ${stern.toFixed(1)}) / ${HULL.length.toFixed(1)};
          float bow = smoothstep(0.62, 0.98, u);
          float band = 5.0 + bow * 9.0;
          float edge = (1.0 - smoothstep(0.0, band, d)) * step(-0.5, d);
          foam += edge * smoothstep(0.25, 0.7, n2 * 0.6 + n * 0.5) * (0.35 + 0.9 * bow);
        }
        // Bow wave rolling ahead and out from the stem.
        float ahead = z - ${(HULL.length / 2).toFixed(1)};
        if (ahead > -30.0 && ahead < 22.0) {
          float spread = 26.0 - ahead * 0.4;
          float qr = (abs(x) - (ahead + 30.0) * 0.45) / 4.0;
          float ring = exp(-qr * qr);
          foam += ring * smoothstep(0.3, 0.75, n2) * 0.7 * smoothstep(22.0, 0.0, ahead) * step(abs(x), spread);
        }

        foam = clamp(foam, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.86, 0.9, 0.92) * (0.75 + 0.25 * n), foam * 0.7);
        #include <colorspace_fragment>
      }
    `,
  })
  const length = 1500
  const geo = new THREE.PlaneGeometry(900, length, 1, 1)
  geo.rotateX(-Math.PI / 2)
  // From just ahead of the bow to far astern.
  geo.translate(0, 0, HULL.length / 2 + 40 - length / 2)
  const foam = new THREE.Mesh(geo, mat)
  foam.position.y = 0.12
  foam.renderOrder = 2
  return { foam, uniforms }
}
