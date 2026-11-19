import * as THREE from 'three';
import type { GalleryCategory, PlateId } from './galleryData';

export type CategoryTextureBundle = {
  outerTex: THREE.CanvasTexture;
  letteringTex: THREE.CanvasTexture;
  reflectTex: THREE.CanvasTexture;
  innerTex: THREE.CanvasTexture;
  edgeTex: THREE.CanvasTexture;
  updatePlayback?: (active: boolean) => void;
  thumbUrl: string;
  dispose: () => void;
};

const PANEL_W = 1644;
const PANEL_H = 600;

function addSubtleFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity = 5) {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d')!;
  const imgData = tctx.createImageData(128, 128);
  let seed = 4219;
  for (let i = 0; i < imgData.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = ((seed / 2147483647) - 0.5) * 2 * intensity;
    const v = Math.max(0, Math.min(255, 128 + n));
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 26;
  }
  tctx.putImageData(imgData, 0, 0);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawCoverCropped(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
  destW: number,
  destH: number,
) {
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const subX = natW * crop.x;
  const subY = natH * crop.y;
  const subW = natW * crop.w;
  const subH = natH * crop.h;

  const targetAspect = destW / destH;
  const srcAspect = subW / subH;

  let sx = subX;
  let sy = subY;
  let sw = subW;
  let sh = subH;

  if (srcAspect > targetAspect) {
    sw = subH * targetAspect;
    sx = subX + (subW - sw) * 0.5;
  } else {
    sh = subW / targetAspect;
    sy = subY + (subH - sh) * 0.5;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
}

function paintOpticalAutomate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Luminous rose-quartz, violet-mist & sunlit peach film-light atmosphere
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#25225c');
  base.addColorStop(0.28, '#477fe8');
  base.addColorStop(0.58, '#287fbb');
  base.addColorStop(0.84, '#79d6ee');
  base.addColorStop(1, '#5651a8');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Soft horizon atmospheric depth (richer mauve-violet below, airy luminous sky above)
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, 'rgba(255, 250, 254, 0.18)');
  sky.addColorStop(0.42, 'rgba(244, 224, 240, 0.16)');
  sky.addColorStop(0.68, 'rgba(156, 98, 148, 0.34)');
  sky.addColorStop(1, 'rgba(128, 76, 132, 0.56)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Organic photographic lens light-leak blooms
  const blooms: [number, number, number, string][] = [
    [w * 0.48, h * 0.24, w * 0.36, 'rgba(255, 255, 255, 0.85)'],
    [w * 0.84, h * 0.62, w * 0.32, 'rgba(255, 206, 198, 0.72)'],
    [w * 0.18, h * 0.68, w * 0.3, 'rgba(164, 152, 234, 0.56)'],
    [w * 0.66, h * 0.78, w * 0.28, 'rgba(222, 114, 156, 0.52)'],
    [w * 0.34, h * 0.52, w * 0.24, 'rgba(255, 244, 250, 0.45)'],
  ];
  for (const [bx, by, br, col] of blooms) {
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Sweeping translucent glass-prism refraction waves (organic, no stiff wireframe circles)
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const y0 = h * (0.36 + i * 0.085);
    const waveGrad = ctx.createLinearGradient(0, y0 - 70, 0, y0 + 70);
    waveGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    waveGrad.addColorStop(0.5, `rgba(255, 250, 255, ${0.14 + (i % 2) * 0.07})`);
    waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.bezierCurveTo(w * 0.28, y0 - 75 + i * 16, w * 0.68, y0 + 68 - i * 12, w, y0 - 18);
    ctx.lineTo(w, y0 + 76);
    ctx.bezierCurveTo(w * 0.66, y0 + 130 - i * 10, w * 0.26, y0 + 12 + i * 14, 0, y0 + 68);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  addSubtleFilmGrain(ctx, w, h, 8);
}

function paintCategoryBase(
  ctx: CanvasRenderingContext2D,
  cat: GalleryCategory,
  img: HTMLImageElement | null,
  w: number,
  h: number,
  isReflection = false,
) {
  ctx.clearRect(0, 0, w, h);

  if (cat.cover.type === 'optical') {
    paintOpticalAutomate(ctx, w, h);
    return;
  }

  // Soft studio backdrop while image decodes
  const fallbackGrad = ctx.createLinearGradient(0, 0, w, h);
  if (cat.cover.grade === 'cool-slate') {
    fallbackGrad.addColorStop(0, '#d8ecff');
    fallbackGrad.addColorStop(0.5, '#89b4e0');
    fallbackGrad.addColorStop(1, '#5882b4');
  } else {
    fallbackGrad.addColorStop(0, '#f8efe4');
    fallbackGrad.addColorStop(0.55, '#dfc3a7');
    fallbackGrad.addColorStop(1, '#b89477');
  }
  ctx.fillStyle = fallbackGrad;
  ctx.fillRect(0, 0, w, h);

  if (img) {
    drawCoverCropped(ctx, img, cat.cover.crop, w, h);

    // Gentle curve edge shading on outer surface
    if (!isReflection) {
      const edge = ctx.createLinearGradient(0, 0, w, 0);
      edge.addColorStop(0, 'rgba(10,12,18,.07)');
      edge.addColorStop(.36, 'rgba(10,12,18,0)');
      edge.addColorStop(1, 'rgba(10,12,18,.05)');
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

function drawSurfaceTitle(
  ctx: CanvasRenderingContext2D,
  cat: GalleryCategory,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 195px "Editorial Old", "PP Editorial Old", Georgia, serif`;
  ctx.letterSpacing = '0.012em';

  const text = cat.displayTitle; // "Work", "Fashion", "Journey"

  // Soft luminous ethereal glow matching reference etched glass title
  ctx.shadowColor = 'rgba(255, 255, 255, 0.92)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w * 0.485, h * 0.50);

  // Solid crisp foreground pass
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.fillText(text, w * 0.485, h * 0.50);

  // Delicate specular top highlight
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = -1;
  ctx.fillText(text, w * 0.485, h * 0.50);

  ctx.restore();
}

export function createWordmarkTexture(): {
  texture: THREE.CanvasTexture;
  aspect: number;
  dispose: () => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Exact "Editorial Old" Didone typography from aikawakenichi.com
    const targetWidth = canvas.width * 0.92;
    let fontSize = 230;
    ctx.font = `400 ${fontSize}px "Editorial Old", "PP Editorial Old", Georgia, serif`;
    const measured = ctx.measureText('PORTFOLIO').width;
    if (measured > 0) {
      fontSize = Math.round(fontSize * (targetWidth / measured));
      ctx.font = `400 ${fontSize}px "Editorial Old", "PP Editorial Old", Georgia, serif`;
    }

    ctx.fillStyle = '#08080a';
    ctx.fillText('PORTFOLIO', canvas.width * 0.5, canvas.height * 0.50);
    ctx.restore();
  };

  render();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      render();
      texture.needsUpdate = true;
    });
  }

  return {
    texture,
    aspect: canvas.width / canvas.height,
    dispose: () => texture.dispose(),
  };
}

export function createCategoryTextureBundle(
  cat: GalleryCategory,
  onReady: (thumbUrl: string) => void,
): CategoryTextureBundle {
  const outerCanvas = document.createElement('canvas');
  outerCanvas.width = PANEL_W;
  outerCanvas.height = PANEL_H;
  const outerCtx = outerCanvas.getContext('2d')!;

  const letteringCanvas = document.createElement('canvas');
  letteringCanvas.width = PANEL_W;
  letteringCanvas.height = PANEL_H;
  const letteringCtx = letteringCanvas.getContext('2d')!;

  const reflectCanvas = document.createElement('canvas');
  reflectCanvas.width = 800;
  reflectCanvas.height = 352;
  const reflectCtx = reflectCanvas.getContext('2d')!;

  const innerCanvas = document.createElement('canvas');
  innerCanvas.width = 800;
  innerCanvas.height = 352;
  const innerCtx = innerCanvas.getContext('2d')!;

  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = 256;
  edgeCanvas.height = 64;
  const edgeCtx = edgeCanvas.getContext('2d')!;

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 112;
  thumbCanvas.height = 112;
  const thumbCtx = thumbCanvas.getContext('2d')!;

  const outerTex = new THREE.CanvasTexture(outerCanvas);
  outerTex.colorSpace = THREE.SRGBColorSpace;
  outerTex.anisotropy = 8;
  outerTex.minFilter = THREE.LinearMipmapLinearFilter;

  const letteringTex = new THREE.CanvasTexture(letteringCanvas);
  letteringTex.colorSpace = THREE.SRGBColorSpace;
  letteringTex.anisotropy = 8;
  letteringTex.minFilter = THREE.LinearMipmapLinearFilter;

  const reflectTex = new THREE.CanvasTexture(reflectCanvas);
  reflectTex.colorSpace = THREE.SRGBColorSpace;
  reflectTex.anisotropy = 2;

  const innerTex = new THREE.CanvasTexture(innerCanvas);
  innerTex.colorSpace = THREE.SRGBColorSpace;
  innerTex.anisotropy = 2;

  const edgeTex = new THREE.CanvasTexture(edgeCanvas);
  edgeTex.colorSpace = THREE.SRGBColorSpace;
  edgeTex.anisotropy = 2;

  let loadedImg: HTMLImageElement | null = null;
  let disposed = false;

  const render = () => {
    if (disposed) return;

    // 1. Clean photographic base for reflection
    paintCategoryBase(reflectCtx, cat, loadedImg, reflectCanvas.width, reflectCanvas.height, true);
    reflectTex.needsUpdate = true;

    // 2. Pure photographic artwork surface (WITHOUT embedded title!)
    paintCategoryBase(outerCtx, cat, loadedImg, PANEL_W, PANEL_H);
    outerTex.needsUpdate = true;

    // 3. Separate floating category lettering decal (alpha canvas)
    drawSurfaceTitle(letteringCtx, cat, PANEL_W, PANEL_H);
    letteringTex.needsUpdate = true;

    // 4. Inner surface: colored translucent glass
    innerCtx.clearRect(0, 0, innerCanvas.width, innerCanvas.height);
    innerCtx.drawImage(reflectCanvas, 0, 0);
    innerCtx.save();
    innerCtx.fillStyle = cat.theme.innerWall;
    innerCtx.fillRect(0, 0, innerCanvas.width, innerCanvas.height);
    innerCtx.restore();
    innerTex.needsUpdate = true;

    // 5. Glass edge & seam texture
    const edgeGrad = edgeCtx.createLinearGradient(0, 0, edgeCanvas.width, 0);
    edgeGrad.addColorStop(0, cat.theme.edgeColor);
    edgeGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.82)');
    edgeGrad.addColorStop(0.52, cat.theme.glassHighlight);
    edgeGrad.addColorStop(1, cat.theme.edgeColor);
    edgeCtx.fillStyle = edgeGrad;
    edgeCtx.fillRect(0, 0, edgeCanvas.width, edgeCanvas.height);
    edgeTex.needsUpdate = true;

    // 6. Dock thumbnail
    thumbCtx.clearRect(0, 0, 112, 112);
    thumbCtx.drawImage(
      reflectCanvas,
      reflectCanvas.width * 0.25,
      0,
      reflectCanvas.width * 0.5,
      reflectCanvas.height,
      0,
      0,
      112,
      112,
    );
    onReady(thumbCanvas.toDataURL('image/jpeg', 0.84));
  };

  render();

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      if (!disposed) render();
    });
  }

  if (cat.cover.type === 'image') {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImg = img;
      render();
    };
    img.src = cat.cover.src;
  }

  let video: HTMLVideoElement | undefined;
  let playing = false;
  let lastFrame = -1;
  if (cat.cover.type === 'image' && cat.cover.videoSrc) {
    video = document.createElement('video');
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'none';
    video.src = cat.cover.videoSrc;
  }

  function updatePlayback(active: boolean) {
    if (!video) return;
    if (playing !== active) {
      playing = active;
      if (active) void video.play().catch(() => {});
      else video.pause();
    }
    if (!active || video.readyState < 2 || video.currentTime === lastFrame) return;
    lastFrame = video.currentTime;
    const height = video.videoWidth * PANEL_H / PANEL_W;
    const top = (video.videoHeight - height) / 2;
    for (const [ctx, texture] of [[outerCtx, outerTex], [reflectCtx, reflectTex], [innerCtx, innerTex]] as const) {
      ctx.drawImage(video, 0, top, video.videoWidth, height, 0, 0, ctx.canvas.width, ctx.canvas.height);
      if (ctx === innerCtx) {
        ctx.fillStyle = cat.theme.innerWall;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      texture.needsUpdate = true;
    }
  }

  return {
    updatePlayback: video ? updatePlayback : undefined,
    outerTex,
    letteringTex,
    reflectTex,
    innerTex,
    edgeTex,
    thumbUrl: thumbCanvas.toDataURL('image/jpeg', 0.8),
    dispose: () => {
      disposed = true;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      outerTex.dispose();
      letteringTex.dispose();
      reflectTex.dispose();
      innerTex.dispose();
      edgeTex.dispose();
    },
  };
}

// Cached authored editorial plates for items without standalone photographic captures.
const plateCache = new Map<PlateId, string>();

export function getEditorialPlateUrl(plateId: PlateId): string {
  const existing = plateCache.get(plateId);
  if (existing) return existing;

  const c = document.createElement('canvas');
  c.width = 1280;
  c.height = 820;
  const ctx = c.getContext('2d')!;
  const w = c.width;
  const h = c.height;

  if (plateId === 'ffcs') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ebefff');
    g.addColorStop(1, '#dce3fb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle paper grain grid lines
    ctx.strokeStyle = 'rgba(42, 58, 118, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 80; x < w; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    ctx.fillStyle = '#202d59';
    ctx.font = '600 28px "DM Sans", sans-serif';
    ctx.fillText('ffcs', 84, 118);
    ctx.fillStyle = '#6e63d5';
    ctx.fillText('easy.', 138, 118);

    ctx.fillStyle = '#1f2b54';
    ctx.font = '400 72px "Italiana", Georgia, serif';
    ctx.fillText('Less clash.', 84, 240);
    ctx.fillText('More clarity.', 84, 322);

    ctx.fillStyle = 'rgba(32, 45, 89, 0.62)';
    ctx.font = '400 18px "DM Mono", monospace';
    ctx.fillText('EQUAL COLLABORATION · ISHANT & PRISHA SHARMA', 84, 382);

    // Architectural timetable blocks
    const cols = 6;
    const rows = 5;
    const startX = 630;
    const startY = 160;
    const cellW = 86;
    const cellH = 74;
    const gap = 12;
    const labels: Record<string, string> = {
      '0-1': 'CSE',
      '0-4': 'MAT',
      '1-2': 'PHY',
      '2-0': 'DSA',
      '2-3': 'CSE',
      '3-1': 'LAB',
      '3-4': 'MAT',
      '4-2': 'ENG',
    };
    const fills = ['#ffffff', '#c1d2f7', '#d2c8f4', '#bfe0ec'];
    ctx.save();
    ctx.translate(startX + 260, startY + 210);
    ctx.rotate(-0.045);
    ctx.translate(-(startX + 260), -(startY + 210));
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (cellW + gap);
        const y = startY + r * (cellH + gap);
        const key = `${r}-${col}`;
        const active = Boolean(labels[key]);
        ctx.fillStyle = active ? fills[(r + col) % 3 + 1] : 'rgba(255,255,255,0.68)';
        ctx.beginPath();
        ctx.roundRect(x, y, cellW, cellH, 10);
        ctx.fill();
        if (active) {
          ctx.fillStyle = '#253263';
          ctx.font = '500 16px "DM Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labels[key], x + cellW / 2, y + cellH / 2);
        }
      }
    }
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(32, 45, 89, 0.56)';
    ctx.font = '400 16px "DM Mono", monospace';
    ctx.fillText('BROWSER TIMETABLE ENGINE · PDF IMPORT · CLASH-FREE ALTERNATIVES', 84, h - 78);
  } else if (plateId === 'grip') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#dde4d5');
    g.addColorStop(1, '#c3ceb7');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle light halo
    const halo = ctx.createRadialGradient(w * 0.5, h * 0.48, 40, w * 0.5, h * 0.48, 360);
    halo.addColorStop(0, 'rgba(255,255,255,0.58)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // Sculpted bottle silhouette
    ctx.save();
    ctx.translate(w * 0.5, h * 0.52);
    ctx.rotate(0.14);
    ctx.shadowColor = 'rgba(42, 56, 32, 0.25)';
    ctx.shadowBlur = 55;
    ctx.shadowOffsetX = 28;
    ctx.shadowOffsetY = 38;
    const bg = ctx.createLinearGradient(-84, 0, 84, 0);
    bg.addColorStop(0, '#728862');
    bg.addColorStop(0.36, '#aebc9f');
    bg.addColorStop(0.72, '#869a76');
    bg.addColorStop(1, '#667b56');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(-84, -210, 168, 430, [34, 34, 48, 48]);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    const cap = ctx.createLinearGradient(-56, 0, 56, 0);
    cap.addColorStop(0, '#49583e');
    cap.addColorStop(0.5, '#6e8160');
    cap.addColorStop(1, '#445339');
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.roundRect(-56, -258, 112, 58, [16, 16, 6, 6]);
    ctx.fill();

    ctx.fillStyle = '#f4f6ee';
    ctx.font = '500 22px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G R I P', 0, -24);
    ctx.font = '400 26px "DM Mono", monospace';
    ctx.fillText('24°', 0, 118);
    ctx.restore();

    ctx.fillStyle = '#3f4e3d';
    ctx.font = '400 17px "DM Mono", monospace';
    ctx.fillText('INTERACTIVE PRODUCT CONCEPT · TEMPERATURE & MOTION STUDY', 76, h - 72);
  } else if (plateId === 'katosi') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#e3d8ef');
    g.addColorStop(1, '#cfbddd');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.strokeStyle = 'rgba(84, 56, 104, 0.32)';
    ctx.lineWidth = 2;
    for (const [rx, ry, rot] of [
      [280, 130, 0.42],
      [280, 130, -0.46],
      [230, 230, 0.1],
    ]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, rot, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#4c3260';
    ctx.font = '400 220px "Italiana", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('k.', 0, 12);
    ctx.restore();

    ctx.fillStyle = '#564366';
    ctx.font = '400 17px "DM Mono", monospace';
    ctx.fillText('KATOSI · MUSIC & CREATIVE DEVELOPMENT · CODE BY ISHANT, REVIEW WITH SHIVI', 76, h - 72);
  } else if (plateId === 'ai-blog') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f0eff7');
    g.addColorStop(1, '#e1dff1');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#6f6685';
    ctx.font = '400 17px "DM Mono", monospace';
    ctx.fillText('CLAPINGO / INTERNAL CREATIVE AUTOMATION · ILLUSTRATIVE DIAGRAM', 84, 96);

    ctx.fillStyle = '#252047';
    ctx.font = '400 76px "Italiana", Georgia, serif';
    ctx.fillText('More making.', 84, 210);
    ctx.fillText('Less repetition.', 84, 294);

    // 3 workflow steps
    const steps = ['01  BRAND BRIEF', '02  GEMINI GENERATION', '03  HUMAN REVIEW'];
    steps.forEach((label, idx) => {
      const bx = 84 + idx * 380;
      const by = 408;
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.strokeStyle = 'rgba(116, 105, 138, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, 320, 118, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#362d59';
      ctx.font = '500 17px "DM Mono", monospace';
      ctx.fillText(label, bx + 28, by + 66);

      if (idx < 2) {
        ctx.strokeStyle = 'rgba(116, 105, 138, 0.45)';
        ctx.beginPath();
        ctx.moveTo(bx + 332, by + 59);
        ctx.lineTo(bx + 368, by + 59);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#8b829e';
    ctx.font = '400 84px "DM Sans", sans-serif';
    ctx.fillText('120', 84, 675);
    ctx.fillStyle = '#4e3f72';
    ctx.fillText('→  15 min', 252, 675);
    ctx.fillStyle = 'rgba(54, 45, 89, 0.55)';
    ctx.font = '400 16px "DM Mono", monospace';
    ctx.fillText('REPORTED DAILY BLOG-VISUAL WORKFLOW REDUCTION (87.5%)', 84, 738);
  } else if (plateId === 'ai-thumb') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ece8f7');
    g.addColorStop(1, '#dcd3ee');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#6f6387';
    ctx.font = '400 17px "DM Mono", monospace';
    ctx.fillText('THUMBNAIL ENGINE · ILLUSTRATIVE SYSTEM PLATE', 84, 96);

    ctx.fillStyle = '#251e42';
    ctx.font = '400 74px "Italiana", Georgia, serif';
    ctx.fillText('Brand-consistent', 84, 206);
    ctx.fillText('visual framing.', 84, 286);

    // Three 16:9 composition frames representing template grammar
    const palettes = [
      ['#2d244c', '#7c65c9'],
      ['#1e2e3d', '#5d92b5'],
      ['#3d2433', '#b8688c'],
    ];
    palettes.forEach(([c1, c2], i) => {
      const fx = 84 + i * 380;
      const fy = 385;
      const fg = ctx.createLinearGradient(fx, fy, fx + 340, fy + 210);
      fg.addColorStop(0, c1);
      fg.addColorStop(1, c2);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.roundRect(fx, fy, 340, 210, 14);
      ctx.fill();

      // Composition safe-area guides
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx + 24, fy + 24, 292, 162);
      ctx.beginPath();
      ctx.arc(fx + 236, fy + 105, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(fx + 44, fy + 74, 108, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.fillRect(fx + 44, fy + 100, 82, 10);
      ctx.fillRect(fx + 44, fy + 122, 64, 10);
    });

    ctx.fillStyle = 'rgba(37, 30, 66, 0.56)';
    ctx.font = '400 16px "DM Mono", monospace';
    ctx.fillText('REACT · TYPESCRIPT · SHARED BRAND RULES · HUMAN FINAL SELECTION', 84, h - 76);
  } else {
    // ai-n8n
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f5eceb');
    g.addColorStop(1, '#eadad8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#825d5a';
    ctx.font = '400 17px "DM Mono", monospace';
    ctx.fillText('N8N CONNECTED WORKFLOWS · ILLUSTRATIVE PIPELINE DIAGRAM', 84, 96);

    ctx.fillStyle = '#382220';
    ctx.font = '400 74px "Italiana", Georgia, serif';
    ctx.fillText('Structured handoffs', 84, 206);
    ctx.fillText('between tools.', 84, 286);

    const nodes = [
      { x: 160, y: 490, t: 'QUERY', s: 'Category & location' },
      { x: 470, y: 430, t: 'DISCOVER', s: 'Maps via Apify' },
      { x: 780, y: 515, t: 'DEDUPLICATE', s: 'Clean records' },
      { x: 1080, y: 455, t: 'EXPORT', s: 'Excel spreadsheet' },
    ];

    ctx.strokeStyle = 'rgba(156, 94, 88, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const cur = nodes[i];
      const mx = (prev.x + cur.x) * 0.5;
      ctx.bezierCurveTo(mx, prev.y, mx, cur.y, cur.x, cur.y);
    }
    ctx.stroke();

    for (const n of nodes) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(156, 94, 88, 0.34)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(n.x - 108, n.y - 54, 216, 108, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3a2220';
      ctx.font = '600 17px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(n.t, n.x, n.y - 6);
      ctx.fillStyle = '#8b6a67';
      ctx.font = '400 15px "DM Sans", sans-serif';
      ctx.fillText(n.s, n.x, n.y + 24);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(56, 34, 32, 0.56)';
    ctx.font = '400 16px "DM Mono", monospace';
    ctx.fillText('BUSINESS DISCOVERY · DEDUPLICATION · LLM INTEGRATIONS · STRUCTURED LEADS', 84, h - 76);
  }

  // Subtle architectural gallery paper grain & framing margin across all authored plates
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 16, 20, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.restore();
  addSubtleFilmGrain(ctx, w, h, 5);

  const url = c.toDataURL('image/png');
  plateCache.set(plateId, url);
  return url;
}
