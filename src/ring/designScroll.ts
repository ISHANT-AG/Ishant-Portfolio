import * as THREE from 'three';

// Exact vertex shader from Aikawa Kenichi
// Renders the signature 3D wave and backwards cylindrical roll as cards reach the top threshold
const VERTEX_SHADER = /* glsl */ `
precision highp float;

#define PI 3.141592653589793

varying vec2 vUv;
varying float vTopFade;

uniform vec2 iResolution;
uniform vec2 uSize;
uniform float uScrollPos;
uniform float uRollTopBend;
uniform float uRollTopFade;
uniform float uRollTopFadeStart;
uniform float uRollTopRadius;
uniform float uRollTopRange;
uniform float uRollTopReturn;
uniform float uRollTopStart;
uniform float uRollTopWaveAmp;
uniform float uRollTopWaveFreq;
uniform float uRollTopWaveSmooth;
uniform float uRollTopWaveSpacing;

void main() {
	vUv = uv;

	vec3 nPos = position.xyz;

	float rollPower = max(
		max(abs(uRollTopBend), abs(uRollTopFade)),
		max(abs(uRollTopRadius), abs(uRollTopWaveAmp))
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
		float waveMask = sin(band * PI);
		float wavePhase = (
			(nPos.x / max(uSize.x * 0.5, 1.0)) * PI * uRollTopWaveFreq / max(uRollTopWaveSpacing, 0.001)
			- uScrollPos * 0.01
		);
		float primaryWave = sin(wavePhase);
		float secondaryWave = sin(wavePhase * 0.52 - 0.95);
		float tertiaryWave = sin(wavePhase * 0.31 + 1.2);
		float smoothWave = (primaryWave * 0.68) + (secondaryWave * 0.22) + (tertiaryWave * 0.10);
		float surfaceWave = mix(primaryWave, smoothWave, clamp(uRollTopWaveSmooth, 0.0, 1.0)) * uRollTopWaveAmp * waveMask;

		nPos.y += lift;
		nPos.z -= sCurve * uRollTopRadius * rollMask;
		nPos.z += surfaceWave;

		vTopFade = pow(smoothstep(uRollTopFadeStart, 1.0, band), 0.7) * uRollTopFade;
	}

	gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}
`;

// Fragment shader with prismatic chromatic aberration and top-fade on curl
const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying float vTopFade;

uniform sampler2D tDiffuse;
uniform float uEffectsAberration;
uniform float uEffectsBlurFade;

