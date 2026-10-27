import * as THREE from 'three';

export interface Point2D {
  x: number;
  y: number;
}

export interface CutNodes {
  TL: Point2D;
  TR: Point2D;
  BR: Point2D;
  BL: Point2D;
  tAB: Point2D;
  tBC: Point2D;
  tCE: Point2D;
  bAD: Point2D;
  bDE: Point2D;
  J0: Point2D;
  J1: Point2D;
  J2: Point2D;
}

/**
 * Computes drifted and cursor-pushed cut points in normalized panel space [0, 1]x[0, 1].
 */
export function computeCutPoints(
  time: number,
  pointerNorm: Point2D | null,
  isPortrait: boolean
): CutNodes {
  // Base normalized positions
  const baseTL = { x: 0.0, y: 0.0 };
  const baseTR = { x: 1.0, y: 0.0 };
  const baseBR = { x: 1.0, y: 1.0 };
  const baseBL = { x: 0.0, y: 1.0 };

  // Drifted points (periods 10-20s, drift x +-0.03, junctions also y +-0.05)
  let tAB = {
    x: 0.22 + 0.03 * Math.sin(time / 14.0 + 0.3),
    y: 0.0,
  };
  let tBC = {
    x: 0.515 + 0.03 * Math.sin(time / 17.5 + 1.8),
    y: 0.0,
  };
  let tCE = {
    x: 0.84 + 0.025 * Math.sin(time / 12.3 + 3.4),
    y: 0.0,
  };

  let bAD = {
    x: 0.34 + 0.03 * Math.sin(time / 15.2 + 2.1),
    y: 1.0,
  };
  let bDE = {
    x: 0.865 + 0.025 * Math.sin(time / 19.1 + 4.7),
    y: 1.0,
  };

  let J0 = {
    x: 0.385 + 0.03 * Math.sin(time / 11.4 + 0.9),
    y: 0.72 + 0.05 * Math.cos(time / 16.2 + 1.2),
  };
  let J1 = {
    x: 0.48 + 0.03 * Math.sin(time / 13.8 + 3.7),
    y: 0.62 + 0.05 * Math.cos(time / 14.1 + 2.9),
  };
  let J2 = {
    x: 0.716 + 0.03 * Math.sin(time / 18.2 + 5.1),
    y: 0.49 + 0.05 * Math.cos(time / 12.7 + 4.3),
  };

  // Cursor push: points within 0.6 of pointer are pushed away by up to 0.05
  if (pointerNorm) {
    const applyPush = (p: Point2D, lockX = false, lockY = false) => {
      const dx = p.x - pointerNorm.x;
      const dy = p.y - pointerNorm.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.6 && dist > 0.0001) {
        const factor = 0.05 * Math.pow(1 - dist / 0.6, 2);
        const nx = dx / dist;
        const ny = dy / dist;
        if (!lockX) p.x += nx * factor;
        if (!lockY) p.y += ny * factor;
      }
    };

    applyPush(tAB, false, true);
    applyPush(tBC, false, true);
    applyPush(tCE, false, true);
    applyPush(bAD, false, true);
    applyPush(bDE, false, true);
    applyPush(J0, false, false);
    applyPush(J1, false, false);
    applyPush(J2, false, false);
  }

  // Clamp edge points to remain ordered and strictly on boundaries
  tAB.x = Math.max(0.12, Math.min(0.35, tAB.x));
  tBC.x = Math.max(tAB.x + 0.12, Math.min(0.68, tBC.x));
  tCE.x = Math.max(tBC.x + 0.12, Math.min(0.92, tCE.x));

  bAD.x = Math.max(0.2, Math.min(0.5, bAD.x));
  bDE.x = Math.max(bAD.x + 0.2, Math.min(0.94, bDE.x));

  J0.x = Math.max(0.2, Math.min(0.6, J0.x));
  J0.y = Math.max(0.5, Math.min(0.88, J0.y));

  J1.x = Math.max(J0.x + 0.02, Math.min(0.7, J1.x));
  J1.y = Math.max(0.4, Math.min(0.8, J1.y));

  J2.x = Math.max(J1.x + 0.08, Math.min(0.88, J2.x));
  J2.y = Math.max(0.3, Math.min(0.7, J2.y));

  if (isPortrait) {
    // In portrait, transpose/adjust so hero cell A sits on top
    return {
      TL: baseTL,
      TR: baseTR,
      BR: baseBR,
      BL: baseBL,
      tAB: { x: tAB.y, y: tAB.x },
      tBC: { x: tBC.y, y: tBC.x },
      tCE: { x: tCE.y, y: tCE.x },
      bAD: { x: bAD.y, y: bAD.x },
      bDE: { x: bDE.y, y: bDE.x },
      J0: { x: J0.y, y: J0.x },
      J1: { x: J1.y, y: J1.x },
      J2: { x: J2.y, y: J2.x },
    };
  }

  return {
    TL: baseTL,
    TR: baseTR,
    BR: baseBR,
    BL: baseBL,
    tAB,
    tBC,
    tCE,
    bAD,
    bDE,
    J0,
    J1,
    J2,
  };
}

