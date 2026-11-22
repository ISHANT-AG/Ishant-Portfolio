import * as THREE from 'three';
import patternsData from './voronoi_patterns.json';

export interface VoronoiCell {
  id: number;
  pid: number;
  cx: number;
  cy: number;
  vertices: number[];
}

export interface VoronoiPattern {
  meta: {
    count: number;
    width: number;
    height: number;
    thick: number;
    seed: number;
  };
  cells: VoronoiCell[];
}

const patterns = patternsData as Record<string, VoronoiPattern>;

function crossProduct2D(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
  return (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
}

function pointInTriangle(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
): boolean {
  const d1 = crossProduct2D(x1, y1, x2, y2, px, py);
  const d2 = crossProduct2D(x2, y2, x3, y3, px, py);
  const d3 = crossProduct2D(x3, y3, x1, y1, px, py);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function isEar(poly: [number, number][], indices: number[], count: number, earIndex: number): boolean {
  const prevIdx = indices[(earIndex - 1 + count) % count];
  const currIdx = indices[earIndex];
  const nextIdx = indices[(earIndex + 1) % count];
  const [px, py] = poly[prevIdx];
  const [cx, cy] = poly[currIdx];
  const [nx, ny] = poly[nextIdx];

  if (crossProduct2D(px, py, cx, cy, nx, ny) <= 0) return false;

  for (let i = 0; i < count; i++) {
    const idx = indices[i];
    if (idx === prevIdx || idx === currIdx || idx === nextIdx) continue;
    const [tx, ty] = poly[idx];
    if (pointInTriangle(tx, ty, px, py, cx, cy, nx, ny)) return false;
  }
  return true;
}

export function triangulate2D(poly: [number, number][]): [number, number, number][] {
  const len = poly.length;
  if (len < 3) return [];
  if (len === 3) return [[0, 1, 2]];
  const triangles: [number, number, number][] = [];
  const indices = Array.from({ length: len }, (_, i) => i);
  let remaining = len;
  let safety = len * 2 + 10;

  while (remaining > 3 && safety-- > 0) {
    let earFound = false;
    for (let i = 0; i < remaining; i++) {
      if (!isEar(poly, indices, remaining, i)) continue;
      const prev = indices[(i - 1 + remaining) % remaining];
      const curr = indices[i];
      const next = indices[(i + 1) % remaining];
      triangles.push([prev, curr, next]);
      indices.splice(i, 1);
      remaining--;
      earFound = true;
      break;
    }
    if (!earFound) break;
  }
  if (remaining === 3) {
    triangles.push([indices[0], indices[1], indices[2]]);
  }
  return triangles;
}

function edgeTag(x1: number, y1: number, x2: number, y2: number, halfW: number, halfH: number): number {
  const eps = 5e-4;
  const isLeft = Math.abs(x1 + halfW) <= eps && Math.abs(x2 + halfW) <= eps;
  const isRight = Math.abs(x1 - halfW) <= eps && Math.abs(x2 - halfW) <= eps;
  const isTop = Math.abs(y1 - halfH) <= eps && Math.abs(y2 - halfH) <= eps;
  const isBottom = Math.abs(y1 + halfH) <= eps && Math.abs(y2 + halfH) <= eps;
  return isTop ? 0.35 : isBottom ? 0.15 : isLeft || isRight ? 0.25 : 0;
}

function subdivideGeometryX(geo: THREE.BufferGeometry, stepX: number): THREE.BufferGeometry {
  const pos = geo.attributes.position.array as Float32Array;
  const norm = geo.attributes.normal.array as Float32Array;
  const uv = geo.attributes.uv.array as Float32Array;
  const col = geo.attributes.color.array as Float32Array;

  const outPos: number[] = [];
  const outNorm: number[] = [];
  const outUv: number[] = [];
  const outCol: number[] = [];

  const triCount = pos.length / 9;

  interface Vert {
    p: [number, number, number];
    n: [number, number, number];
    u: [number, number];
    c: [number, number, number, number];
  }

  function lerpVert(v1: Vert, v2: Vert, t: number): Vert {
    return {
      p: [v1.p[0] + (v2.p[0] - v1.p[0]) * t, v1.p[1] + (v2.p[1] - v1.p[1]) * t, v1.p[2] + (v2.p[2] - v1.p[2]) * t],
      n: [v1.n[0] + (v2.n[0] - v1.n[0]) * t, v1.n[1] + (v2.n[1] - v1.n[1]) * t, v1.n[2] + (v2.n[2] - v1.n[2]) * t],
      u: [v1.u[0] + (v2.u[0] - v1.u[0]) * t, v1.u[1] + (v2.u[1] - v1.u[1]) * t],
      c: [
        v1.c[0] + (v2.c[0] - v1.c[0]) * t,
        v1.c[1] + (v2.c[1] - v1.c[1]) * t,
        v1.c[2] + (v2.c[2] - v1.c[2]) * t,
        v1.c[3] + (v2.c[3] - v1.c[3]) * t,
      ],
    };
  }

  function clipPolygon(verts: Vert[], planeX: number, keepLess: boolean): Vert[] {
    if (verts.length < 2) return verts;
    const res: Vert[] = [];
    const eps = 1e-9;
    for (let i = 0; i < verts.length; i++) {
      const vCurr = verts[i];
      const vNext = verts[(i + 1) % verts.length];
      const currIn = keepLess ? vCurr.p[0] <= planeX + eps : vCurr.p[0] >= planeX - eps;
      const nextIn = keepLess ? vNext.p[0] <= planeX + eps : vNext.p[0] >= planeX - eps;
      if (currIn) res.push(vCurr);
      if (currIn !== nextIn) {
        const dx = vNext.p[0] - vCurr.p[0];
        const t = Math.abs(dx) > eps ? (planeX - vCurr.p[0]) / dx : 0;
        res.push(lerpVert(vCurr, vNext, Math.max(0, Math.min(1, t))));
      }
    }
    return res;
  }

  function emitPolygon(verts: Vert[]) {
    if (verts.length < 3) return;
    const v0 = verts[0];
    for (let i = 1; i < verts.length - 1; i++) {
      emitTri(v0, verts[i], verts[i + 1]);
    }
  }

  function emitTri(v0: Vert, v1: Vert, v2: Vert) {
    for (const v of [v0, v1, v2]) {
      outPos.push(...v.p);
      outNorm.push(...v.n);
      outUv.push(...v.u);
      outCol.push(...v.c);
    }
  }

  for (let t = 0; t < triCount; t++) {
    const poly: Vert[] = [0, 1, 2].map((i) => ({
      p: [pos[t * 9 + i * 3], pos[t * 9 + i * 3 + 1], pos[t * 9 + i * 3 + 2]],
      n: [norm[t * 9 + i * 3], norm[t * 9 + i * 3 + 1], norm[t * 9 + i * 3 + 2]],
      u: [uv[t * 6 + i * 2], uv[t * 6 + i * 2 + 1]],
      c: [col[t * 12 + i * 4], col[t * 12 + i * 4 + 1], col[t * 12 + i * 4 + 2], col[t * 12 + i * 4 + 3]],
    }));

    const xs = poly.map((v) => v.p[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const firstPlane = Math.ceil((minX + 1e-9) / stepX) * stepX;
    const planes: number[] = [];
    for (let p = firstPlane; p < maxX - 1e-9; p += stepX) {
      planes.push(p);
    }

    if (planes.length === 0) {
      emitTri(poly[0], poly[1], poly[2]);
      continue;
    }

    let currentPoly = poly;
    for (const px of planes) {
      emitPolygon(clipPolygon(currentPoly, px, true));
      currentPoly = clipPolygon(currentPoly, px, false);
    }
    emitPolygon(currentPoly);
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.BufferAttribute(new Float32Array(outPos), 3));
  result.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(outNorm), 3));
  result.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(outUv), 2));
  result.setAttribute('color', new THREE.BufferAttribute(new Float32Array(outCol), 4));
  return result;
}

