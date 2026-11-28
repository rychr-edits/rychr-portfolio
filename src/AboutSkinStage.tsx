import React, { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';

interface SkinCell {
  part: 'head' | 'hat' | 'torso' | 'jacket' | 'rArm' | 'rSleeve' | 'lArm' | 'lSleeve';
  isOverlay: boolean;
  corners: [number, number, number][];
  normal: [number, number, number];
  center: [number, number, number];
  r: number;
  g: number;
  b: number;
}

type FaceDir = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

interface BoxSpec {
  part: SkinCell['part'];
  isOverlay: boolean;
  size: [number, number, number];
  texDims: [number, number, number];
  offset: [number, number, number];
  tiltX?: number;
  tiltZ?: number;
  pivot?: [number, number, number];
  uv: Record<FaceDir, [number, number, number, number]>;
}

function rotateVec(
  v: [number, number, number],
  rx: number,
  ry: number,
  rz: number
): [number, number, number] {
  let [x, y, z] = v;

  if (rz !== 0) {
    const cz = Math.cos(rz);
    const sz = Math.sin(rz);
    const nx = x * cz - y * sz;
    const ny = x * sz + y * cz;
    x = nx;
    y = ny;
  }

  if (rx !== 0) {
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    const ny = y * cx - z * sx;
    const nz = y * sx + z * cx;
    y = ny;
    z = nz;
  }

  if (ry !== 0) {
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const nx = x * cy + z * sy;
    const nz = -x * sy + z * cy;
    x = nx;
    z = nz;
  }

  return [x, y, z];
}

function buildSkinCells(imgData: ImageData, isSlim: boolean): SkinCell[] {
  const { data, width } = imgData;
  const armW = isSlim ? 3 : 4;
  const armCenterX = 4 + armW / 2;

  const boxes: BoxSpec[] = [
    {
      part: 'head',
      isOverlay: false,
      size: [8, 8, 8],
      texDims: [8, 8, 8],
      offset: [0, 10, 0],
      tiltX: -0.04,
      uv: {
        front: [8, 8, 8, 8],
        back: [24, 8, 8, 8],
        right: [0, 8, 8, 8],
        left: [16, 8, 8, 8],
        top: [8, 0, 8, 8],
        bottom: [16, 0, 8, 8],
      },
    },
    {
      part: 'hat',
      isOverlay: true,
      size: [8.8, 8.8, 8.8],
      texDims: [8, 8, 8],
      offset: [0, 10, 0],
      tiltX: -0.04,
      uv: {
        front: [40, 8, 8, 8],
        back: [56, 8, 8, 8],
        right: [32, 8, 8, 8],
        left: [48, 8, 8, 8],
        top: [40, 0, 8, 8],
        bottom: [48, 0, 8, 8],
      },
    },
    {
      part: 'torso',
      isOverlay: false,
      size: [8, 12, 4],
      texDims: [8, 12, 4],
      offset: [0, 0, 0],
      uv: {
        front: [20, 20, 8, 12],
        back: [32, 20, 8, 12],
        right: [16, 20, 4, 12],
        left: [28, 20, 4, 12],
        top: [20, 16, 8, 4],
        bottom: [28, 16, 8, 4],
      },
    },
    {
      part: 'jacket',
      isOverlay: true,
      size: [8.55, 12.55, 4.55],
      texDims: [8, 12, 4],
      offset: [0, 0, 0],
      uv: {
        front: [20, 36, 8, 12],
        back: [32, 36, 8, 12],
        right: [16, 36, 4, 12],
        left: [28, 36, 4, 12],
        top: [20, 32, 8, 4],
        bottom: [28, 32, 8, 4],
      },
    },
    {
      part: 'rArm',
      isOverlay: false,
      size: [armW, 12, 4],
      texDims: [armW, 12, 4],
      offset: [-armCenterX, 0, 0],
      pivot: [-armCenterX, 5, 0],
      tiltX: 0.08,
      tiltZ: -0.055,
      uv: {
        front: [44, 20, armW, 12],
        right: [40, 20, 4, 12],
        left: [44 + armW, 20, 4, 12],
        back: [44 + armW + 4, 20, armW, 12],
        top: [44, 16, armW, 4],
        bottom: [44 + armW, 16, armW, 4],
      },
    },
    {
      part: 'rSleeve',
      isOverlay: true,
      size: [armW + 0.55, 12.55, 4.55],
      texDims: [armW, 12, 4],
      offset: [-armCenterX, 0, 0],
      pivot: [-armCenterX, 5, 0],
      tiltX: 0.08,
      tiltZ: -0.055,
      uv: {
        front: [44, 36, armW, 12],
        right: [40, 36, 4, 12],
        left: [44 + armW, 36, 4, 12],
        back: [44 + armW + 4, 36, armW, 12],
        top: [44, 32, armW, 4],
        bottom: [44 + armW, 32, armW, 4],
      },
    },
    {
      part: 'lArm',
      isOverlay: false,
      size: [armW, 12, 4],
      texDims: [armW, 12, 4],
      offset: [armCenterX, 0, 0],
      pivot: [armCenterX, 5, 0],
      tiltX: -0.07,
      tiltZ: 0.055,
      uv: {
        front: [36, 52, armW, 12],
        right: [32, 52, 4, 12],
        left: [36 + armW, 52, 4, 12],
        back: [36 + armW + 4, 52, armW, 12],
        top: [36, 48, armW, 4],
        bottom: [36 + armW, 48, armW, 4],
      },
    },
    {
      part: 'lSleeve',
      isOverlay: true,
      size: [armW + 0.55, 12.55, 4.55],
      texDims: [armW, 12, 4],
      offset: [armCenterX, 0, 0],
      pivot: [armCenterX, 5, 0],
      tiltX: -0.07,
      tiltZ: 0.055,
      uv: {
        front: [52, 52, armW, 12],
        right: [48, 52, 4, 12],
        left: [52 + armW, 52, 4, 12],
        back: [52 + armW + 4, 52, armW, 12],
        top: [52, 48, armW, 4],
        bottom: [52 + armW, 48, armW, 4],
      },
    },
  ];

  const cells: SkinCell[] = [];
  const dirs: FaceDir[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

  for (const box of boxes) {
    const [sx, sy, sz] = box.size;
    const [ox, oy, oz] = box.offset;
    const rx = box.tiltX ?? 0;
    const rz = box.tiltZ ?? 0;
    const pivot = box.pivot ?? box.offset;

    const transformPoint = (pt: [number, number, number]): [number, number, number] => {
      const rel: [number, number, number] = [
        pt[0] + ox - pivot[0],
        pt[1] + oy - pivot[1],
        pt[2] + oz - pivot[2],
      ];
      const rotated = rotateVec(rel, rx, 0, rz);
      return [rotated[0] + pivot[0], rotated[1] + pivot[1], rotated[2] + pivot[2]];
    };

    for (const dir of dirs) {
      const [u0, v0, uw, vh] = box.uv[dir];
      const cellW = uw > 0 ? 1 / uw : 1;
      const cellH = vh > 0 ? 1 / vh : 1;

      for (let py = 0; py < vh; py++) {
        for (let px = 0; px < uw; px++) {
          const texX = u0 + px;
          const texY = v0 + py;
          const idx = (texY * width + texX) * 4;
          const a = data[idx + 3];
          if (a < 32) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const uA = px * cellW;
          const uB = (px + 1) * cellW;
          const vA = py * cellH;
          const vB = (py + 1) * cellH;

          let rawCorners: [number, number, number][];
          let rawNormal: [number, number, number];

          switch (dir) {
            case 'front': {
              const x0 = (-0.5 + uA) * sx;
              const x1 = (-0.5 + uB) * sx;
              const y0 = (0.5 - vA) * sy;
              const y1 = (0.5 - vB) * sy;
              const z = 0.5 * sz;
              rawCorners = [
                [x0, y0, z],
                [x1, y0, z],
                [x1, y1, z],
                [x0, y1, z],
              ];
              rawNormal = [0, 0, 1];
              break;
            }
            case 'back': {
              const x0 = (0.5 - uA) * sx;
              const x1 = (0.5 - uB) * sx;
              const y0 = (0.5 - vA) * sy;
              const y1 = (0.5 - vB) * sy;
              const z = -0.5 * sz;
              rawCorners = [
                [x0, y0, z],
                [x1, y0, z],
                [x1, y1, z],
                [x0, y1, z],
              ];
              rawNormal = [0, 0, -1];
              break;
            }
            case 'right': {
              const z0 = (-0.5 + uA) * sz;
              const z1 = (-0.5 + uB) * sz;
              const y0 = (0.5 - vA) * sy;
              const y1 = (0.5 - vB) * sy;
              const x = -0.5 * sx;
              rawCorners = [
                [x, y0, z0],
                [x, y0, z1],
                [x, y1, z1],
                [x, y1, z0],
              ];
              rawNormal = [-1, 0, 0];
              break;
            }
            case 'left': {
              const z0 = (0.5 - uA) * sz;
              const z1 = (0.5 - uB) * sz;
              const y0 = (0.5 - vA) * sy;
              const y1 = (0.5 - vB) * sy;
              const x = 0.5 * sx;
              rawCorners = [
                [x, y0, z0],
                [x, y0, z1],
                [x, y1, z1],
                [x, y1, z0],
              ];
              rawNormal = [1, 0, 0];
              break;
            }
            case 'top': {
              const x0 = (-0.5 + uA) * sx;
              const x1 = (-0.5 + uB) * sx;
              const z0 = (-0.5 + vA) * sz;
              const z1 = (-0.5 + vB) * sz;
              const y = 0.5 * sy;
              rawCorners = [
                [x0, y, z0],
                [x1, y, z0],
                [x1, y, z1],
                [x0, y, z1],
              ];
              rawNormal = [0, 1, 0];
              break;
            }
            case 'bottom': {
              const x0 = (-0.5 + uA) * sx;
              const x1 = (-0.5 + uB) * sx;
              const z0 = (0.5 - vA) * sz;
              const z1 = (0.5 - vB) * sz;
              const y = -0.5 * sy;
              rawCorners = [
                [x0, y, z0],
                [x1, y, z0],
                [x1, y, z1],
                [x0, y, z1],
              ];
              rawNormal = [0, -1, 0];
              break;
            }
          }

          const corners = rawCorners.map(transformPoint);
          const normal = rotateVec(rawNormal, rx, 0, rz);
          const center: [number, number, number] = [
            (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) * 0.25,
            (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) * 0.25,
            (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) * 0.25,
          ];

          cells.push({
            part: box.part,
            isOverlay: box.isOverlay,
            corners,
            normal,
            center,
            r,
            g,
            b,
          });
        }
      }
    }
  }

  return cells;
}

export const AboutSkinStage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<SkinCell[]>([]);

  const [isLayersExpanded, setIsLayersExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stateRef = useRef({
    targetYaw: -0.42,
    currentYaw: -0.42,
    dragOffsetYaw: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartYaw: 0,
    explodeTarget: 0,
    explodeCurrent: 0,
    isHovered: false,
    inView: true,
  });

  useEffect(() => {
    stateRef.current.explodeTarget = isLayersExpanded || stateRef.current.isHovered ? 1 : 0;
  }, [isLayersExpanded]);

  // Load Ray's Minecraft Skin once into crisp 2D geometry
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = '/assets/aistudio/raychristo_ea864ecd.png';
    img.onload = () => {
      if (!active) return;
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);

      // Detect 3px slim arms vs 4px classic arms cleanly
      let col54HasPixels = false;
      for (let y = 20; y < 32; y++) {
        if (imgData.data[(y * img.width + 54) * 4 + 3] > 20) {
          col54HasPixels = true;
          break;
        }
      }
      cellsRef.current = buildSkinCells(imgData, !col54HasPixels);
    };
    return () => {
      active = false;
    };
  }, []);

  // Scroll-driven smooth character spin + IntersectionObserver culling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScrollYaw = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const raw = (vh * 0.92 - rect.top) / (vh * 0.72);
      const t = Math.max(0, Math.min(1, raw));
      const smooth = t * t * (3 - 2 * t);
      // Sweeps gracefully from back-right (-2.55 rad) to clean hero front-three-quarter (-0.34 rad)
      stateRef.current.targetYaw = -2.55 + smooth * 2.21;
    };

    updateScrollYaw();
    window.addEventListener('scroll', updateScrollYaw, { passive: true });
    window.addEventListener('resize', updateScrollYaw, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          stateRef.current.inView = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', updateScrollYaw);
      window.removeEventListener('resize', updateScrollYaw);
      observer?.disconnect();
    };
  }, []);

  // Ultra-lightweight Canvas 2D Painter's Algorithm Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    const syncCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(260, Math.round(rect.width));
      const h = Math.max(320, Math.round(rect.height));
      if (w !== lastWidth || h !== lastHeight) {
        lastWidth = w;
        lastHeight = h;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return { w, h };
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = (now: number) => {
      rafId = requestAnimationFrame(renderFrame);
      const st = stateRef.current;
      if (!st.inView) return;

      const cells = cellsRef.current;
      if (!cells.length) return;

      const { w, h } = syncCanvasSize();

      // Smooth spring interpolation
      const goalYaw = st.targetYaw + st.dragOffsetYaw;
      st.currentYaw += (goalYaw - st.currentYaw) * 0.14;
      st.explodeCurrent += (st.explodeTarget - st.explodeCurrent) * 0.13;

      const floatY = reducedMotion ? 0 : Math.sin(now * 0.0018) * 0.26;
      const yaw = st.currentYaw;
      const pitch = -0.08;
      const explode = st.explodeCurrent;

      ctx.clearRect(0, 0, w, h);

      // Subtle cool studio radial backlight directly behind dark outfit
      const cx = w * 0.5;
      const cy = h * 0.53;
      const halo = ctx.createRadialGradient(cx, cy - h * 0.04, 10, cx, cy, Math.min(w, h) * 0.52);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      halo.addColorStop(0.45, 'rgba(215, 225, 255, 0.055)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Floor pedestal shadow ellipse
      ctx.save();
      ctx.translate(cx, cy + h * 0.31);
      ctx.scale(1, 0.28);
      const shadow = ctx.createRadialGradient(0, 0, 8, 0, 0, 96);
      shadow.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      shadow.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
      shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, 96, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const scale = Math.min(w, h) * 0.048;
      const fov = 56;

      interface ProjectedQuad {
        pts: [number, number][];
        depth: number;
        fill: string;
        alpha: number;
      }

      const projected: ProjectedQuad[] = [];

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // After Effects 3D Layer Explosion Offsets per Rig Layer
        let exX = 0;
        let exY = 0;
        let exZ = 0;
        if (explode > 0.002) {
          switch (cell.part) {
            case 'head':
              exY = 2.6 * explode;
              break;
            case 'hat':
              exY = 4.3 * explode;
              exZ = 1.6 * explode;
              break;
            case 'jacket':
              exZ = 2.2 * explode;
              break;
            case 'rArm':
              exX = -2.2 * explode;
              break;
            case 'rSleeve':
              exX = -3.8 * explode;
              exZ = 1.1 * explode;
              break;
            case 'lArm':
              exX = 2.2 * explode;
              break;
            case 'lSleeve':
              exX = 3.8 * explode;
              exZ = 1.1 * explode;
              break;
            default:
              break;
          }
        }

        // Rotate normal into view space for backface culling & studio rim lighting
        const nRot = rotateVec(cell.normal, pitch, yaw, 0);
        if (nRot[2] <= -0.14) continue;

        // Directional studio key light + rim edge highlight
        const keyDot = Math.max(
          0,
          nRot[0] * 0.38 + nRot[1] * 0.65 + nRot[2] * 0.66
        );
        const rim = Math.pow(Math.max(0, 1 - Math.abs(nRot[2])), 2.1) * 0.34;
        const light = 0.72 + keyDot * 0.42 + rim;

        // Subtle dark-jacket separation lift so black clothes never crush into #050505
        const isVeryDark = cell.r < 34 && cell.g < 34 && cell.b < 34;
        const lift = isVeryDark ? 14 + rim * 28 + keyDot * 12 : 0;

        const r = Math.min(255, Math.round(cell.r * light + lift));
        const g = Math.min(255, Math.round(cell.g * light + lift));
        const b = Math.min(255, Math.round(cell.b * light + lift * 1.05));

        const pts: [number, number][] = [];
        let sumZ = 0;
        let sxCenter = 0;
        let syCenter = 0;

        for (let k = 0; k < 4; k++) {
          const c = cell.corners[k];
          const pRot = rotateVec(
            [c[0] + exX, c[1] + exY + floatY - 4.0, c[2] + exZ],
            pitch,
            yaw,
            0
          );
          const dist = fov - pRot[2];
          const persp = (fov / Math.max(10, dist)) * scale;
          const sx = cx + pRot[0] * persp;
          const sy = cy - pRot[1] * persp;
          pts.push([sx, sy]);
          sxCenter += sx;
          syCenter += sy;
          sumZ += pRot[2];
        }

        sxCenter *= 0.25;
        syCenter *= 0.25;

        // Micro-pad outward 0.38px to eliminate subpixel seams cleanly
        for (let k = 0; k < 4; k++) {
          const dx = pts[k][0] - sxCenter;
          const dy = pts[k][1] - syCenter;
          const len = Math.hypot(dx, dy) || 1;
          pts[k][0] += (dx / len) * 0.38;
          pts[k][1] += (dy / len) * 0.38;
        }

        projected.push({
          pts,
          depth: sumZ * 0.25 + (cell.isOverlay ? 0.08 : 0),
          fill: `rgb(${r},${g},${b})`,
          alpha: 1,
        });
      }

      // Painter's sort back-to-front
      projected.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < projected.length; i++) {
        const q = projected[i];
        ctx.fillStyle = q.fill;
        ctx.beginPath();
        ctx.moveTo(q.pts[0][0], q.pts[0][1]);
        ctx.lineTo(q.pts[1][0], q.pts[1][1]);
        ctx.lineTo(q.pts[2][0], q.pts[2][1]);
        ctx.lineTo(q.pts[3][0], q.pts[3][1]);
        ctx.closePath();
        ctx.fill();
      }

      // Faint hairline After Effects layer callouts when split
      if (explode > 0.25) {
        const calloutAlpha = Math.min(0.6, (explode - 0.25) * 0.8);
        ctx.save();
        ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.strokeStyle = `rgba(255, 255, 255, ${calloutAlpha * 0.45})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${calloutAlpha})`;
        ctx.lineWidth = 1;

        const markers = [
          { label: '01 · Hair Overlay', y: cy - h * 0.26, side: -1 },
          { label: '02 · Jacket Layer', y: cy + h * 0.03, side: 1 },
        ];
        for (const m of markers) {
          const anchorX = cx + m.side * scale * 5.4;
          const endX = cx + m.side * scale * 9.8;
          ctx.beginPath();
          ctx.moveTo(anchorX, m.y);
          ctx.lineTo(endX, m.y);
          ctx.stroke();
          ctx.textAlign = m.side < 0 ? 'right' : 'left';
          ctx.fillText(m.label, endX + m.side * 6, m.y + 3);
        }
        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartYaw = stateRef.current.dragOffsetYaw;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stateRef.current.isDragging) return;
    const dx = e.clientX - stateRef.current.dragStartX;
    stateRef.current.dragOffsetYaw = stateRef.current.dragStartYaw + dx * 0.011;
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      data-s3d="card"
      data-s3d-depth="0.9"
      data-s3d-global-tilt="2.6"
      data-s3d-scale="1.02"
      data-s3d-tilt="5.0"
      onPointerEnter={() => {
        stateRef.current.isHovered = true;
        stateRef.current.explodeTarget = 1;
      }}
      onPointerLeave={() => {
        stateRef.current.isHovered = false;
        stateRef.current.explodeTarget = isLayersExpanded ? 1 : 0;
        handlePointerUp();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative h-[370px] sm:h-[410px] rounded-3xl bg-[#050505]/95 border border-white/12 overflow-hidden select-none touch-pan-y will-change-transform ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Faint Architectural Crosshair Grid Inside Studio Card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Minimal Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 pt-5">
        <div className="text-xs font-mono text-white/55 tracking-wide">
          Ray · Character Rig
        </div>
        <button
          type="button"
          onClick={() => setIsLayersExpanded((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
            isLayersExpanded
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-white/[0.04] text-white/75 border-white/15 hover:border-white/35 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isLayersExpanded ? 'Layers Split' : 'Split Layers'}</span>
        </button>
      </div>

      {/* Zero-Lag 2D-Projected Voxel Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-label="Interactive voxel character portrait of Ray built from his Minecraft skin"
      />

      {/* Quiet Bottom Caption */}
      <div className="pointer-events-none absolute bottom-4 inset-x-5 sm:inset-x-6 flex items-center justify-between text-[11px] font-mono text-white/40">
        <span>Hover to split skin layers</span>
        <span>Drag to rotate</span>
      </div>
    </div>
  );
};
