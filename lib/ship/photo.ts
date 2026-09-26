import * as THREE from 'three'
import { HAZE, NOISE_GLSL } from './sea'

/**
 * The ship is a photograph, cut out of its background and lifted into relief.
 *
 * A depth map of the photo (estimated offline with Depth Anything V2) pushes
 * every pixel forward or back: the stern comes toward the viewer and the hull
 * curves away to the bow, so the camera can swing round the real ship and
 * see it turn in true perspective. A photo only has one side, so the swing
 * stays within about 25 degrees either way of the angle it was taken from.
 */

/** Cut-out size in pixels (public/images/ship/ship.webp). */
const IMG_W = 1750
const IMG_H = 860
/** Metres per pixel: puts the ship at roughly 280 m overall. */
const M_PER_PX = 0.16
/** Pixel row, from the top of the cut-out, where the stern meets the water. */
const WATERLINE_PX = 850
/** Extra canvas below the image; it lies flat on the sea as the foam skirt. */
const PAD = 0.08
/** Stern-to-bow depth of the relief, metres (a ~340 m hull seen at ~35 degrees). */
export const RELIEF = 170

export const SHIP_W = IMG_W * M_PER_PX
export const SHIP_H = IMG_H * M_PER_PX

/**
 * Bottom edge of the hull in each of 128 columns, as a fraction of the image
 * height from the top (1 = no hull in that column). Measured from the
 * cut-out's alpha so foam can hug the real waterline.
 */
const EDGE = [
  1.0, 0.7977, 0.8186, 0.8337, 0.8477, 0.8593, 0.8698, 0.8802, 0.8895, 0.8977, 0.9058, 0.914,
  0.9221, 0.9326, 0.943, 0.9535, 0.9651, 0.9767, 0.986, 0.9907, 0.9942, 0.9953, 0.9942, 0.993,
  0.9907, 0.9907, 0.9895, 0.9872, 0.986, 0.9849, 0.986, 0.986, 0.9849, 0.9872, 0.9872, 0.986,
  0.986, 0.9884, 0.9884, 0.9895, 0.9895, 0.9907, 0.9919, 0.9919, 0.9907, 0.9907, 0.9919, 0.9907,
  0.9907, 0.9895, 0.9872, 0.986, 0.9849, 0.9837, 0.9826, 0.9802, 0.9791, 0.9779, 0.9767, 0.9756,
  0.9744, 0.9721, 0.9698, 0.9674, 0.9663, 0.9651, 0.964, 0.964, 0.9628, 0.9616, 0.9616, 0.9593,
  0.9581, 0.957, 0.9547, 0.9535, 0.9523, 0.9512, 0.95, 0.9488, 0.9488, 0.9465, 0.9453, 0.9442,
  0.943, 0.943, 0.9407, 0.9395, 0.9384, 0.936, 0.936, 0.9349, 0.9337, 0.9314, 0.9302, 0.9291,
  0.9279, 0.9267, 0.9256, 0.9256, 0.9244, 0.9233, 0.9233, 0.9221, 0.9209, 0.9209, 0.9198,
  0.9186, 0.9174, 0.9163, 0.9163, 0.914, 0.914, 0.9128, 0.9116, 0.9116, 0.9105, 0.8895, 0.8651,
  0.8442, 0.8256, 0.8058, 0.7872, 0.7709, 0.7547, 0.7372, 0.714, 1.0,
]

/** Ship-frame anchor points (x across the frame, z toward the camera), metres. */
export const STERN = new THREE.Vector2((200 - IMG_W / 2) * M_PER_PX, 3)
export const BOW = new THREE.Vector2((1640 - IMG_W / 2) * M_PER_PX, 2)
/** Direction she is making way: off to the right and away from the camera. */
export const HEADING = new THREE.Vector3(0.55, 0, -0.84).normalize()

/** Point on the photo, in ship-frame metres, from pixel coordinates in the cut-out. */
export function photoPoint(px: number, py: number) {
  return new THREE.Vector3((px - IMG_W / 2) * M_PER_PX, (WATERLINE_PX - py) * M_PER_PX, 0)
}