export function buildVoronoiGeometry(
  patternKey: string,
  targetWidth: number,
  targetHeight: number,
  targetThickness: number = 0.05,
  subdivideX: number = 0.04,
): THREE.BufferGeometry {
  const pattern = patterns[patternKey] || patterns.a;
  const { meta, cells } = pattern;
  const baseW = meta.width;
  const baseH = meta.height;
  const scaleX = targetWidth / baseW;
  const scaleY = targetHeight / baseH;
  const halfThick = targetThickness * 0.5;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];

  function addVert(
    pos: [number, number, number],
    norm: [number, number, number],
    uv: [number, number],
    col: [number, number, number, number],
  ) {
    positions.push(...pos);
    normals.push(...norm);
    uvs.push(...uv);
    colors.push(...col);
  }

  function uvFromPos(x: number, y: number): [number, number] {
    return [(x + baseW * 0.5) / baseW, 1 - (y + baseH * 0.5) / baseH];
  }

  for (const cell of cells) {
    const { pid, cx, cy, vertices } = cell;
    const centerNormX = (cx + baseW * 0.5) / baseW;
    const centerNormY = (cy + baseH * 0.5) / baseH;

    const poly2D: [number, number][] = [];
    for (let i = 0; i < vertices.length; i += 2) {
      poly2D.push([vertices[i], vertices[i + 1]]);
    }

    const triangles = triangulate2D(poly2D);

    // 1. Front faces (z = +halfThick, normal = 0, 0, 1)
    for (const [i0, i1, i2] of triangles) {
      const [x0, y0] = poly2D[i0];
      const [x1, y1] = poly2D[i1];
      const [x2, y2] = poly2D[i2];
      const col: [number, number, number, number] = [pid, centerNormX, centerNormY, 1.0];
      addVert([x0 * scaleX, y0 * scaleY, halfThick], [0, 0, 1], uvFromPos(x0, y0), col);
      addVert([x1 * scaleX, y1 * scaleY, halfThick], [0, 0, 1], uvFromPos(x1, y1), col);
      addVert([x2 * scaleX, y2 * scaleY, halfThick], [0, 0, 1], uvFromPos(x2, y2), col);
    }

    // 2. Back faces (z = -halfThick, normal = 0, 0, -1)
    for (const [i0, i1, i2] of triangles) {
      const [x0, y0] = poly2D[i0];
      const [x1, y1] = poly2D[i1];
      const [x2, y2] = poly2D[i2];
      const col: [number, number, number, number] = [pid, centerNormX, centerNormY, -1.0];
      addVert([x0 * scaleX, y0 * scaleY, -halfThick], [0, 0, -1], uvFromPos(x0, y0), col);
      addVert([x2 * scaleX, y2 * scaleY, -halfThick], [0, 0, -1], uvFromPos(x2, y2), col);
      addVert([x1 * scaleX, y1 * scaleY, -halfThick], [0, 0, -1], uvFromPos(x1, y1), col);
    }

    // 3. Side walls between Voronoi cells
    const vCount = poly2D.length;
    for (let i = 0; i < vCount; i++) {
      const [ax, ay] = poly2D[i];
      const [bx, by] = poly2D[(i + 1) % vCount];
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dy / len;
      const ny = -dx / len;

      const tag = edgeTag(ax, ay, bx, by, baseW * 0.5, baseH * 0.5);
      const col: [number, number, number, number] = [pid, centerNormX, centerNormY, tag];

      const uA = i / vCount;
      const uB = (i + 1) / vCount;

      const p0: [number, number, number] = [ax * scaleX, ay * scaleY, halfThick];
      const p1: [number, number, number] = [bx * scaleX, by * scaleY, halfThick];
      const p2: [number, number, number] = [bx * scaleX, by * scaleY, -halfThick];
      const p3: [number, number, number] = [ax * scaleX, ay * scaleY, -halfThick];

      const norm: [number, number, number] = [nx, ny, 0];

      // Tri 1
      addVert(p0, norm, [uA, 1], col);
      addVert(p1, norm, [uB, 1], col);
      addVert(p2, norm, [uB, 0], col);

      // Tri 2
      addVert(p0, norm, [uA, 1], col);
      addVert(p2, norm, [uB, 0], col);
      addVert(p3, norm, [uA, 0], col);
    }
  }

  const baseGeo = new THREE.BufferGeometry();
  baseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  baseGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  baseGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  baseGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4));

  return subdivideX > 0 ? subdivideGeometryX(baseGeo, subdivideX) : baseGeo;
}
