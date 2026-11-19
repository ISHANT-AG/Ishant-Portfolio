import * as THREE from 'three';
import gsap from 'gsap';
import { galleryCategories } from './galleryData';
import {
  createCategoryTextureBundle,
  createWordmarkTexture,
  type CategoryTextureBundle,
} from './textures';

export type SceneMode =
  | 'entering'
  | 'ringIdle'
  | 'categoryTransition'
  | 'categoryGallery'
  | 'itemZoom'
  | 'returning';

export type SceneCallbacks = {
  onActiveCategoryChange: (index: number) => void;
  onCategoryOpenRequest: (index: number) => void;
  onHoverFrontPanel: (hovering: boolean, clientX: number, clientY: number) => void;
  onThumbReady: (index: number, thumbUrl: string) => void;
  onTitleProgress: (progress: number) => void;
  onPointerParallax: (nx: number, ny: number) => void;
  onContinuousStep: (continuousStep: number) => void;
  onTransitionComplete: (to: 'ringIdle' | 'categoryGallery') => void;
  onLoadingProgress?: (progress: number) => void;
  onDockProgress?: (progress: number) => void;
};

// Calibrated desktop geometry: ~590 px wide x 335 px high in 1280x720
const RADIUS = 2.40;
const HEIGHT = 2.05;
const PANEL_COUNT = galleryCategories.length; // 3
const SPAN = (Math.PI * 2) / PANEL_COUNT;
const GAP = 0.082; // gives broad readable front face + narrow glimpses of neighboring panels
const PANEL_ARC = SPAN - GAP;
const FLAT_WIDTH = PANEL_ARC * RADIUS * 0.92;
const FLAT_HEIGHT = HEIGHT * 1.04;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// --- ISHANT Wordmark with Localized Liquid Wave Displacement ---
const WORDMARK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WORDMARK_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uAspect;
  uniform vec2 uTrail[6];
  uniform vec2 uTrailVel[6];
  uniform float uTrailWeight[6];
  uniform float uTime;
  uniform float uReducedMotion;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    if (uReducedMotion < 0.5) {
      vec2 totalDisp = vec2(0.0);

      // 1. Direct active cursor fluid impulse with aspect-ratio correction
      vec2 dCur = uv - uPointer;
      dCur.x *= uAspect;
      float distCur2 = dot(dCur, dCur);
      float sigma2 = uRadius * uRadius;
      float gaussianCur = exp(-distCur2 / sigma2);

      float speed = length(uVelocity);
      if (speed > 0.001) {
        vec2 velNorm = normalize(uVelocity);
        
        // Forward momentum advection (push in direction of sweep)
        vec2 forwardPush = velNorm * (gaussianCur * uStrength * clamp(speed * 0.42, 0.14, 1.25));
        
        // Dipole curl vorticity: perpendicular swirling eddies on flanks of stroke
        vec2 perp = vec2(-dCur.y, dCur.x);
        float crossProd = (velNorm.x * dCur.y - velNorm.y * dCur.x);
        vec2 curlEddy = perp * crossProd * gaussianCur * uStrength * 2.4;

        totalDisp += forwardPush + curlEddy;
      }

      // 2. Trailing history fluid wake (Navier-Stokes vortex street relaxation)
      for (int i = 0; i < 6; i++) {
        if (uTrailWeight[i] > 0.001) {
          vec2 dTr = uv - uTrail[i];
          dTr.x *= uAspect;
          float distTr = length(dTr);
          float trGaussian = exp(-distTr * distTr / (sigma2 * 1.45));

          vec2 trVel = uTrailVel[i];
          float trSpeed = length(trVel);
          vec2 trNorm = trSpeed > 0.001 ? normalize(trVel) : vec2(0.0, 1.0);

          // Oscillatory wake wave that ripples outward and settles
          float wave = sin(distTr * 30.0 - float(i) * 0.85) * exp(-distTr * 5.5);
          vec2 wakeDisp = (trNorm * 0.65 + normalize(dTr + vec2(0.0001)) * 0.35) * wave;

          totalDisp += (trNorm * trGaussian * 0.45 + wakeDisp) * (uTrailWeight[i] * uStrength * clamp(trSpeed * 0.35, 0.1, 1.0));
        }
      }

      uv -= totalDisp;
    }

    vec4 tex = texture2D(uMap, uv);
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Photographic Artwork Surface ---
const PANEL_VERT = /* glsl */ `
  uniform float uRadius;
  uniform float uBreath;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec2 vScreenUv;

  void main() {
    vUv = uv;
    float a = atan(position.x, position.z);
    vec3 curved = position;
    curved.y += sin(a * 1.6 + uBreath) * 0.008;
    vec3 cylNormal = normalize(vec3(position.x, 0.0, position.z));
    vViewNormal = normalize(normalMatrix * cylNormal);
    vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(curved, 1.0);
    vScreenUv = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
    gl_Position = clipPos;
  }
`;