function edgeTexture() {
  const data = new Uint8Array(EDGE.length * 4)
  EDGE.forEach((e, i) => {
    const v = Math.round(e * 255)
    data.set([v, v, v, 255], i * 4)
  })
  const tex = new THREE.DataTexture(data, EDGE.length, 1)
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

export function buildPhotoShip(map: THREE.Texture, depth: THREE.Texture) {
  const uniforms = {
    uMap: { value: map },
    uDepth: { value: depth },
    uEdge: { value: edgeTexture() },
    uTime: { value: 0 },
    uFlowX: { value: 0 },
    uHaze: { value: 0 },
    uHazeCol: { value: HAZE },
    uPad: { value: PAD / (1 + PAD) },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform sampler2D uDepth;
      uniform float uPad;
      varying vec2 vUv;

      // The hull's waterline in the photo, as a fraction of image height from
      // the top. It slopes because the bow is further from the lens; a straight
      // fit to the measured edge, ignoring the stern counter and bow flare.
      float waterline(float u) {
        return 0.994 - 0.1114 * (clamp(u, 0.16, 0.96) - 0.16);
      }

      void main() {
        vUv = uv;
        vec2 tuv = vec2(uv.x, (uv.y - uPad) / (1.0 - uPad));
        float fromTop = 1.0 - tuv.y;
        float wl = waterline(uv.x);
        vec3 p = position;

        // Relief: nearer parts of the ship come toward the viewer.
        float d = texture2D(uDepth, clamp(vec2(tuv.x, min(tuv.y, 1.0)), 0.0, 1.0)).r;
        p.z = (d - 0.5) * ${RELIEF.toFixed(1)};

        // Drop each column so the hull sits on the sea along its whole length.
        p.y -= (${WATERLINE_PX.toFixed(1)} - wl * ${IMG_H.toFixed(1)}) * ${M_PER_PX};

        // Below the waterline the canvas folds forward flat onto the water,
        // becoming the skirt the foam is drawn on.
        if (fromTop > wl) {
          float under = (fromTop - wl) * ${(IMG_H * M_PER_PX).toFixed(1)};
          p.y = 0.08;
          p.z += under * 1.6;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D uMap;
      uniform sampler2D uEdge;
      uniform float uTime;
      uniform float uFlowX;
      uniform float uHaze;
      uniform vec3 uHazeCol;
      uniform float uPad;
      ${NOISE_GLSL}

      vec4 sampleShip(vec2 uv) {
        if (uv.y < 0.0 || uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0) return vec4(0.0);
        return texture2D(uMap, uv);
      }

      void main() {
        vec2 uv = vec2(vUv.x, (vUv.y - uPad) / (1.0 - uPad));
        vec4 c = sampleShip(uv);
        // Grade toward the overcast: a touch cooler, a touch less contrast.
        c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.3, 0.59, 0.11))), 0.08);
        c.rgb = pow(c.rgb, vec3(1.05)) * vec3(0.93, 0.96, 1.0);

        // White water churning along the waterline.
        float e = texture2D(uEdge, vec2(vUv.x, 0.5)).r;
        float fromTop = 1.0 - uv.y;
        float below = fromTop - e;
        if (e > 0.9 && e < 0.999) {
          float band = (1.0 - smoothstep(0.0, 0.06, below)) * smoothstep(-0.012, 0.0, below);
          float n = fbm(vec2(vUv.x * 160.0 + uFlowX * 0.25, fromTop * 55.0 - uTime * 0.9));
          float foam = band * smoothstep(0.34, 0.7, n);
          c.rgb = mix(c.rgb, vec3(0.88, 0.92, 0.94), foam * (1.0 - c.a));
          c.a = max(c.a, foam * 0.9);
        }
        if (c.a < 0.02) discard;
        c.rgb = mix(c.rgb, uHazeCol, uHaze);
        gl_FragColor = c;
        #include <colorspace_fragment>
      }
    `,
  })

  const h = SHIP_H * (1 + PAD)
  // Dense enough that the relief follows the stacks and the hull's curve.
  const geo = new THREE.PlaneGeometry(SHIP_W, h, 360, 190)
  // Texture top sits at the photo's top; the padding hangs below the keel.
  const top = WATERLINE_PX * M_PER_PX
  geo.translate(0, top - h / 2, 0)

  const hull = new THREE.Mesh(geo, material)
  hull.renderOrder = 3
  hull.frustumCulled = false

  const set = (key: 'uTime' | 'uFlowX' | 'uHaze', v: number) => (uniforms[key].value = v)

  return { hull, set }
}