/**
 * Returns the 5 cell polygons in normalized coordinates.
 */
export function getCellPolygons(nodes: CutNodes): { id: string; poly: Point2D[] }[] {
  const { TL, TR, BR, BL, tAB, tBC, tCE, bAD, bDE, J0, J1, J2 } = nodes;

  return [
    {
      id: 'A', // Hero cell
      poly: [TL, tAB, J0, bAD, BL],
    },
    {
      id: 'B',
      poly: [tAB, tBC, J1, J0],
    },
    {
      id: 'C',
      poly: [tBC, tCE, J2, J1],
    },
    {
      id: 'D',
      poly: [J0, J1, J2, bDE, bAD],
    },
    {
      id: 'E',
      poly: [tCE, TR, BR, bDE, J2],
    },
  ];
}

/**
 * Insets a simple polygon inward by `insetDistance`.
 */
export function insetPolygon(poly: Point2D[], insetDistance: number): Point2D[] {
  const n = poly.length;
  if (n < 3) return poly;

  // Compute signed area to find orientation
  let area = 0;
  for (let i = 0; i < n; i++) {
    const curr = poly[i];
    const next = poly[(i + 1) % n];
    area += curr.x * next.y - next.x * curr.y;
  }
  const isCCW = area > 0;

  // Find offset line for each edge
  interface Line {
    px: number;
    py: number;
    dx: number;
    dy: number;
  }
  const lines: Line[] = [];

  for (let i = 0; i < n; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % n];
    const edx = p2.x - p1.x;
    const edy = p2.y - p1.y;
    const len = Math.hypot(edx, edy) || 1;
    // Normalized edge direction
    const ux = edx / len;
    const uy = edy / len;

    // Inward normal: in CCW, (-uy, ux); in CW, (uy, -ux)
    const inNx = isCCW ? -uy : uy;
    const inNy = isCCW ? ux : -ux;

    lines.push({
      px: p1.x + inNx * insetDistance,
      py: p1.y + inNy * insetDistance,
      dx: ux,
      dy: uy,
    });
  }

  // Intersect adjacent offset lines
  const result: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const l1 = lines[(i - 1 + n) % n];
    const l2 = lines[i];

    // Intersection of: l1.p + t1 * l1.d = l2.p + t2 * l2.d
    const cross = l1.dx * l2.dy - l1.dy * l2.dx;
    if (Math.abs(cross) < 1e-6) {
      // Parallel lines, use midpoint
      result.push({ x: l2.px, y: l2.py });
    } else {
      const dpx = l2.px - l1.px;
      const dpy = l2.py - l1.py;
      const t1 = (dpx * l2.dy - dpy * l2.dx) / cross;
      // Clamp t1 to prevent spike overshooting on acute vertices
      const clampedT1 = Math.max(-insetDistance * 3.5, Math.min(insetDistance * 3.5, t1));
      result.push({
        x: l1.px + l1.dx * clampedT1,
        y: l1.py + l1.dy * clampedT1,
      });
    }
  }

  return result;
}

/**
 * Creates a rounded Three.js Shape from a 2D polygon with fillet corners.
 */
export function createRoundedShape(
  points: Point2D[],
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const n = points.length;
  if (n < 3) return shape;

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const len1 = Math.hypot(v1x, v1y) || 1;
    const u1x = v1x / len1;
    const u1y = v1y / len1;

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y) || 1;
    const u2x = v2x / len2;
    const u2y = v2y / len2;

    const maxFillet = Math.min(len1 * 0.45, len2 * 0.45, radius);

    const startX = curr.x + u1x * maxFillet;
    const startY = curr.y + u1y * maxFillet;
    const endX = curr.x + u2x * maxFillet;
    const endY = curr.y + u2y * maxFillet;

    if (i === 0) {
      shape.moveTo(startX, startY);
    } else {
      shape.lineTo(startX, startY);
    }
    shape.quadraticCurveTo(curr.x, curr.y, endX, endY);
  }

  shape.closePath();
  return shape;
}

/**
 * Creates rounded rectangle shape for nav slab or sliver.
 */
export function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  return shape;
}