const PANEL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uDesat;
  uniform float uWrapLight;
  uniform float uVel;
  uniform vec2 uMouseUv;
  uniform float uMouseActive;
  uniform vec2 uResolution;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec2 vScreenUv;

  void main() {
    float shift = clamp(uVel * 0.0035, -0.006, 0.006);
    float r = texture2D(uMap, vec2(clamp(vUv.x + shift, 0.0, 1.0), vUv.y)).r;
    vec4 center = texture2D(uMap, vUv);
    float b = texture2D(uMap, vec2(clamp(vUv.x - shift, 0.0, 1.0), vUv.y)).b;
    vec3 rgb = vec3(r, center.g, b);

    float facing = clamp(abs(vViewNormal.z), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.2);
    float topLight = smoothstep(0.0, 1.0, vUv.y) * 0.04;
    
    vec3 lit = rgb * (0.95 + 0.07 * facing + topLight) + vec3(0.045) * rim * uWrapLight;

    // Interactive cursor proximity light lift on artwork
    if (uMouseActive > 0.001) {
      vec2 screenPx = vScreenUv * uResolution;
      vec2 mousePx = uMouseUv * uResolution;
      float mouseDist = length(screenPx - mousePx);
      float mouseT = clamp(1.0 - mouseDist / 260.0, 0.0, 1.0);
      float mouseInfluence = pow(mouseT, 2.2) * uMouseActive;
      lit += lit * mouseInfluence * 0.22 + vec3(0.04) * mouseInfluence;
    }

    vec3 col = mix(lit, vec3(0.988, 0.988, 0.985), uDesat);
    gl_FragColor = vec4(col, center.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Floating Category Lettering Decal ---
const LETTERING_DECAL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LETTERING_DECAL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Outer Glass Shell with Fresnel & Specular Glancing Highlight ---
const GLASS_OUTER_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying vec2 vScreenUv;

  void main() {
    vUv = uv;
    vec3 cylNormal = normalize(vec3(position.x, 0.0, position.z));
    vViewNormal = normalize(normalMatrix * cylNormal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vec4 clipPos = projectionMatrix * mvPosition;
    vScreenUv = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
    gl_Position = clipPos;
  }
`;

const GLASS_OUTER_FRAG = /* glsl */ `
  uniform vec3 uHighlightColor;
  uniform vec3 uEdgeColor;
  uniform float uOpacity;
  uniform float uVel;
  uniform float uTime;
  uniform vec2 uMouseUv;
  uniform float uMouseActive;
  uniform vec2 uResolution;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying vec2 vScreenUv;

  // 2D Cellular Voronoi generator
  vec2 voronoi2D(vec2 p) {
    vec2 g = floor(p);
    vec2 f = fract(p);
    float minDist = 8.0;
    float secondDist = 8.0;
    
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 lattice = vec2(float(x), float(y));
        vec2 cellSeed = g + lattice;
        vec2 offset = fract(sin(vec2(
          dot(cellSeed, vec2(127.1, 311.7)),
          dot(cellSeed, vec2(269.5, 183.3))
        )) * 43758.5453);
        offset = offset * 0.74 + 0.13;
        vec2 diff = lattice + offset - f;
        float d = dot(diff, diff);
        if (d < minDist) {
          secondDist = minDist;
          minDist = d;
        } else if (d < secondDist) {
          secondDist = d;
        }
      }
    }
    return vec2(sqrt(minDist), sqrt(secondDist) - sqrt(minDist));
  }

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDir = normalize(vViewPosition);

    float facing = clamp(abs(normal.z), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 2.4);

    vec3 lightDir = normalize(vec3(0.35, 0.75, 1.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float broadSpec = pow(max(dot(normal, halfDir), 0.0), 16.0) * 0.40;
    float sharpSpec = pow(max(dot(normal, halfDir), 0.0), 48.0) * 0.70;

    // Soft crystalline planar facet refraction & reflection matching reference
    vec2 cellCoord = vUv * vec2(6.8, 3.4);
    vec2 cellId = floor(cellCoord);
    float cellNoise = fract(sin(dot(cellId, vec2(127.1, 311.7))) * 43758.5453);
    vec3 facetNormal = normalize(normal + vec3((cellNoise - 0.5) * 0.16, (fract(cellNoise * 19.3) - 0.5) * 0.16, 0.0));
    float facetSpec = pow(max(dot(facetNormal, halfDir), 0.0), 22.0) * 0.38;
    float facetDiff = (dot(facetNormal, lightDir) * 0.5 + 0.5) * 0.10;

    vec2 vor = voronoi2D(cellCoord);
    float cellEdge = smoothstep(0.015, 0.07, vor.y);
    float facetGleamVal = (facetSpec + facetDiff) * cellEdge * (0.55 + 0.45 * (1.0 - facing));
    vec3 facetGleam = uHighlightColor * facetGleamVal;

    float edgeSheen = pow(abs(vUv.y - 0.5) * 2.0, 10.0) * 0.45;
    vec3 glassGleam = mix(uHighlightColor, uEdgeColor, 0.20) * (fresnel * 0.55 + broadSpec + sharpSpec + edgeSheen) + facetGleam;

    float alpha = clamp(
      fresnel * 0.38 + broadSpec * 0.35 + sharpSpec * 0.70 + edgeSheen * 0.45 + facetGleamVal * 0.40,
      0.0,
      0.88
    );

    // Dynamic cursor spotlight and dispersion prism flare on hover (matching aikawakenichi.com)
    if (uMouseActive > 0.001) {
      vec2 screenPx = vScreenUv * uResolution;
      vec2 mousePx = uMouseUv * uResolution;
      float mouseDist = length(screenPx - mousePx);
      float mouseRadius = 260.0;
      float mouseFalloff = 2.2;
      float mouseT = clamp(1.0 - mouseDist / mouseRadius, 0.0, 1.0);
      float mouseInfluence = pow(mouseT, mouseFalloff) * uMouseActive;

      if (mouseInfluence > 0.0001) {
        vec2 deltaUv = uMouseUv - vScreenUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        vec3 cursorLightDir = normalize(vec3(vec2(deltaUv.x * aspect, deltaUv.y) * 2.5, 0.65 + 0.35 * mouseInfluence));
        vec3 cursorHalfDir = normalize(cursorLightDir + viewDir);

        float cursorFacetSpec = pow(max(dot(facetNormal, cursorHalfDir), 0.0), 24.0) * 0.95;
        float cursorFacetDiff = (dot(facetNormal, cursorLightDir) * 0.5 + 0.5) * 0.25;

        // Chromatic spectral prism dispersion
        float prismPhase = vUv.x * 2.4 + vUv.y * 1.6 + mouseDist * 0.004;
        vec3 cBlue = vec3(0.45, 0.68, 1.00);
        vec3 cCyan = vec3(0.48, 0.94, 0.98);
        vec3 cViolet = vec3(0.72, 0.56, 0.96);
        vec3 cRose = vec3(0.96, 0.46, 0.60);
        float tPrism = fract(prismPhase);
        vec3 prismCol = mix(mix(cBlue, cCyan, smoothstep(0.0, 0.5, tPrism)), mix(cViolet, cRose, smoothstep(0.5, 1.0, tPrism)), 0.5);

        vec3 cursorGlow = (uHighlightColor * (cursorFacetSpec + cursorFacetDiff) + prismCol * 0.42) * mouseInfluence;
        glassGleam += cursorGlow;
        alpha = clamp(alpha + mouseInfluence * 0.50, 0.0, 0.95);
      }
    }

    gl_FragColor = vec4(glassGleam, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Inner Translucent Coloured Glass Wall ---
const INNER_WALL_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewNormal;

  void main() {
    vUv = uv;
    vec3 cylNormal = -normalize(vec3(position.x, 0.0, position.z));
    vViewNormal = normalize(normalMatrix * cylNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const INNER_WALL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vViewNormal;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float facing = clamp(abs(vViewNormal.z), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.0);
    vec3 body = mix(tex.rgb, uTint, 0.42) + uTint * rim * 0.25;
    gl_FragColor = vec4(body, clamp(tex.a * 0.78 + rim * 0.22, 0.0, 1.0) * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Cut End Caps (Glass Seams) ---
const CUT_EDGE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CUT_EDGE_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    gl_FragColor = vec4(tex.rgb, tex.a * 0.40 * uOpacity);
    #include <colorspace_fragment>
  }
`;

// --- Complete Mirrored Floor Reflection ---
const REFLECT_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    float dist = uv.y;
    vec3 pos = position;
    float wave = sin(dist * 12.0 + uTime * 1.05 + position.x * 0.5) * 0.007 * smoothstep(0.015, 0.70, dist);
    pos.x += wave;
    vec3 cylNormal = normalize(vec3(pos.x, 0.0, pos.z));
    vViewNormal = normalize(normalMatrix * cylNormal);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const REFLECT_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uLetteringMap;
  uniform sampler2D uInnerMap;
  uniform vec3 uTint;
  uniform vec3 uHighlightColor;
  uniform vec3 uEdgeColor;
  uniform float uOpacity;
  uniform float uStrength;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    float dist = vUv.y;
    vec2 uv = vUv;

    // Gentle wave displacement anchored at contact line (wave=0 at dist=0)
    float wave = sin(dist * 12.0 + uTime * 1.05 + uv.x * 3.5) * 0.007 * smoothstep(0.015, 0.70, dist);
    uv.x += wave;

    vec4 photo = texture2D(uMap, uv);
    vec4 text = texture2D(uLetteringMap, uv);
    vec4 inner = texture2D(uInnerMap, uv);

    // Composite photo + lettering decal
    vec3 base = mix(photo.rgb, text.rgb, text.a * 0.90);

    // Inner wall tint contribution near edges
    base = mix(base, uTint, inner.a * 0.12);

    // Glancing glass specular highlight in reflection
    vec3 normal = normalize(vViewNormal);
    vec3 viewDir = normalize(vViewPosition);
    float facing = clamp(abs(normal.z), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 2.2);
    vec3 lightDir = normalize(vec3(0.35, -0.75, 1.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float broadSpec = pow(max(dot(normal, halfDir), 0.0), 14.0) * 0.35;
    float sharpSpec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.55;
    vec3 glassGleam = mix(uHighlightColor, uEdgeColor, 0.25) * (fresnel * 0.35 + broadSpec + sharpSpec);
    base += glassGleam * 0.30;

    // Smooth natural distance fade into white canvas floor
    float fade = pow(clamp(1.0 - dist * 1.15, 0.0, 1.0), 1.7);
    gl_FragColor = vec4(base, fade * uStrength * uOpacity * 0.72);
    #include <colorspace_fragment>
  }
`;

// --- 3D Voronoi Shatter Field with Category Tint ---
const SHARD_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewNormal;

  void main() {
    vUv = uv;
    vec3 localNorm = normalize(vec3(position.x, 0.0, position.z + 2.40));
    vViewNormal = normalize(normalMatrix * localNorm);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHARD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform float uOpacity;
  uniform float uGloss;
  varying vec2 vUv;
  varying vec3 vViewNormal;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float glint = pow(1.0 - clamp(abs(vViewNormal.z), 0.0, 1.0), 1.8) * 0.42 + uGloss;
    vec3 col = mix(tex.rgb, uTint, 0.12);
    col = mix(col, vec3(1.0), clamp(glint, 0.0, 0.55));
    gl_FragColor = vec4(col, tex.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

const LOADER_ARC_VERT = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LOADER_ARC_FRAG = /* glsl */ `
  uniform float uProgress;
  uniform float uAlpha;
  varying vec2 vPos;
  void main() {
    // Clockwise sweep from top (0, 1):
    float angle = atan(vPos.x, vPos.y);
    if (angle < 0.0) angle += 6.28318530718;
    float norm = angle / 6.28318530718;

    if (norm > uProgress) discard;

    float tip = clamp((uProgress - norm) * 160.0, 0.0, 1.0);
    gl_FragColor = vec4(vec3(0.08), uAlpha * tip);
  }
`;

type Pt = [number, number];

function clipPolygonHalfPlane(poly: Pt[], px: number, py: number, nx: number, ny: number): Pt[] {
  if (poly.length === 0) return [];
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = (a[0] - px) * nx + (a[1] - py) * ny;
    const db = (b[0] - px) * nx + (b[1] - py) * ny;
    if (da <= 0) {
      out.push(a);
      if (db > 0) {
        const t = da / (da - db);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    } else if (db <= 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

type ShardUnit = {
  mesh: THREE.Mesh;
  curvedCentroid: THREE.Vector3;
  crackTarget: THREE.Vector3;
  burstTarget: THREE.Vector3;
  rotTarget: THREE.Euler;
  delay: number;
  driftPhase: number;
  parallaxWeight: number;
};

function buildContinuousVoronoiShards(
  material: THREE.ShaderMaterial,
  resources: { dispose: () => void }[],
): { group: THREE.Group; shards: ShardUnit[] } {
  const cols = 7;
  const rows = 5;
  const seeds: Pt[] = [];
  let s = 2718;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const hw = FLAT_WIDTH * 0.5;
  const hh = FLAT_HEIGHT * 0.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.18 + rand() * 0.64) / cols - 0.5) * FLAT_WIDTH;
      const y = ((r + 0.18 + rand() * 0.64) / rows - 0.5) * FLAT_HEIGHT;
      seeds.push([x, y]);
    }
  }

  const baseRect: Pt[] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];

  const group = new THREE.Group();
  group.visible = false;
  const shards: ShardUnit[] = [];

  for (let i = 0; i < seeds.length; i++) {
    const [sx, sy] = seeds[i];
    let poly = baseRect.slice();
    for (let j = 0; j < seeds.length; j++) {
      if (i === j) continue;
      const [ox, oy] = seeds[j];
      const mx = (sx + ox) * 0.5;
      const my = (sy + oy) * 0.5;
      const nx = ox - sx;
      const ny = oy - sy;
      poly = clipPolygonHalfPlane(poly, mx, my, nx, ny);
      if (poly.length < 3) break;
    }
    if (poly.length < 3) continue;

    let cx = 0;
    let cy = 0;
    for (const [px, py] of poly) {
      cx += px;
      cy += py;
    }
    cx /= poly.length;
    cy /= poly.length;

    // Centroid in UV space
    const cu = cx / (hw * 2) + 0.5;
    const cv = cy / (hh * 2) + 0.5;
    const cAngle = (cu - 0.5) * PANEL_ARC;

    // Curved centroid directly on the 3D cylindrical surface
    const curvedCentroid = new THREE.Vector3(
      Math.sin(cAngle) * RADIUS,
      (cv - 0.5) * HEIGHT,
      Math.cos(cAngle) * RADIUS,
    );

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let k = 0; k < poly.length; k++) {
      const [px, py] = poly[k];
      const u = px / (hw * 2) + 0.5;
      const v = py / (hh * 2) + 0.5;
      const angle = (u - 0.5) * PANEL_ARC;

      // Exact curved vertex on cylinder
      const vxCurved = Math.sin(angle) * RADIUS;
      const vyCurved = (v - 0.5) * HEIGHT;
      const vzCurved = Math.cos(angle) * RADIUS;

      // Store positions relative to curved centroid
      positions.push(
        vxCurved - curvedCentroid.x,
        vyCurved - curvedCentroid.y,
        vzCurved - curvedCentroid.z,
      );
      uvs.push(u, v);
    }

    for (let k = 1; k < poly.length - 1; k++) {
      indices.push(0, k, k + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    resources.push(geo);

    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);

    const radialNorm = Math.hypot(cx / hw, cy / hh);
    const sideSign = cx >= 0 ? 1 : -1;
    const crackAngle = Math.atan2(cy * 1.15, cx);

    // Crack phase: hairline crack seams open along the curved cylinder surface normal
    const crackTarget = new THREE.Vector3(
      curvedCentroid.x + Math.sin(cAngle) * (0.08 + radialNorm * 0.08),
      curvedCentroid.y + Math.sin(crackAngle) * 0.06,
      curvedCentroid.z + Math.cos(cAngle) * (0.08 + radialNorm * 0.08),
    );

    // Burst phase: fly out to perimeter crystalline frame to clear space for gallery
    const keepFrame = i % 3 !== 0;
    const burstX = sideSign * (keepFrame ? 2.95 + rand() * 1.35 : 4.2 + rand() * 1.5) + curvedCentroid.x * 0.35;
    const burstY = curvedCentroid.y * 2.2 + (rand() - 0.5) * 1.6;
    const burstZ = curvedCentroid.z + 0.6 + rand() * 1.8;

    shards.push({
      mesh,
      curvedCentroid,
      crackTarget,
      burstTarget: new THREE.Vector3(burstX, burstY, burstZ),
      rotTarget: new THREE.Euler(
        (rand() - 0.5) * 2.4,
        (rand() - 0.5) * 2.6,
        (rand() - 0.5) * 1.8,
      ),
      delay: Math.max(0, 0.12 - radialNorm * 0.08) + rand() * 0.04,
      driftPhase: rand() * Math.PI * 2,
      parallaxWeight: 0.10 + rand() * 0.16,
    });
  }

  return { group, shards };
}

export class RingScene {
  private host: HTMLElement;
  private cb: SceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private ringGroup: THREE.Group;
  private reflectGroup: THREE.Group;
  private shardGroup: THREE.Group;
  private shards: ShardUnit[] = [];
  private shardMat: THREE.ShaderMaterial;

  // ISHANT visual wordmark plane with localized liquid wave displacement
  private wordmarkMesh: THREE.Mesh | null = null;
  private wordmarkMat: THREE.ShaderMaterial | null = null;
  private wordmarkWidth = 9.75;
  private wordmarkHeight = 2.44;
  private currentWordmarkUv = new THREE.Vector2(-10, -10);
  private wordmarkVelocity = new THREE.Vector2(0, 0);
  private wordmarkTrail: THREE.Vector2[] = Array.from({ length: 6 }, () => new THREE.Vector2(-10, -10));
  private wordmarkTrailVel: THREE.Vector2[] = Array.from({ length: 6 }, () => new THREE.Vector2(0, 0));
  private wordmarkTrailWeights: number[] = Array.from({ length: 6 }, () => 0);
  private lastWordmarkTime = 0;
  private assetsReady = false;

  // Concentric glass cross-section layers
  private bundles: CategoryTextureBundle[] = [];
  private outerMeshes: THREE.Mesh[] = [];
  private outerMats: THREE.ShaderMaterial[] = [];
  private innerMats: THREE.ShaderMaterial[] = [];
  private letteringMeshes: THREE.Mesh[] = [];
  private letteringMats: THREE.ShaderMaterial[] = [];
  private glassOuterMeshes: THREE.Mesh[] = [];
  private glassOuterMats: THREE.ShaderMaterial[] = [];
  private edgeMats: THREE.ShaderMaterial[] = [];
  private reflectOuterMats: THREE.ShaderMaterial[] = [];
  private resources: { dispose: () => void }[] = [];

  private mode: SceneMode = 'entering';
  private motionEnabled = true;
  private disposed = false;
  private visible = false;
  private needsPaint = true;
  private rafId = 0;
  private lastTime = 0;
  private elapsed = 0;

  // Rotation & interaction physics
  public angle = -0.34;
  private prevAngle = 0;
  private smoothAngularVel = 0;
  public targetAngle = -0.34;
  public velocity = 0;
  private activeIndex = 0;
  private dragging = false;
  private pointerDownX = 0;
  private pointerLastX = 0;
  private pointerMoved = 0;
  private hoverCanvas = false;
  private hoverFront = false;
  private pointerNdcX = 0;
  private pointerNdcY = 0;
  private smoothNdcX = 0;
  private smoothNdcY = 0;
  private wheelSnapTimer = 0;

  // Interactive pointer spotlight and gyroscopic tilt (matching aikawakenichi.com)
  private mouseScreenUv = new THREE.Vector2(0.5, 0.5);
  private targetMouseActive = 0;
  private smoothMouseActive = 0;
  private mouseTiltTargetX = 0;
  private mouseTiltTargetY = 0;
  private mouseTiltTargetZ = 0;
  private mouseTiltCurrentX = 0;
  private mouseTiltCurrentY = 0;
  private mouseTiltCurrentZ = 0;

  // Animation values owned by GSAP timelines
  public entranceProgress = 0;
  public transitionProgress = 0;
  public burstProgress = 0;
  private entranceStarted = false;
  private transitionCategoryIndex = 0;
  private shardAmbientFade = 1;
  private lastTitleProgress = -1;
  private baseRingY = 0.05;
  private baseCamZ = 9.6;

  // Splash loader arc mesh and material
  private loaderArcMesh: THREE.Mesh | null = null;
  private loaderArcMat: THREE.ShaderMaterial | null = null;

  // Plain GSAP entrance state object
  private entranceState = {
    splashProgress: 0,
    ringAlpha: 0,
    pitch: Math.PI * 0.5,
    yaw: -Math.PI * 0.5,
    scale: 0.62,
    elevation: 0.0,
    titleProgress: 0,
    reflectProgress: 0,
    dockProgress: 0,
  };

  // GSAP Timelines
  private entranceTimeline: gsap.core.Timeline | null = null;
  private openTimeline: gsap.core.Timeline | null = null;
  private returnTimeline: gsap.core.Timeline | null = null;

  private raycaster = new THREE.Raycaster();
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(host: HTMLElement, motion: boolean, callbacks: SceneCallbacks) {
    this.host = host;
    this.motionEnabled = motion;
    this.cb = callbacks;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    this.camera.position.set(0, 0, 9.6);
    this.camera.lookAt(0, 0, 0);

    // 3D ISHANT Wordmark Plane behind ring carrying localized liquid wave displacement
    const wordmarkGeo = new THREE.PlaneGeometry(this.wordmarkWidth, this.wordmarkHeight, 64, 16);
    this.resources.push(wordmarkGeo);

    const wordmarkBundle = createWordmarkTexture();
    this.resources.push(wordmarkBundle);

    this.wordmarkMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: wordmarkBundle.texture },
        uPointer: { value: this.currentWordmarkUv },
        uVelocity: { value: this.wordmarkVelocity },
        uRadius: { value: 0.15 }, // ~one letter wide in UV space
        uStrength: { value: 0.052 }, // localized displacement amplitude
        uAspect: { value: this.wordmarkWidth / this.wordmarkHeight }, // circular aspect correction
        uTrail: { value: this.wordmarkTrail },
        uTrailVel: { value: this.wordmarkTrailVel },
        uTrailWeight: { value: this.wordmarkTrailWeights },
        uTime: { value: 0 },
        uReducedMotion: { value: this.motionEnabled ? 0.0 : 1.0 },
        uOpacity: { value: 0 },
      },
      vertexShader: WORDMARK_VERT,
      fragmentShader: WORDMARK_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide,
    });
    this.resources.push(this.wordmarkMat);

    this.wordmarkMesh = new THREE.Mesh(wordmarkGeo, this.wordmarkMat);
    this.wordmarkMesh.position.set(0, 1.22, -1.2);
    this.wordmarkMesh.renderOrder = -1;
    this.scene.add(this.wordmarkMesh);

    this.ringGroup = new THREE.Group();
    this.reflectGroup = new THREE.Group();
    this.scene.add(this.ringGroup);
    this.scene.add(this.reflectGroup);

    // Concentric curved cylinder geometries
    const panelGeo = new THREE.CylinderGeometry(
      RADIUS,
      RADIUS,
      HEIGHT,
      80,
      8,
      true,
      -PANEL_ARC * 0.5,
      PANEL_ARC,
    );
    this.resources.push(panelGeo);

    const innerGeo = new THREE.CylinderGeometry(
      RADIUS - 0.016,
      RADIUS - 0.016,
      HEIGHT,
      80,
      8,
      true,
      -PANEL_ARC * 0.5,
      PANEL_ARC,
    );
    this.resources.push(innerGeo);

    const letteringGeo = new THREE.CylinderGeometry(
      RADIUS + 0.026,
      RADIUS + 0.026,
      HEIGHT,
      80,
      8,
      true,
      -PANEL_ARC * 0.5,
      PANEL_ARC,
    );
    this.resources.push(letteringGeo);

    const glassGeo = new THREE.CylinderGeometry(
      RADIUS + 0.054,
      RADIUS + 0.054,
      HEIGHT,
      80,
      8,
      true,
      -PANEL_ARC * 0.5,
      PANEL_ARC,
    );
    this.resources.push(glassGeo);

    const glassThick = 0.070;
    const edgeGeo = new THREE.PlaneGeometry(glassThick, HEIGHT);
    this.resources.push(edgeGeo);

    galleryCategories.forEach((cat, idx) => {
      const bundle = createCategoryTextureBundle(cat, (thumbUrl) => {
        if (!this.disposed) {
          this.needsPaint = true;
          this.cb.onThumbReady(idx, thumbUrl);
        }
      });
      this.bundles.push(bundle);

      const pivot = new THREE.Group();
      pivot.rotation.y = idx * SPAN;

      // 1. Inner wall (colored translucent glass)
      const innerMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: bundle.innerTex },
          uTint: { value: new THREE.Color(cat.theme.tint) },
          uOpacity: { value: 1 },
        },
        vertexShader: INNER_WALL_VERT,
        fragmentShader: INNER_WALL_FRAG,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: true,
      });

      // 2. Photographic artwork (clean image without embedded text)
      const outerMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: bundle.outerTex },
          uRadius: { value: RADIUS },
          uBreath: { value: 0 },
          uOpacity: { value: 1 },
          uDesat: { value: 0 },
          uWrapLight: { value: 1 },
          uVel: { value: 0 },
          uMouseUv: { value: new THREE.Vector2(0.5, 0.5) },
          uMouseActive: { value: 0 },
          uResolution: { value: new THREE.Vector2(1280, 720) },
        },
        vertexShader: PANEL_VERT,
        fragmentShader: PANEL_FRAG,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: true,
      });

      // 3. Category lettering decal (floating inside the glass)
      const letteringMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: bundle.letteringTex },
          uOpacity: { value: 1 },
        },
        vertexShader: LETTERING_DECAL_VERT,
        fragmentShader: LETTERING_DECAL_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
      });

      // 4. Outer glass shell (Fresnel rim + glancing specular highlight + interactive cursor spotlight)
      const glassOuterMat = new THREE.ShaderMaterial({
        uniforms: {
          uHighlightColor: { value: new THREE.Color(cat.theme.glassHighlight) },
          uEdgeColor: { value: new THREE.Color(cat.theme.edgeColor) },
          uOpacity: { value: 1 },
          uVel: { value: 0 },
          uTime: { value: 0 },
          uMouseUv: { value: new THREE.Vector2(0.5, 0.5) },
          uMouseActive: { value: 0 },
          uResolution: { value: new THREE.Vector2(1280, 720) },
        },
        vertexShader: GLASS_OUTER_VERT,
        fragmentShader: GLASS_OUTER_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
      });

      // 5. Seam edge end caps
      const edgeMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: bundle.edgeTex },
          uOpacity: { value: 1 },
        },
        vertexShader: CUT_EDGE_VERT,
        fragmentShader: CUT_EDGE_FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
      });

      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.renderOrder = 0;

      const outerMesh = new THREE.Mesh(panelGeo, outerMat);
      outerMesh.userData.categoryIndex = idx;
      outerMesh.renderOrder = 1;

      const letteringMesh = new THREE.Mesh(letteringGeo, letteringMat);
      letteringMesh.renderOrder = 2;

      const glassMesh = new THREE.Mesh(glassGeo, glassOuterMat);
      glassMesh.renderOrder = 3;

      const midR = RADIUS + 0.019;
      const edgeLeft = new THREE.Mesh(edgeGeo, edgeMat);
      edgeLeft.position.set(Math.sin(-PANEL_ARC * 0.5) * midR, 0, Math.cos(-PANEL_ARC * 0.5) * midR);
      edgeLeft.rotation.y = -PANEL_ARC * 0.5 + Math.PI * 0.5;
      edgeLeft.renderOrder = 2;

      const edgeRight = new THREE.Mesh(edgeGeo, edgeMat);
      edgeRight.position.set(Math.sin(PANEL_ARC * 0.5) * midR, 0, Math.cos(PANEL_ARC * 0.5) * midR);
      edgeRight.rotation.y = PANEL_ARC * 0.5 - Math.PI * 0.5;
      edgeRight.renderOrder = 2;

      pivot.add(innerMesh, outerMesh, letteringMesh, glassMesh, edgeLeft, edgeRight);
      this.ringGroup.add(pivot);

      this.outerMeshes.push(outerMesh);
      this.outerMats.push(outerMat);
      this.innerMats.push(innerMat);
      this.letteringMats.push(letteringMat);
      this.letteringMeshes.push(letteringMesh);
      this.glassOuterMats.push(glassOuterMat);
      this.glassOuterMeshes.push(glassMesh);
      this.edgeMats.push(edgeMat);
      this.resources.push(outerMat, innerMat, letteringMat, glassOuterMat, edgeMat);

      // Mirrored liquid-glass reflection group (reflects artwork, lettering, inner glass, and colored tint)
      const rPivot = new THREE.Group();
      rPivot.rotation.y = idx * SPAN;

      const reflectOuterMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: bundle.outerTex },
          uLetteringMap: { value: bundle.letteringTex },
          uInnerMap: { value: bundle.innerTex },
          uTint: { value: new THREE.Color(cat.theme.reflectTint) },
          uHighlightColor: { value: new THREE.Color(cat.theme.glassHighlight) },
          uEdgeColor: { value: new THREE.Color(cat.theme.edgeColor) },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uStrength: { value: 0.44 },
        },
        vertexShader: REFLECT_VERT,
        fragmentShader: REFLECT_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });

      const rOuter = new THREE.Mesh(panelGeo, reflectOuterMat);
      rOuter.renderOrder = 1;
      rPivot.add(rOuter);
      this.reflectGroup.add(rPivot);
      this.reflectOuterMats.push(reflectOuterMat);
      this.resources.push(reflectOuterMat);
    });

    this.reflectGroup.scale.y = -1;
    this.reflectGroup.position.y = this.baseRingY - HEIGHT;

    // Circular loader stroke mesh tracing the splash circle
    const loaderArcGeo = new THREE.RingGeometry(RADIUS - 0.010, RADIUS + 0.010, 128);
    this.resources.push(loaderArcGeo);

    this.loaderArcMat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uAlpha: { value: 1.0 },
      },
      vertexShader: LOADER_ARC_VERT,
      fragmentShader: LOADER_ARC_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.resources.push(this.loaderArcMat);

    this.loaderArcMesh = new THREE.Mesh(loaderArcGeo, this.loaderArcMat);
    this.loaderArcMesh.rotation.x = -Math.PI * 0.5;
    this.loaderArcMesh.position.y = HEIGHT * 0.5;
    this.ringGroup.add(this.loaderArcMesh);

    // 3D Voronoi shatter field derived from curved cylinder geometry
    this.shardMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: this.bundles[0].outerTex },
        uTint: { value: new THREE.Color(galleryCategories[0].theme.tint) },
        uOpacity: { value: 1 },
        uGloss: { value: 0 },
      },
      vertexShader: SHARD_VERT,
      fragmentShader: SHARD_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.resources.push(this.shardMat);

    const built = buildContinuousVoronoiShards(this.shardMat, this.resources);
    this.shardGroup = built.group;
    this.shards = built.shards;
    this.scene.add(this.shardGroup);

    if (!this.motionEnabled) {
      this.entranceStarted = true;
      this.entranceProgress = 1;
      this.mode = 'ringIdle';
      this.emitTitleProgress(1);
    } else {
      this.emitTitleProgress(0);
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.host);
    this.resize();

    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (entry.isIntersecting && !this.entranceStarted && this.assetsReady) {
          this.startEntrance();
        }
      },
      { threshold: 0.12 },
    );
    this.io.observe(this.host);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    canvas.addEventListener('pointerenter', this.onPointerEnter);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.lastTime = performance.now();
    this.applySceneState(0);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  }

  public setMotion(motion: boolean) {
    this.motionEnabled = motion;
    if (!motion) {
      this.entranceTimeline?.kill();
      this.openTimeline?.kill();
      this.returnTimeline?.kill();
      this.entranceStarted = true;
      this.entranceProgress = 1;
      this.entranceState.splashProgress = 1;
      this.entranceState.ringAlpha = 1;
      this.entranceState.pitch = 0.046;
      this.entranceState.yaw = -0.34;
      this.entranceState.scale = 1.0;
      this.entranceState.elevation = 0.0;
      this.entranceState.titleProgress = 1.0;
      this.entranceState.reflectProgress = 1.0;
      this.entranceState.dockProgress = 1.0;
      if (this.loaderArcMat) {
        this.loaderArcMat.uniforms.uProgress.value = 1.0;
        this.loaderArcMat.uniforms.uAlpha.value = 0.0;
      }
      if (this.mode === 'entering') {
        this.mode = 'ringIdle';
        this.cb.onLoadingProgress?.(1);
        this.cb.onDockProgress?.(1);
        this.cb.onTransitionComplete('ringIdle');
      }
      this.angle = -this.activeIndex * SPAN;
      this.targetAngle = this.angle;
      this.velocity = 0;
      if (this.mode === 'categoryTransition') {
        this.transitionProgress = 1;
        this.burstProgress = 1;
        this.mode = 'categoryGallery';
        this.outerMeshes.forEach((m) => (m.visible = true));
        this.shardGroup.visible = false;
        this.cb.onTransitionComplete('categoryGallery');
      } else if (this.mode === 'returning') {
        this.transitionProgress = 0;
        this.burstProgress = 0;
        this.mode = 'ringIdle';
        this.outerMeshes.forEach((m) => (m.visible = true));
        this.shardGroup.visible = false;
        this.cb.onTransitionComplete('ringIdle');
      }
      this.applySceneState(0);
      this.renderOnce();
    }
  }

  public onAssetsReady() {
    this.assetsReady = true;
    if (this.visible && !this.entranceStarted) {
      this.startEntrance();
    }
  }

  public startEntrance() {
    if (this.entranceStarted) return;
    this.entranceStarted = true;

    if (!this.motionEnabled) {
      this.entranceProgress = 1;
      this.entranceState.splashProgress = 1;
      this.entranceState.ringAlpha = 1;
      this.entranceState.pitch = 0.046;
      this.entranceState.yaw = -0.34;
      this.entranceState.scale = 1.0;
      this.entranceState.elevation = 0.0;
      this.entranceState.titleProgress = 1.0;
      this.entranceState.reflectProgress = 1.0;
      this.entranceState.dockProgress = 1.0;
      this.mode = 'ringIdle';
      this.emitTitleProgress(1);
      this.cb.onLoadingProgress?.(1);
      this.cb.onDockProgress?.(1);
      this.cb.onTransitionComplete('ringIdle');
      this.applySceneState(0);
      this.renderOnce();
      return;
    }

    this.entranceTimeline?.kill();
    const state = this.entranceState;
    state.splashProgress = 0;
    state.ringAlpha = 0;
    state.pitch = Math.PI * 0.5;
    state.yaw = -Math.PI * 0.5;
    state.scale = 0.62;
    state.elevation = 0.0;
    state.titleProgress = 0;
    state.reflectProgress = 0;
    state.dockProgress = 0;

    if (this.loaderArcMat) {
      this.loaderArcMat.uniforms.uProgress.value = 0;
      this.loaderArcMat.uniforms.uAlpha.value = 1.0;
    }

    const tl = gsap.timeline({
      onUpdate: () => {
        this.entranceProgress = state.splashProgress;
        if (this.loaderArcMat) {
          this.loaderArcMat.uniforms.uProgress.value = state.splashProgress;
        }
        this.cb.onLoadingProgress?.(state.splashProgress);
        this.cb.onDockProgress?.(state.dockProgress);
        this.needsPaint = true;
      },
      onComplete: () => {
        this.mode = 'ringIdle';
        this.angle = -0.34;
        this.targetAngle = -0.34;
        this.cb.onTransitionComplete('ringIdle');
      },
    });

    // Beat 1: Splash Arc Trace & Counter countup (0.0s to 1.6s)
    tl.to(
      state,
      {
        splashProgress: 1.0,
        duration: 1.6,
        ease: 'power1.inOut',
      },
      'splashTrace',
    );

    // Beat 2: Photographic panels materialize & loader arc cross-fades out (1.6s to 2.1s)
    tl.to(
      state,
      {
        ringAlpha: 1.0,
        duration: 0.45,
        ease: 'power2.out',
      },
      'ringMaterialize',
    );

    if (this.loaderArcMat) {
      tl.to(
        this.loaderArcMat.uniforms.uAlpha,
        {
          value: 0.0,
          duration: 0.35,
          ease: 'power2.out',
        },
        'ringMaterialize',
      );
    }

    // Beat 3: Grand Camera Arc Blend & Tilt Down (2.0s to 4.2s, duration 2.2s)
    tl.to(
      state,
      {
        pitch: 0.046,
        yaw: -0.34,
        scale: 1.0,
        elevation: 0.0,
        duration: 2.2,
        ease: 'power3.inOut',
      },
      'blendAndSettle',
    );

    // Beat 4: Monumental Title Rise, Floor Reflection & Dock Emerge (starting at blendAndSettle+=1.2)
    tl.to(
      state,
      {
        titleProgress: 1.0,
        dockProgress: 1.0,
        reflectProgress: 1.0,
        duration: 1.0,
        ease: 'power2.out',
      },
      'blendAndSettle+=1.2',
    );

    this.entranceTimeline = tl;
  }

  public stepCategory(delta: number) {
    if (this.mode === 'entering') {
      this.entranceTimeline?.kill();
      this.entranceProgress = 1;
      this.entranceState.splashProgress = 1;
      this.entranceState.ringAlpha = 1;
      this.entranceState.pitch = 0.046;
      this.entranceState.yaw = -0.34;
      this.entranceState.scale = 1.0;
      this.entranceState.elevation = 0.0;
      this.entranceState.titleProgress = 1.0;
      this.entranceState.reflectProgress = 1.0;
      this.entranceState.dockProgress = 1.0;
      if (this.loaderArcMat) {
        this.loaderArcMat.uniforms.uProgress.value = 1.0;
        this.loaderArcMat.uniforms.uAlpha.value = 0.0;
      }
      this.mode = 'ringIdle';
      this.emitTitleProgress(1);
      this.cb.onLoadingProgress?.(1);
      this.cb.onDockProgress?.(1);
      this.cb.onTransitionComplete('ringIdle');
    }
    if (this.mode !== 'ringIdle') return;
    const currentStep = Math.round(-this.targetAngle / SPAN);
    const targetStep = currentStep + delta;
    this.targetAngle = -targetStep * SPAN;
    this.velocity = 0;
    const nextIdx = ((targetStep % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
    if (nextIdx !== this.activeIndex) {
      this.activeIndex = nextIdx;
      this.cb.onActiveCategoryChange(nextIdx);
    }
    if (!this.motionEnabled) {
      this.angle = this.targetAngle;
      this.applySceneState(0);
      this.renderOnce();
    }
  }

  public openCategory(index?: number) {
    const idx = typeof index === 'number' ? index : this.activeIndex;
    this.entranceTimeline?.kill();
    this.returnTimeline?.kill();
    this.openTimeline?.kill();

    this.entranceStarted = true;
    this.entranceProgress = 1;
    this.activeIndex = idx;
    this.transitionCategoryIndex = idx;

    // Direct alignment to clicked category
    const baseStep = Math.round(-this.angle / SPAN);
    const curMod = ((baseStep % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
    let diff = idx - curMod;
    if (diff > 1) diff -= PANEL_COUNT;
    if (diff < -1) diff += PANEL_COUNT;
    const snapTarget = -(baseStep + diff) * SPAN;

    this.shardMat.uniforms.uMap.value = this.bundles[idx].outerTex;
    this.shardMat.uniforms.uTint.value.set(galleryCategories[idx].theme.tint);
    this.shardAmbientFade = 1;

    if (!this.motionEnabled) {
      this.angle = snapTarget;
      this.targetAngle = snapTarget;
      this.velocity = 0;
      this.transitionProgress = 1;
      this.burstProgress = 1;
      this.mode = 'categoryGallery';
      this.emitTitleProgress(0);
      this.outerMeshes.forEach((m) => (m.visible = true));
      this.letteringMeshes.forEach((m) => (m.visible = true));
      this.glassOuterMeshes.forEach((m) => (m.visible = true));
      this.shardGroup.visible = false;
      this.applySceneState(0);
      this.renderOnce();
      this.cb.onTransitionComplete('categoryGallery');
      return;
    }

    this.mode = 'categoryTransition';
    // Continuous handoff: at t=0, shards coincide with outer mesh down to subpixel
    this.outerMeshes.forEach((m, i) => {
      m.visible = i !== idx;
    });
    this.letteringMeshes.forEach((m, i) => {
      m.visible = i !== idx;
    });
    this.glassOuterMeshes.forEach((m, i) => {
      m.visible = i !== idx;
    });
    this.shardGroup.visible = true;

    const tl = gsap.timeline({
      onUpdate: () => {
        this.needsPaint = true;
      },
      onComplete: () => {
        this.mode = 'categoryGallery';
        this.cb.onTransitionComplete('categoryGallery');
      },
    });

    // Beat 1: align (0.0 to 0.22s) - align active panel to center
    tl.to(
      this,
      {
        angle: snapTarget,
        targetAngle: snapTarget,
        velocity: 0,
        duration: 0.22,
        ease: 'power2.out',
      },
      'align',
    );

    // Beat 2: shatterBurst (0.16 to 0.88s) - shards part cleanly to perimeter frame
    tl.to(
      this,
      {
        burstProgress: 1.0,
        transitionProgress: 1.0,
        duration: 0.70,
        ease: 'power3.out',
      },
      'shatterBurst-=0.06',
    );

    // Beat 3: galleryReady (0.75s) - gallery stage revealed
    tl.addLabel('galleryReady', 0.75);

    this.openTimeline = tl;
  }

  public returnToRing() {
    this.openTimeline?.kill();
    this.returnTimeline?.kill();

    const idx = this.transitionCategoryIndex;
    this.shardMat.uniforms.uMap.value = this.bundles[idx].outerTex;
    this.shardMat.uniforms.uTint.value.set(galleryCategories[idx].theme.tint);
    this.shardAmbientFade = 1;

    if (!this.motionEnabled) {
      this.transitionProgress = 0;
      this.burstProgress = 0;
      this.mode = 'ringIdle';
      this.outerMeshes.forEach((m) => (m.visible = true));
      this.letteringMeshes.forEach((m) => (m.visible = true));
      this.glassOuterMeshes.forEach((m) => (m.visible = true));
      this.shardGroup.visible = false;
      this.emitTitleProgress(1);
      this.applySceneState(0);
      this.renderOnce();
      this.cb.onTransitionComplete('ringIdle');
      return;
    }

    this.mode = 'returning';
    this.shardGroup.visible = true;
    this.outerMeshes[idx].visible = false;
    this.letteringMeshes[idx].visible = false;
    this.glassOuterMeshes[idx].visible = false;

    const tl = gsap.timeline({
      onUpdate: () => {
        this.needsPaint = true;
      },
      onComplete: () => {
        this.mode = 'ringIdle';
        this.outerMeshes[idx].visible = true;
        this.letteringMeshes[idx].visible = true;
        this.glassOuterMeshes[idx].visible = true;
        this.shardGroup.visible = false;
        this.cb.onTransitionComplete('ringIdle');
      },
    });

    // Beat 1: shardsReassemble (0.0 to 0.60s) - shards fly directly back to curved cylinder footprint
    tl.to(
      this,
      {
        burstProgress: 0.0,
        transitionProgress: 0.0,
        duration: 0.60,
        ease: 'power3.inOut',
      },
      'shardsReassemble',
    );

    // Beat 2: titleReturn (0.34s) - ISHANT title returns behind ring
    tl.addLabel('titleReturn', 0.34);

    // Beat 3: idleResume (0.64s) - ring resumes idle drift
    tl.addLabel('idleResume', 0.64);

    this.returnTimeline = tl;
  }

  public setGalleryScrollRatio(ratio: number) {
    this.shardAmbientFade = clamp01(1 - ratio * 2.1);
    this.needsPaint = true;
  }

  public setModeExternal(mode: SceneMode) {
    this.mode = mode;
    this.needsPaint = true;
  }

  public getActiveIndex() {
    return this.activeIndex;
  }

  private emitTitleProgress(p: number) {
    const rounded = Math.round(p * 1000) / 1000;
    if (rounded !== this.lastTitleProgress) {
      this.lastTitleProgress = rounded;
      this.cb.onTitleProgress(rounded);
    }
  }

  private resize() {
    if (this.disposed) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;

    // Desktop calibrated: ~590 px width & 335 px height in 1280x720 (fov 32)
    const isNarrow = w < 720;
    const fov = isNarrow ? 36 : 32;
    this.camera.fov = fov;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov * 0.5));

    if (isNarrow) {
      const neededZ = Math.hypot(RADIUS, RADIUS / (tanHalf * aspect * 0.82));
      this.baseCamZ = Math.max(7.4, neededZ);
      this.baseRingY = 0.10;
      if (this.wordmarkMesh) {
        this.wordmarkMesh.scale.setScalar(0.72);
      }
    } else {
      this.baseCamZ = 9.6;
      this.baseRingY = 0.05;
      if (this.wordmarkMesh) {
        this.wordmarkMesh.scale.setScalar(1.0);
      }
    }

    this.camera.position.z = this.baseCamZ;
    this.camera.updateProjectionMatrix();
    this.reflectGroup.position.y = this.baseRingY - HEIGHT;
    this.applySceneState(0);
    this.renderOnce();
  }

  private onVisibilityChange = () => {
    if (!document.hidden) {
      this.lastTime = performance.now();
    }
  };

  private onWheel = (e: WheelEvent) => {
    // Only respond to clear horizontal trackpad swipes; NEVER block vertical page scrolling
    if (this.mode !== 'ringIdle') return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 && Math.abs(e.deltaX) > 2) {
      e.preventDefault();
      if (!this.motionEnabled) {
        if (!this.wheelSnapTimer) this.stepCategory(Math.sign(e.deltaX));
        window.clearTimeout(this.wheelSnapTimer);
        this.wheelSnapTimer = window.setTimeout(() => {
          this.wheelSnapTimer = 0;
        }, 180);
        return;
      }
      this.targetAngle -= e.deltaX * 0.0028;
      window.clearTimeout(this.wheelSnapTimer);
      this.wheelSnapTimer = window.setTimeout(() => {
        if (this.mode === 'ringIdle' && !this.dragging) {
          this.targetAngle = Math.round(this.targetAngle / SPAN) * SPAN;
        }
      }, 220);
    }
  };

  private onPointerEnter = () => {
    this.hoverCanvas = true;
  };

  private onPointerLeave = () => {
    this.hoverCanvas = false;
    this.targetMouseActive = 0;
    this.mouseTiltTargetX = 0;
    this.mouseTiltTargetY = 0;
    this.mouseTiltTargetZ = 0;
    this.pointerNdcX = 0;
    this.pointerNdcY = 0;
    this.currentWordmarkUv.set(-10, -10);
    this.wordmarkVelocity.set(0, 0);
    for (let i = 0; i < 6; i++) {
      this.wordmarkTrailWeights[i] = 0;
      this.wordmarkTrailVel[i].set(0, 0);
    }
    if (this.hoverFront) {
      this.hoverFront = false;
      this.cb.onHoverFrontPanel(false, 0, 0);
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this.mode === 'entering') {
      this.entranceTimeline?.kill();
      this.entranceProgress = 1;
      this.entranceState.splashProgress = 1;
      this.entranceState.ringAlpha = 1;
      this.entranceState.pitch = 0.046;
      this.entranceState.yaw = -0.34;
      this.entranceState.scale = 1.0;
      this.entranceState.elevation = 0.0;
      this.entranceState.titleProgress = 1.0;
      this.entranceState.reflectProgress = 1.0;
      this.entranceState.dockProgress = 1.0;
      if (this.loaderArcMat) {
        this.loaderArcMat.uniforms.uProgress.value = 1.0;
        this.loaderArcMat.uniforms.uAlpha.value = 0.0;
      }
      this.mode = 'ringIdle';
      this.emitTitleProgress(1);
      this.cb.onLoadingProgress?.(1);
      this.cb.onDockProgress?.(1);
      this.cb.onTransitionComplete('ringIdle');
    }
    if (this.mode !== 'ringIdle') return;

    this.dragging = true;
    this.pointerDownX = e.clientX;
    this.pointerLastX = e.clientX;
    this.pointerMoved = 0;
    this.velocity = 0;
    try {
      this.renderer.domElement.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.pointerNdcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerNdcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.mouseScreenUv.set(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      );
      this.targetMouseActive = 1.0;

      // Authentic mouse gyroscopic tilt parameters from aikawakenichi.com
      const m = THREE.MathUtils.clamp(this.pointerNdcX, -1, 1);
      const g = THREE.MathUtils.clamp(-this.pointerNdcY, -1, 1);
      this.mouseTiltTargetX = g * 0.075;
      this.mouseTiltTargetY = -m * 0.15;
      this.mouseTiltTargetZ = -m * 0.035;
    }

    // Localized liquid wave displacement on ISHANT wordmark plane
    if (this.wordmarkMesh && rect.width > 0 && rect.height > 0) {
      const planeZ = this.wordmarkMesh.position.z;
      const dist = this.camera.position.z - planeZ;
      const vFovRad = THREE.MathUtils.degToRad(this.camera.fov);
      const halfH = dist * Math.tan(vFovRad * 0.5);
      const halfW = halfH * this.camera.aspect;

      const worldX = this.pointerNdcX * halfW;
      const worldY = this.pointerNdcY * halfH;

      const localX = worldX - this.wordmarkMesh.position.x;
      const localY = worldY - this.wordmarkMesh.position.y;

      const curWidth = this.wordmarkWidth * this.wordmarkMesh.scale.x;
      const curHeight = this.wordmarkHeight * this.wordmarkMesh.scale.y;
      const uvX = localX / curWidth + 0.5;
      const uvY = localY / curHeight + 0.5;

      const dt = Math.max(0.001, (performance.now() - this.lastWordmarkTime) / 1000);
      this.lastWordmarkTime = performance.now();

      const prevUvX = this.currentWordmarkUv.x;
      const prevUvY = this.currentWordmarkUv.y;

      const vx = (uvX - prevUvX) / dt;
      const vy = (uvY - prevUvY) / dt;

      this.wordmarkVelocity.x += (vx - this.wordmarkVelocity.x) * 0.45;
      this.wordmarkVelocity.y += (vy - this.wordmarkVelocity.y) * 0.45;

      this.currentWordmarkUv.set(uvX, uvY);

      for (let i = 5; i > 0; i--) {
        this.wordmarkTrail[i].copy(this.wordmarkTrail[i - 1]);
        this.wordmarkTrailVel[i].copy(this.wordmarkTrailVel[i - 1]);
        this.wordmarkTrailWeights[i] = this.wordmarkTrailWeights[i - 1] * 0.88;
      }
      this.wordmarkTrail[0].set(uvX, uvY);
      this.wordmarkTrailVel[0].copy(this.wordmarkVelocity);
      this.wordmarkTrailWeights[0] = Math.min(1.0, this.wordmarkTrailWeights[0] + 0.45);
      this.needsPaint = true;
    }

    if (this.dragging && this.mode === 'ringIdle') {
      const dx = e.clientX - this.pointerLastX;
      this.pointerLastX = e.clientX;
      this.pointerMoved = Math.max(this.pointerMoved, Math.abs(e.clientX - this.pointerDownX));
      const sensitivity = rect.width < 640 ? 0.0082 : 0.0055;
      const deltaAngle = dx * sensitivity;
      this.targetAngle += deltaAngle;
      this.velocity = deltaAngle * 42;
      if (this.hoverFront) {
        this.hoverFront = false;
        this.cb.onHoverFrontPanel(false, e.clientX, e.clientY);
      }
      return;
    }

    if (this.mode === 'ringIdle' && e.pointerType === 'mouse') {
      this.raycaster.setFromCamera(
        new THREE.Vector2(this.pointerNdcX, this.pointerNdcY),
        this.camera,
      );
      const hits = this.raycaster.intersectObjects(this.outerMeshes, false);
      const hitFront = hits.length > 0;
      if (hitFront || this.hoverFront) {
        this.hoverFront = hitFront;
        this.cb.onHoverFrontPanel(hitFront, e.clientX, e.clientY);
      }
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    try {
      if (this.renderer.domElement.hasPointerCapture(e.pointerId)) {
        this.renderer.domElement.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore synthetic events
    }

    if (this.mode !== 'ringIdle') return;

    if (this.pointerMoved < 8) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
      const hits = this.raycaster.intersectObjects(this.outerMeshes, false);
      if (hits.length > 0) {
        const hitIdx = hits[0].object.userData.categoryIndex as number;
        this.cb.onCategoryOpenRequest(hitIdx);
      }
    } else {
      if (!this.motionEnabled) {
        this.targetAngle = -this.activeIndex * SPAN;
        this.stepCategory(e.clientX < this.pointerDownX ? 1 : -1);
        return;
      }
      const projected = this.targetAngle + this.velocity * 0.16;
      const snappedStep = Math.round(projected / SPAN);
      this.targetAngle = snappedStep * SPAN;
      this.velocity = 0;
    }
  };

  private onPointerCancel = () => {
    this.dragging = false;
    this.velocity = 0;
  };

  private tick = (now: number) => {
    if (this.disposed) return;
    const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.05);
    this.lastTime = now;

    const changingView =
      this.mode !== 'itemZoom' &&
      (this.mode !== 'categoryGallery' || this.shardAmbientFade > 0.01);
    const active =
      this.visible &&
      !document.hidden &&
      (this.needsPaint || (this.motionEnabled && changingView));
    for (const bundle of this.bundles) bundle.updatePlayback?.(this.visible && !document.hidden && this.motionEnabled && changingView);
    if (active) {
      this.needsPaint = false;
      if (this.motionEnabled) this.elapsed += dt;
      this.updatePhysics(dt);
      this.applySceneState(dt);
      this.renderOnce();
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePhysics(dt: number) {
    // Idle rotation & weighted spring settle
    if (this.mode === 'ringIdle') {
      if (this.motionEnabled && !this.dragging && !this.hoverCanvas) {
        this.targetAngle -= dt * 0.048;
      }
      const lerpRate = this.dragging ? 16 : 6.2;
      this.angle += (this.targetAngle - this.angle) * (1 - Math.exp(-lerpRate * dt));

      const instVel = dt > 0.0001 ? (this.angle - this.prevAngle) / dt : 0;
      this.prevAngle = this.angle;
      this.smoothAngularVel += (instVel - this.smoothAngularVel) * (1 - Math.exp(-10 * dt));

      const continuousStep = -this.angle / SPAN;
      this.cb.onContinuousStep(continuousStep);

      const idx =
        ((Math.round(continuousStep) % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
      if (idx !== this.activeIndex) {
        this.activeIndex = idx;
        this.cb.onActiveCategoryChange(idx);
      }
    } else if (this.mode === 'categoryTransition' || this.mode === 'returning') {
      this.angle += (this.targetAngle - this.angle) * (1 - Math.exp(-14 * dt));
      this.prevAngle = this.angle;
      this.smoothAngularVel *= Math.exp(-12 * dt);
    }

    // Smooth pointer parallax & authentic gyroscopic mouse tilt (aikawakenichi.com)
    const allowParallax =
      (this.mode === 'ringIdle' || this.mode === 'categoryGallery') && this.motionEnabled;
    const targetX = allowParallax ? this.pointerNdcX : 0;
    const targetY = allowParallax ? this.pointerNdcY : 0;
    this.smoothNdcX += (targetX - this.smoothNdcX) * (1 - Math.exp(-4.8 * dt));
    this.smoothNdcY += (targetY - this.smoothNdcY) * (1 - Math.exp(-4.8 * dt));

    const follow = 3.2;
    const fTilt = 1 - Math.exp(-follow * dt);
    this.mouseTiltCurrentX += (this.mouseTiltTargetX - this.mouseTiltCurrentX) * fTilt;
    this.mouseTiltCurrentY += (this.mouseTiltTargetY - this.mouseTiltCurrentY) * fTilt;
    this.mouseTiltCurrentZ += (this.mouseTiltTargetZ - this.mouseTiltCurrentZ) * fTilt;

    this.smoothMouseActive += (this.targetMouseActive - this.smoothMouseActive) * (1 - Math.exp(-6.0 * dt));

    if (this.mode === 'ringIdle') {
      this.cb.onPointerParallax(this.smoothNdcX, this.smoothNdcY);
    }
  }

  private applySceneState(dt: number) {
    const state = this.entranceState;
    const isEntering = this.mode === 'entering';

    const rawE = isEntering ? state.splashProgress : this.entranceProgress;
    const pitchVal = isEntering ? state.pitch : 0.046;
    const scaleVal = isEntering ? state.scale : 1.0;
    const yawVal = isEntering ? state.yaw : this.angle;
    const elevVal = isEntering ? state.elevation : 0.0;
    const titleP = isEntering ? state.titleProgress : 1.0;
    const reflectP = isEntering ? state.reflectProgress : 1.0;

    const bp = this.burstProgress;
    const tp = this.transitionProgress;

    // Monumental ISHANT reveal synchronized with tilt & cleanly hidden during open gallery
    const openTitle = 1 - clamp01(tp / 0.18);
    const finalTitleProgress = titleP * openTitle;
    this.emitTitleProgress(finalTitleProgress);

    // Wordmark plane in Three.js scene
    if (this.wordmarkMesh && this.wordmarkMat) {
      const wordmarkBaseY = 1.22;
      this.wordmarkMesh.position.y = wordmarkBaseY + elevVal + (1 - titleP) * -0.65;
      this.wordmarkMat.uniforms.uOpacity.value = finalTitleProgress;
      this.wordmarkMat.uniforms.uReducedMotion.value = this.motionEnabled ? 0.0 : 1.0;
      this.wordmarkMat.uniforms.uPointer.value.copy(this.currentWordmarkUv);
      this.wordmarkMat.uniforms.uVelocity.value.copy(this.wordmarkVelocity);
      this.wordmarkMat.uniforms.uTime.value = this.elapsed;

      for (let i = 0; i < 6; i++) {
        (this.wordmarkMat.uniforms.uTrail.value as THREE.Vector2[])[i].copy(this.wordmarkTrail[i]);
        (this.wordmarkMat.uniforms.uTrailVel.value as THREE.Vector2[])[i].copy(this.wordmarkTrailVel[i]);
        (this.wordmarkMat.uniforms.uTrailWeight.value as number[])[i] = this.wordmarkTrailWeights[i];
      }

      // Navier-Stokes fluid velocity dissipation (matching SplashCursor DENSITY_DISSIPATION: 3.2, VELOCITY_DISSIPATION: 2.4)
      this.wordmarkVelocity.multiplyScalar(Math.exp(-2.4 * dt));
      for (let i = 0; i < 6; i++) {
        this.wordmarkTrailVel[i].multiplyScalar(Math.exp(-2.4 * dt));
        this.wordmarkTrailWeights[i] = Math.max(0.0, this.wordmarkTrailWeights[i] * Math.exp(-3.2 * dt));
      }
    }

    this.camera.position.z = THREE.MathUtils.lerp(this.baseCamZ * 0.82, this.baseCamZ, scaleVal);

    const allowTilt = (this.mode === 'ringIdle') && this.motionEnabled;
    const velLean =
      THREE.MathUtils.clamp(-this.smoothAngularVel * 0.022, -0.055, 0.055);
    const tiltX = pitchVal + (allowTilt ? this.mouseTiltCurrentX : 0) * scaleVal;
    const tiltY = yawVal + (allowTilt ? this.mouseTiltCurrentY : 0) * scaleVal;
    const tiltZ = ((allowTilt ? this.mouseTiltCurrentZ : 0) + velLean) * scaleVal;
    const idleFloatY =
      this.motionEnabled && this.mode === 'ringIdle'
        ? Math.sin(this.elapsed * 1.05) * 0.020
        : 0;

    const ringY = this.baseRingY + elevVal + idleFloatY;

    this.ringGroup.position.set(0, ringY, 0);
    this.ringGroup.scale.setScalar(scaleVal);
    this.ringGroup.rotation.set(tiltX, tiltY, tiltZ);

    if (this.loaderArcMesh) {
      this.loaderArcMesh.visible =
        isEntering && (state.splashProgress < 1.0 || (this.loaderArcMat?.uniforms.uAlpha.value ?? 0) > 0.005);
    }

    const reflectAlpha =
      reflectP * (1 - clamp01(tp / 0.18));
    this.reflectGroup.visible =
      reflectAlpha > 0.004 && bp < 0.99 && (isEntering ? state.ringAlpha > 0.4 : true);
    
    // Physical contact line reflection anchoring
    const yFloor = ringY - (HEIGHT * 0.5) * Math.cos(tiltX) - RADIUS * Math.sin(tiltX);
    this.reflectGroup.position.set(0, 2 * yFloor - ringY, 0);
    this.reflectGroup.rotation.set(-tiltX, tiltY, -(tiltZ * 0.2));

    const canvasW = this.renderer.domElement.width || 1280;
    const canvasH = this.renderer.domElement.height || 720;
    const catAlpha = isEntering ? state.ringAlpha : 1.0;

    for (let i = 0; i < PANEL_COUNT; i++) {
      const isSelected = i === this.transitionCategoryIndex;
      const otherFade = (isSelected ? 1 : 1 - clamp01(tp / 0.22)) * catAlpha;

      // Artwork
      this.outerMats[i].uniforms.uOpacity.value = otherFade;
      this.outerMats[i].uniforms.uBreath.value = this.elapsed * 0.9;
      this.outerMats[i].uniforms.uWrapLight.value = scaleVal;
      this.outerMats[i].uniforms.uVel.value = this.smoothAngularVel;
      this.outerMats[i].uniforms.uMouseUv.value.copy(this.mouseScreenUv);
      this.outerMats[i].uniforms.uMouseActive.value = this.smoothMouseActive;
      this.outerMats[i].uniforms.uResolution.value.set(canvasW, canvasH);

      // Suspended category lettering
      this.letteringMats[i].uniforms.uOpacity.value = otherFade;

      // Outer glass shell
      this.glassOuterMats[i].uniforms.uOpacity.value = otherFade;
      this.glassOuterMats[i].uniforms.uVel.value = this.smoothAngularVel;
      this.glassOuterMats[i].uniforms.uTime.value = this.elapsed;
      this.glassOuterMats[i].uniforms.uMouseUv.value.copy(this.mouseScreenUv);
      this.glassOuterMats[i].uniforms.uMouseActive.value = this.smoothMouseActive;
      this.glassOuterMats[i].uniforms.uResolution.value.set(canvasW, canvasH);

      // Inner wall
      this.innerMats[i].uniforms.uOpacity.value = otherFade;

      // Cut seam edges
      this.edgeMats[i].uniforms.uOpacity.value = otherFade;

      // Floor reflection
      this.reflectOuterMats[i].uniforms.uOpacity.value = reflectAlpha * otherFade;
      this.reflectOuterMats[i].uniforms.uTime.value = this.elapsed;
    }

    // Shard group matches ringGroup transform perfectly
    this.shardGroup.position.copy(this.ringGroup.position);
    this.shardGroup.rotation.copy(this.ringGroup.rotation);
    this.shardGroup.scale.copy(this.ringGroup.scale);

    const showShards =
      (this.mode === 'categoryTransition' ||
        this.mode === 'categoryGallery' ||
        this.mode === 'returning') &&
      this.shardAmbientFade > 0.01;

    this.shardGroup.visible = showShards;

    if (showShards) {
      this.shardMat.uniforms.uOpacity.value = this.shardAmbientFade;
      this.shardMat.uniforms.uGloss.value = Math.sin(bp * Math.PI) * 0.18;

      for (const sh of this.shards) {
        if (bp <= 0.0001) {
          // Exactly matches the curved cylinder panel at t=0 and on return settlement
          sh.mesh.position.copy(sh.curvedCentroid);
          sh.mesh.rotation.set(0, 0, 0);
          sh.mesh.scale.setScalar(1);
        } else {
          const local = clamp01((bp - sh.delay) / (1 - sh.delay));
          if (local <= 0.20) {
            const cf = easeOutCubic(local / 0.20);
            sh.mesh.position.lerpVectors(sh.curvedCentroid, sh.crackTarget, cf);
            sh.mesh.rotation.set(
              sh.rotTarget.x * 0.04 * cf,
              sh.rotTarget.y * 0.04 * cf,
              sh.rotTarget.z * 0.03 * cf,
            );
            sh.mesh.scale.setScalar(1 - cf * 0.03);
          } else {
            const bf = easeOutExpo((local - 0.20) / 0.80);
            sh.mesh.position.lerpVectors(sh.crackTarget, sh.burstTarget, bf);
            if (this.motionEnabled && local > 0.8) {
              sh.mesh.position.y +=
                Math.sin(this.elapsed * 0.85 + sh.driftPhase) * 0.04 +
                this.smoothNdcY * sh.parallaxWeight;
              sh.mesh.position.x +=
                Math.cos(this.elapsed * 0.65 + sh.driftPhase) * 0.03 +
                this.smoothNdcX * sh.parallaxWeight;
            }
            sh.mesh.rotation.set(
              sh.rotTarget.x * (0.04 + bf * 0.96),
              sh.rotTarget.y * (0.04 + bf * 0.96),
              sh.rotTarget.z * (0.03 + bf * 0.97),
            );
            sh.mesh.scale.setScalar(0.97 - bf * 0.12);
          }
        }
      }
    }
  }

  private renderOnce() {
    if (!this.disposed) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public dispose() {
    this.disposed = true;
    this.entranceTimeline?.kill();
    this.openTimeline?.kill();
    this.returnTimeline?.kill();
    window.clearTimeout(this.wheelSnapTimer);
    cancelAnimationFrame(this.rafId);
    this.ro.disconnect();
    this.io.disconnect();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointercancel', this.onPointerCancel);
    canvas.removeEventListener('pointerenter', this.onPointerEnter);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    canvas.removeEventListener('wheel', this.onWheel);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.bundles.forEach((b) => b.dispose());
    this.resources.forEach((r) => r.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    canvas.remove();
  }
}