void main() {
  float alphaBase = 1.0 - vTopFade;
  if (alphaBase <= 0.0001) {
    discard;
  }

  vec2 uvCover = vUv;
  float fadeBlur = clamp(vTopFade * uEffectsBlurFade, 0.0, 0.08);
  vec2 blurOffset = vec2(0.0, fadeBlur);
  vec2 aberrationOffset = vec2(uEffectsAberration * vTopFade, 0.0);

  vec4 c = texture2D(tDiffuse, uvCover);
  vec3 image = c.rgb;

  if (fadeBlur > 0.0001) {
    vec3 sampleCenter = c.rgb;
    vec3 sampleNearA = texture2D(tDiffuse, uvCover - blurOffset * 0.5).rgb;
    vec3 sampleNearB = texture2D(tDiffuse, uvCover + blurOffset * 0.5).rgb;
    vec3 sampleFarA  = texture2D(tDiffuse, uvCover - blurOffset).rgb;
    vec3 sampleFarB  = texture2D(tDiffuse, uvCover + blurOffset).rgb;

    vec3 blurred = (
      sampleCenter * 0.32 +
      sampleNearA * 0.24 +
      sampleNearB * 0.24 +
      sampleFarA * 0.10 +
      sampleFarB * 0.10
    );

    float chromaMix = clamp(vTopFade, 0.0, 1.0);
    if (chromaMix > 0.0001 && abs(uEffectsAberration) > 0.0001) {
      vec3 chroma = vec3(
        texture2D(tDiffuse, uvCover + aberrationOffset).r,
        blurred.g,
        texture2D(tDiffuse, uvCover - aberrationOffset).b
      );
      image = mix(blurred, chroma, chromaMix);
    } else {
      image = blurred;
    }
  }

  gl_FragColor = vec4(image, alphaBase * c.a);
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

  const resolution = new THREE.Vector2(view.clientWidth, view.clientHeight);
  const entries: CardEntry[] = [];

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
      const newW = Math.max(rect.width, 1);
      const newH = Math.max(rect.height, 1);

      if (Math.abs(entry.width - newW) > 1 || Math.abs(entry.height - newH) > 1) {
        entry.mesh.geometry.dispose();
        entry.mesh.geometry = new THREE.PlaneGeometry(newW, newH, 32, 64);
        entry.width = newW;
        entry.height = newH;
        entry.mesh.material.uniforms.uSize.value.set(newW, newH);
      }

      entry.x = rect.left - viewRect.left - viewRect.width * 0.5 + newW * 0.5;
      entry.pageTop = rect.top - viewRect.top + scrollPos;
    });
  }

  cards.forEach((card) => {
    const mediaEl = card.querySelector<HTMLElement>('.cat-stream-frame') || card;
    const imgEl = card.querySelector<HTMLImageElement>('img');
    if (!imgEl) return;

    const initialW = Math.max(mediaEl.offsetWidth, 100);
    const initialH = Math.max(mediaEl.offsetHeight, 100);
    const geometry = new THREE.PlaneGeometry(initialW, initialH, 32, 64);

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
        uSize: { value: new THREE.Vector2(initialW, initialH) },
        uScrollPos: { value: 0 },
        // Exact Aikawa parameters tuned with lower threshold ("a little below it")
        uRollTopBend: { value: 48.0 },
        uRollTopFade: { value: 1.0 },
        uRollTopFadeStart: { value: 0.30 },
        uRollTopRadius: { value: 500.0 },
        uRollTopRange: { value: 0.28 },
        uRollTopReturn: { value: 0.30 },
        uRollTopStart: { value: 0.19 }, // Lower threshold ("a little below it") leaving clean whitespace below header
        uRollTopWaveAmp: { value: 38.0 },
        uRollTopWaveFreq: { value: 1.45 },
        uRollTopWaveSmooth: { value: 0.68 },
        uRollTopWaveSpacing: { value: 1.22 },
        uEffectsAberration: { value: 0.018 },
        uEffectsBlurFade: { value: 0.03 },
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
      width: initialW,
      height: initialH,
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

  let lastScrollPos = -999999;
  let stillCount = 0;

  function tick() {
    frameId = 0;
    const scrollPos = view.scrollTop;
    const viewH = view.clientHeight;

    entries.forEach((entry) => {
      const cardTop = entry.pageTop - scrollPos;
      const inView = cardTop + entry.height >= -250 && cardTop <= viewH + 250;

      if (!inView || !entry.loaded) {
        entry.mesh.visible = false;
        return;
      }

      entry.mesh.visible = true;

      // Position in Three.js coordinates (origin at center of screen)
      const y = viewH * 0.5 - cardTop - entry.height * 0.5;

      entry.mesh.position.set(entry.x, y, 0);
      entry.mesh.scale.set(1, 1, 1);

      entry.mesh.material.uniforms.uScrollPos.value = scrollPos;
    });

    if (renderer) {
      renderer.render(scene, camera);
    }

    // Keep ticking while actively scrolling so animation is continuous and buttery smooth
    if (Math.abs(scrollPos - lastScrollPos) > 0.05) {
      lastScrollPos = scrollPos;
      stillCount = 0;
      frameId = requestAnimationFrame(tick);
    } else if (stillCount < 5) {
      stillCount++;
      frameId = requestAnimationFrame(tick);
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

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    canvas.remove();
  };
}
