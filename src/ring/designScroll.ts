import * as THREE from 'three';

// Vertex shader ported from Aikawa Kenichi
// Completely steady in the viewport; smoothly arches backward in 3D as it exits the top rim without fluttering/shaking
const VERTEX_SHADER = /* glsl */ `
precision highp float;

#define PI 3.141592653589793

varying vec2 vUv;
varying float vTopFade;

uniform vec2 iResolution;
uniform vec2 uSize;
uniform float uRollTopBend;
uniform float uRollTopFade;
uniform float uRollTopFadeStart;
uniform float uRollTopRadius;
uniform float uRollTopRange;
uniform float uRollTopReturn;
uniform float uRollTopStart;

void main() {
	vUv = uv;

	vec3 nPos = position.xyz;

	float rollPower = max(
		max(abs(uRollTopBend), abs(uRollTopFade)),
		abs(uRollTopRadius)
	);

	vTopFade = 0.0;

	if ( rollPower > 0.00001 ) {
		vec4 worldPosition = modelMatrix * vec4(position, 1.0);
		float topThreshold = (iResolution.y * 0.5) - (iResolution.y * uRollTopStart);
		float topRange = max(iResolution.y * uRollTopRange, 1.0);
		float band = clamp((worldPosition.y - topThreshold) / topRange, 0.0, 1.0);
		float rollMask = smoothstep(0.0, 1.0, band);
		float rollEnter = smoothstep(0.0, 0.42, band);
		float rollReturn = smoothstep(0.44, 0.92, band);
		float curlEnter = sin(rollEnter * PI * 0.5);
		float curlReturn = sin(rollReturn * PI);
		float sCurve = (curlEnter * 0.92) - (curlReturn * uRollTopReturn * 0.48);
		float lift = smoothstep(0.62, 0.98, band) * uRollTopBend * 0.18;

		// Steady, elegant cylindrical roll backwards off top rim without any oscillation or shaking
		nPos.y += lift / max(uSize.y, 1.0);
		nPos.z -= sCurve * uRollTopRadius * rollMask;

		vTopFade = pow(smoothstep(uRollTopFadeStart, 1.0, band), 0.7) * uRollTopFade;
	}

	gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}
`;

// Sample the artwork once and encode its linear RGB for the display.
const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
  gl_FragColor = texture2D(tDiffuse, vUv);
  #include <colorspace_fragment>
}
`;

interface CardEntry {
  card: HTMLElement;
  mediaEl: HTMLElement;
  imgEl: HTMLImageElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  texture: THREE.Texture;
  loaded: boolean;
  width: number;
  height: number;
  x: number;
  pageTop: number;
}

export function animateDesignScroll(view: HTMLElement) {
  const container = view.parentElement || view;
  const cards = Array.from(view.querySelectorAll<HTMLElement>('[data-stream-card]'));
  if (!cards.length) return () => {};

  // Create overlay WebGL canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'design-scroll-webgl-overlay';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '4';
  container.appendChild(canvas);

  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    console.warn('Failed to initialize WebGL for design scroll', e);
    canvas.remove();
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(view.clientWidth, view.clientHeight);

  const scene = new THREE.Scene();
  const fov = 45;
  const camera = new THREE.PerspectiveCamera(fov, view.clientWidth / Math.max(view.clientHeight, 1), 1, 10000);
  camera.position.z = view.clientHeight / Math.tan((fov * Math.PI) / 360) / 2;
  camera.lookAt(0, 0, 0);

  // High-density plane geometry so vertex top wave curves smoothly
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 64);

  const resolution = new THREE.Vector2(view.clientWidth, view.clientHeight);
  const entries: CardEntry[] = [];

  // Declare all state variables upfront to prevent any TDZ issues
  let frameId = 0;

  function wake() {
    if (!frameId) {
      frameId = requestAnimationFrame(tick);
    }
  }

  function measureAllCards() {
    const viewRect = view.getBoundingClientRect();
    const scrollPos = view.scrollTop;

    entries.forEach((entry) => {
      const rect = entry.mediaEl.getBoundingClientRect();
      entry.width = Math.max(rect.width, 1);
      entry.height = Math.max(rect.height, 1);
      entry.x = rect.left - viewRect.left - viewRect.width * 0.5 + rect.width * 0.5;
      entry.pageTop = rect.top - viewRect.top + scrollPos;

    });
  }

  cards.forEach((card) => {
    const mediaEl = card.querySelector<HTMLElement>('.cat-stream-frame') || card;
    const imgEl = card.querySelector<HTMLImageElement>('img');
    if (!imgEl) return;

    const texture = new THREE.Texture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tDiffuse: { value: texture },
        iResolution: { value: resolution },
        uSize: { value: new THREE.Vector2(card.offsetWidth, card.offsetHeight) },
        // Aikawa tuning parameters for top rim curve (active only when band > 0)
        uRollTopBend: { value: 36.0 },
        uRollTopFade: { value: 1.0 },
        uRollTopFadeStart: { value: 0.25 },
        uRollTopRadius: { value: 380.0 },
        uRollTopRange: { value: 0.26 },
        uRollTopReturn: { value: 0.30 },
        uRollTopStart: { value: 0.08 },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);

    const entry: CardEntry = {
      card,
      mediaEl,
      imgEl,
      mesh,
      texture,
      loaded: false,
      width: Math.max(mediaEl.offsetWidth, 1),
      height: Math.max(mediaEl.offsetHeight, 1),
      x: 0,
      pageTop: 0,
    };

    function onImageLoaded() {
      entry.texture.image = imgEl;
      entry.texture.needsUpdate = true;
      entry.loaded = true;
      if (imgEl) imgEl.style.opacity = '0';
      measureAllCards();
      wake();
    }

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      onImageLoaded();
    } else {
      imgEl.addEventListener('load', onImageLoaded, { once: true });
    }

    entries.push(entry);
  });

  measureAllCards();

  function onResize() {
    if (!renderer) return;
    const w = view.clientWidth;
    const h = view.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(h, 1);
    camera.position.z = h / Math.tan((fov * Math.PI) / 360) / 2;
    camera.updateProjectionMatrix();
    resolution.set(w, h);
    measureAllCards();
    wake();
  }

  function tick() {
    frameId = 0;
    const scrollPos = view.scrollTop;
    const viewH = view.clientHeight;

    // Update meshes using cached pageTop for 100% linear, jitter-free positioning
    entries.forEach((entry) => {
      const cardTop = entry.pageTop - scrollPos;
      const inView = cardTop + entry.height >= -120 && cardTop <= viewH + 120;

      if (!inView || !entry.loaded) {
        entry.mesh.visible = false;
        return;
      }

      entry.mesh.visible = true;

      // Position in Three.js coordinates (origin at center of screen)
      const y = viewH * 0.5 - cardTop - entry.height * 0.5;

      entry.mesh.position.set(entry.x, y, 0);
      entry.mesh.scale.set(entry.width, entry.height, 1);

      entry.mesh.material.uniforms.uSize.value.set(entry.width, entry.height);
    });

    if (renderer) {
      renderer.render(scene, camera);
    }

  }

  view.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', onResize);

  wake();

  return () => {
    cancelAnimationFrame(frameId);
    view.removeEventListener('scroll', wake);
    window.removeEventListener('resize', onResize);

    entries.forEach((e) => {
      if (e.imgEl) e.imgEl.style.opacity = '';
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
      e.texture.dispose();
    });
    geometry.dispose();

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    canvas.remove();
  };
}
