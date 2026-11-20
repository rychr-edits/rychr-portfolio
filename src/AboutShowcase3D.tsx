import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ArrowRight } from 'lucide-react';
import { AnimatedGeminiBorder } from './AnimatedGeminiBorder.tsx';

// Pre-allocated camera framing vectors (zero GC in RAF loop)
const _camTarget = new THREE.Vector3(0, 1.46, 0);

/**
 * Maps a standard 64x64 Minecraft skin atlas onto a THREE.BoxGeometry.
 * Three.js BoxGeometry face order: [+X (char left), -X (char right), +Y (top), -Y (bottom), +Z (front), -Z (back)]
 */
function createMinecraftBoxGeometry(
  wPx: number,
  hPx: number,
  dPx: number,
  texX: number,
  texY: number,
  pixelScale: number,
  expandWorld = 0
): THREE.BoxGeometry {
  const w = wPx * pixelScale + expandWorld * 2;
  const h = hPx * pixelScale + expandWorld * 2;
  const d = dPx * pixelScale + expandWorld * 2;
  const geo = new THREE.BoxGeometry(w, h, d);

  const texSize = 64;
  const eps = 0.08 / texSize;

  const setFaceUV = (
    faceIndex: number,
    px: number,
    py: number,
    pw: number,
    ph: number,
    flipV = false
  ) => {
    const u0 = px / texSize + eps;
    const u1 = (px + pw) / texSize - eps;
    const vTop = 1 - py / texSize - eps;
    const vBot = 1 - (py + ph) / texSize + eps;
    const v0 = flipV ? vBot : vTop;
    const v1 = flipV ? vTop : vBot;

    const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
    const base = faceIndex * 4;
    uvAttr.setXY(base + 0, u0, v0);
    uvAttr.setXY(base + 1, u1, v0);
    uvAttr.setXY(base + 2, u0, v1);
    uvAttr.setXY(base + 3, u1, v1);
  };

  setFaceUV(0, texX + dPx + wPx, texY + dPx, dPx, hPx); // +X Character Left
  setFaceUV(1, texX, texY + dPx, dPx, hPx); // -X Character Right
  setFaceUV(2, texX + dPx, texY, wPx, dPx); // +Y Top
  setFaceUV(3, texX + dPx + wPx, texY, wPx, dPx, true); // -Y Bottom
  setFaceUV(4, texX + dPx, texY + dPx, wPx, hPx); // +Z Front
  setFaceUV(5, texX + dPx + wPx + dPx, texY + dPx, wPx, hPx); // -Z Back

  geo.attributes.uv.needsUpdate = true;
  return geo;
}

/**
 * Builds a watertight solid 3D extruded voxel mesh for a Minecraft 64x64 2nd-layer overlay.
 */
function buildExtrudedOverlayGeometry(
  wPx: number,
  hPx: number,
  dPx: number,
  texX: number,
  texY: number,
  pixelScale: number,
  reliefDepth: number,
  pixels: Uint8ClampedArray,
  texWidth: number,
  texHeight: number
): THREE.BufferGeometry {
  const isOpaque = (tx: number, ty: number): boolean => {
    if (tx < 0 || ty < 0 || tx >= texWidth || ty >= texHeight) return false;
    return pixels[(ty * texWidth + tx) * 4 + 3] >= 128;
  };

  const W = wPx * pixelScale;
  const H = hPx * pixelScale;
  const D = dPx * pixelScale;
  const embed = Math.min(0.003, pixelScale * 0.06);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const pushBox = (
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number,
    tx: number,
    ty: number
  ) => {
    const u = (tx + 0.5) / texWidth;
    const v = 1 - (ty + 0.5) / texHeight;

    const addQuad = (
      ax: number,
      ay: number,
      az: number,
      bx: number,
      by: number,
      bz: number,
      cx: number,
      cy: number,
      cz: number,
      dx: number,
      dy: number,
      dz: number,
      nx: number,
      ny: number,
      nz: number
    ) => {
      const base = positions.length / 3;
      positions.push(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz);
      for (let k = 0; k < 4; k++) {
        normals.push(nx, ny, nz);
        uvs.push(u, v);
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };

    addQuad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1, 0, 0, 1); // +Z
    addQuad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0, 0, 0, -1); // -Z
    addQuad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1, 1, 0, 0); // +X
    addQuad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0, -1, 0, 0); // -X
    addQuad(x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0, 0, 1, 0); // +Y
    addQuad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1, 0, -1, 0); // -Y
  };

  // 1. Front (+Z)
  for (let fy = 0; fy < hPx; fy++) {
    for (let fx = 0; fx < wPx; fx++) {
      const tx = texX + dPx + fx;
      const ty = texY + dPx + fy;
      if (!isOpaque(tx, ty)) continue;

      let x0 = -W / 2 + fx * pixelScale;
      let x1 = x0 + pixelScale;
      let y1 = H / 2 - fy * pixelScale;
      let y0 = y1 - pixelScale;

      if (fx === 0 && isOpaque(texX + dPx - 1, ty)) x0 -= reliefDepth;
      if (fx === wPx - 1 && isOpaque(texX + dPx + wPx, ty)) x1 += reliefDepth;
      if (fy === 0 && isOpaque(texX + dPx + fx, texY + dPx - 1)) y1 += reliefDepth;
      if (fy === hPx - 1 && isOpaque(texX + dPx + wPx + fx, texY + dPx - 1)) y0 -= reliefDepth;

      pushBox(x0, x1, y0, y1, D / 2 - embed, D / 2 + reliefDepth, tx, ty);
    }
  }

  // 2. Back (-Z)
  for (let fy = 0; fy < hPx; fy++) {
    for (let fx = 0; fx < wPx; fx++) {
      const tx = texX + dPx + wPx + dPx + fx;
      const ty = texY + dPx + fy;
      if (!isOpaque(tx, ty)) continue;

      let x1 = W / 2 - fx * pixelScale;
      let x0 = x1 - pixelScale;
      let y1 = H / 2 - fy * pixelScale;
      let y0 = y1 - pixelScale;

      if (fx === 0 && isOpaque(tx - 1, ty)) x1 += reliefDepth;
      if (fx === wPx - 1 && isOpaque(texX, ty)) x0 -= reliefDepth;
      if (fy === 0 && isOpaque(texX + dPx + (wPx - 1 - fx), texY)) y1 += reliefDepth;
      if (fy === hPx - 1 && isOpaque(texX + dPx + wPx + (wPx - 1 - fx), texY)) y0 -= reliefDepth;

      pushBox(x0, x1, y0, y1, -D / 2 - reliefDepth, -D / 2 + embed, tx, ty);
    }
  }

  // 3. Char Left (+X)
  for (let fy = 0; fy < hPx; fy++) {
    for (let fx = 0; fx < dPx; fx++) {
      const tx = texX + dPx + wPx + fx;
      const ty = texY + dPx + fy;
      if (!isOpaque(tx, ty)) continue;

      let z1 = D / 2 - fx * pixelScale;
      let z0 = z1 - pixelScale;
      let y1 = H / 2 - fy * pixelScale;
      let y0 = y1 - pixelScale;

      if (fx === 0 && isOpaque(tx - 1, ty)) z1 += reliefDepth;
      if (fx === dPx - 1 && isOpaque(tx + 1, ty)) z0 -= reliefDepth;
      if (fy === 0 && isOpaque(texX + dPx + wPx - 1, texY + dPx - 1 - fx)) y1 += reliefDepth;
      if (fy === hPx - 1 && isOpaque(texX + dPx + wPx + wPx - 1, texY + dPx - 1 - fx))
        y0 -= reliefDepth;

      pushBox(W / 2 - embed, W / 2 + reliefDepth, y0, y1, z0, z1, tx, ty);
    }
  }

  // 4. Char Right (-X)
  for (let fy = 0; fy < hPx; fy++) {
    for (let fx = 0; fx < dPx; fx++) {
      const tx = texX + fx;
      const ty = texY + dPx + fy;
      if (!isOpaque(tx, ty)) continue;

      let z0 = -D / 2 + fx * pixelScale;
      let z1 = z0 + pixelScale;
      let y1 = H / 2 - fy * pixelScale;
      let y0 = y1 - pixelScale;

      if (fx === 0 && isOpaque(texX + dPx * 2 + wPx * 2 - 1, ty)) z0 -= reliefDepth;
      if (fx === dPx - 1 && isOpaque(tx + 1, ty)) z1 += reliefDepth;
      if (fy === 0 && isOpaque(texX + dPx, texY + fx)) y1 += reliefDepth;
      if (fy === hPx - 1 && isOpaque(texX + dPx + wPx, texY + fx)) y0 -= reliefDepth;

      pushBox(-W / 2 - reliefDepth, -W / 2 + embed, y0, y1, z0, z1, tx, ty);
    }
  }

  // 5. Top (+Y)
  for (let fy = 0; fy < dPx; fy++) {
    for (let fx = 0; fx < wPx; fx++) {
      const tx = texX + dPx + fx;
      const ty = texY + fy;
      if (!isOpaque(tx, ty)) continue;

      const x0 = -W / 2 + fx * pixelScale;
      const x1 = x0 + pixelScale;
      const z0 = -D / 2 + fy * pixelScale;
      const z1 = z0 + pixelScale;

      pushBox(x0, x1, H / 2 - embed, H / 2 + reliefDepth, z0, z1, tx, ty);
    }
  }

  // 6. Bottom (-Y)
  for (let fy = 0; fy < dPx; fy++) {
    for (let fx = 0; fx < wPx; fx++) {
      const tx = texX + dPx + wPx + fx;
      const ty = texY + fy;
      if (!isOpaque(tx, ty)) continue;

      const x0 = -W / 2 + fx * pixelScale;
      const x1 = x0 + pixelScale;
      const z0 = -D / 2 + fy * pixelScale;
      const z1 = z0 + pixelScale;

      pushBox(x0, x1, -H / 2 - reliefDepth, -H / 2 + embed, z0, z1, tx, ty);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

function createSpotlightBeamTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  for (let y = 0; y < h; y++) {
    const ny = y / (h - 1);
    const coneHalfWidth = 0.08 + ny * 0.24;
    const edgeFeather = 0.14 + ny * 0.12;
    const botFade = 1 - smoothstep(0.55, 0.98, ny);
    const verticalIntensity = botFade * (0.95 * Math.pow(1 - ny * 0.52, 1.25) + 0.05);

    for (let x = 0; x < w; x++) {
      const u = x / (w - 1) - 0.5;
      const dist = Math.abs(u);
      const insideCone =
        1 - smoothstep(coneHalfWidth - edgeFeather * 0.45, coneHalfWidth + edgeFeather, dist);
      const sigma = coneHalfWidth * 0.65;
      const coreBoost = 0.6 + 0.4 * Math.exp(-(dist * dist) / (2 * sigma * sigma));
      const rayStreaks = 0.86 + 0.14 * Math.cos(u * 26.0 + ny * 1.4) * Math.cos(u * 11.0);
      const alpha = Math.max(
        0,
        Math.min(1, insideCone * coreBoost * verticalIntensity * rayStreaks)
      );

      const idx = (y * w + x) * 4;
      data[idx + 0] = 242;
      data[idx + 1] = 246;
      data[idx + 2] = 255;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMoteSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  grad.addColorStop(0.42, 'rgba(228, 236, 252, 0.48)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface AboutShowcase3DProps {
  pointerTargetRef?: React.MutableRefObject<{ x: number; y: number }>;
  scrollProgressRef?: React.MutableRefObject<number>;
}

export const AboutShowcase3D: React.FC<AboutShowcase3DProps> = ({
  pointerTargetRef,
  scrollProgressRef,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const localPointerRef = useRef({ x: 0, y: 0 });
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const backdropGlowRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 900;
    let height = container.clientHeight || 560;

    // 1. Software WebGL Probe
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Scene, Low-Angle Camera, Transparent Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 40);
    camera.position.set(0, 0.88, 2.75);
    camera.lookAt(_camTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle procedural studio reflections for metallic gimbal rings & crystalline AE keyframes
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.28;
    pmremGenerator.dispose();

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    let isDisposed = false;
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [envTex];

    const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometriesToDispose.push(g);
      return g;
    };
    const registerMat = <T extends THREE.Material>(m: T): T => {
      materialsToDispose.push(m);
      return m;
    };
    const registerTex = <T extends THREE.Texture>(t: T): T => {
      texturesToDispose.push(t);
      return t;
    };

    const px = 0.058;
    const emptyOverlayPlaceholderGeo = registerGeo(new THREE.BufferGeometry());
    const overlaySpecs: Array<{
      mesh: THREE.Mesh;
      wPx: number;
      hPx: number;
      dPx: number;
      texX: number;
      texY: number;
      relief: number;
    }> = [];

    const beamTex = registerTex(createSpotlightBeamTexture());
    const moteTex = registerTex(createMoteSpriteTexture());

    const textureLoader = new THREE.TextureLoader();
    const skinTexture = registerTex(
      textureLoader.load('/assets/aistudio/raychristo_ea864ecd.png', (loadedTex) => {
        if (isDisposed) return;
        loadedTex.needsUpdate = true;

        const img = loadedTex.image as HTMLImageElement | HTMLCanvasElement | undefined;
        if (!img) return;
        const texW = img.width || 64;
        const texH = img.height || 64;
        const probeCanvas = document.createElement('canvas');
        probeCanvas.width = texW;
        probeCanvas.height = texH;
        const probeCtx = probeCanvas.getContext('2d');
        if (!probeCtx) return;
        probeCtx.drawImage(img, 0, 0, texW, texH);
        const imgData = probeCtx.getImageData(0, 0, texW, texH).data;

        for (const spec of overlaySpecs) {
          const extrudedGeo = buildExtrudedOverlayGeometry(
            spec.wPx,
            spec.hPx,
            spec.dPx,
            spec.texX,
            spec.texY,
            px,
            spec.relief,
            imgData,
            texW,
            texH
          );
          registerGeo(extrudedGeo);
          if (spec.mesh.geometry !== emptyOverlayPlaceholderGeo) {
            spec.mesh.geometry.dispose();
          }
          spec.mesh.geometry = extrudedGeo;
          spec.mesh.visible = true;
        }
      })
    );
    skinTexture.colorSpace = THREE.SRGBColorSpace;
    skinTexture.magFilter = THREE.NearestFilter;
    skinTexture.minFilter = THREE.NearestFilter;
    skinTexture.generateMipmaps = false;

    // 3. Cinema Studio Lighting Rig (Back Rim Silhouette -> Dramatic Front Key Reveal)
    const hemiLight = new THREE.HemisphereLight(0xeef2fa, 0x1e2026, 0.55);
    scene.add(hemiLight);

    const keySpot = new THREE.SpotLight(0xffffff, 0, 14, Math.PI / 6.2, 0.65, 1.2);
    keySpot.position.set(1.9, 3.6, 2.3);
    keySpot.target.position.set(0.52, 1.4, 0);
    if (!isSoftwareGl) {
      keySpot.castShadow = true;
      keySpot.shadow.mapSize.width = 1024;
      keySpot.shadow.mapSize.height = 1024;
      keySpot.shadow.camera.near = 1.2;
      keySpot.shadow.camera.far = 8.5;
      keySpot.shadow.focus = 0.85;
      keySpot.shadow.bias = -0.0005;
      keySpot.shadow.normalBias = 0.015;
    }
    scene.add(keySpot);
    scene.add(keySpot.target);

    const crownFill = new THREE.SpotLight(0xf6f9ff, 0, 12, Math.PI / 5, 0.88, 1.3);
    crownFill.position.set(0.45, 3.85, 0.65);
    crownFill.target.position.set(0.52, 1.45, 0);
    scene.add(crownFill);
    scene.add(crownFill.target);

    const frontFill = new THREE.DirectionalLight(0xe4ecfb, 0.15);
    frontFill.position.set(-1.6, 1.2, 2.5);
    scene.add(frontFill);

    // Cool edge rim stays active even when facing backwards, tracing shoulders/hair before reveal
    const rimLight = new THREE.DirectionalLight(0xd8e4ff, 1.35);
    rimLight.position.set(-1.2, 2.6, -2.5);
    scene.add(rimLight);

    // 4. Right-Shifted Hero Stage Group (Beam + Kinetic Keyframe Crystals + Orbital Gimbal Rings + Half-Character)
    const stageAnchor = new THREE.Group();
    scene.add(stageAnchor);

    // Overhead volumetric light shaft descending cleanly behind upper body
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 2.9, -0.58);
    stageAnchor.add(beamPivot);

    const beamPlaneGeo = registerGeo(new THREE.PlaneGeometry(3.8, 2.75));
    const beamPlaneMat = registerMat(
      new THREE.MeshBasicMaterial({
        map: beamTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const beamBillboard = new THREE.Mesh(beamPlaneGeo, beamPlaneMat);
    beamBillboard.position.set(0, -1.35, 0);
    beamBillboard.renderOrder = 1;
    beamPivot.add(beamBillboard);

    // Motion Designer Orbital Gimbal Rings & Floating AE Keyframe Diamonds behind Ray
    const studioAccentsGroup = new THREE.Group();
    studioAccentsGroup.position.set(0, 1.38, -0.22);
    stageAnchor.add(studioAccentsGroup);

    const outerHaloGeo = registerGeo(new THREE.TorusGeometry(0.82, 0.0038, 10, 96));
    const haloMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xe8efff,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: 0.36,
      })
    );
    const outerHalo = new THREE.Mesh(outerHaloGeo, haloMat);
    outerHalo.rotation.set(0.28, -0.18, 0);
    studioAccentsGroup.add(outerHalo);

    const innerHaloGeo = registerGeo(new THREE.TorusGeometry(0.64, 0.0028, 10, 84));
    const innerHaloMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xdbe6ff,
        emissive: 0xdbe6ff,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.22,
      })
    );
    const innerHalo = new THREE.Mesh(innerHaloGeo, innerHaloMat);
    innerHalo.rotation.set(-0.34, 0.24, 0);
    studioAccentsGroup.add(innerHalo);

    const keyframeSpecs = [
      { x: -0.78, y: 0.38, z: -0.18, s: 0.075, speed: 0.8, phase: 0.4 },
      { x: 0.72, y: 0.44, z: -0.26, s: 0.068, speed: 1.05, phase: 1.9 },
      { x: -0.66, y: -0.24, z: -0.12, s: 0.056, speed: 0.92, phase: 3.1 },
      { x: 0.78, y: -0.14, z: -0.24, s: 0.062, speed: 0.76, phase: 4.5 },
      { x: 0.14, y: 0.68, z: -0.42, s: 0.05, speed: 1.15, phase: 2.6 },
    ];
    const keyframeBaseGeo = registerGeo(new THREE.OctahedronGeometry(1, 0));
    const keyframeWireGeo = registerGeo(new THREE.EdgesGeometry(keyframeBaseGeo));
    const keyframeCoreMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x161920,
        roughness: 0.22,
        metalness: 0.88,
        transparent: true,
        opacity: 0.85,
      })
    );
    const keyframeEdgeMat = registerMat(
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
      })
    );

    const keyframeMeshes: Array<{
      group: THREE.Group;
      baseX: number;
      baseY: number;
      baseZ: number;
      speed: number;
      phase: number;
    }> = [];

    for (const spec of keyframeSpecs) {
      const kfGroup = new THREE.Group();
      kfGroup.position.set(spec.x, spec.y, spec.z);
      kfGroup.scale.setScalar(spec.s);
      const coreMesh = new THREE.Mesh(keyframeBaseGeo, keyframeCoreMat);
      const wireMesh = new THREE.LineSegments(keyframeWireGeo, keyframeEdgeMat);
      wireMesh.scale.setScalar(1.03);
      kfGroup.add(coreMesh, wireMesh);
      studioAccentsGroup.add(kfGroup);
      keyframeMeshes.push({
        group: kfGroup,
        baseX: spec.x,
        baseY: spec.y,
        baseZ: spec.z,
        speed: spec.speed,
        phase: spec.phase,
      });
    }

    // Subtle floating dust motes strictly inside upper-body spotlight volume
    const moteCount = 38;
    const motePositions = new Float32Array(moteCount * 3);
    const moteSeeds = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const yVal = 0.75 + Math.random() * 1.45;
      const maxR = 0.14 + (1 - (yVal - 0.7) / 1.65) * 0.72;
      const r = Math.random() * maxR;
      const theta = Math.random() * Math.PI * 2;
      motePositions[i * 3 + 0] = Math.cos(theta) * r;
      motePositions[i * 3 + 1] = yVal;
      motePositions[i * 3 + 2] = Math.sin(theta) * r;

      moteSeeds[i * 3 + 0] = motePositions[i * 3 + 0];
      moteSeeds[i * 3 + 1] = motePositions[i * 3 + 1];
      moteSeeds[i * 3 + 2] = Math.random() * Math.PI * 2;
    }
    const motesGeo = registerGeo(new THREE.BufferGeometry());
    motesGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const motesMat = registerMat(
      new THREE.PointsMaterial({
        map: moteTex,
        size: 0.032,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    const motesPoints = new THREE.Points(motesGeo, motesMat);
    stageAnchor.add(motesPoints);

    // 5. Authentic Slim (3px Arm) 64x64 Minecraft Character (Upper-Half Framed from Waist Up)
    const characterGroup = new THREE.Group();
    stageAnchor.add(characterGroup);

    const headOverlayRelief = px * 0.22;
    const bodyOverlayRelief = px * 0.14;

    const skinBaseMat = registerMat(
      new THREE.MeshStandardMaterial({
        map: skinTexture,
        roughness: 0.78,
        metalness: 0.04,
        alphaTest: 0.5,
      })
    );
    const skinOverlayMat = registerMat(
      new THREE.MeshStandardMaterial({
        map: skinTexture,
        roughness: 0.76,
        metalness: 0.05,
      })
    );

    const setCharPartShadow = (mesh: THREE.Mesh, isOverlay = false) => {
      mesh.castShadow = !isSoftwareGl && !isOverlay;
      mesh.receiveShadow = !isSoftwareGl;
      return mesh;
    };

    const createExtrudedOverlayMesh = (
      wPx: number,
      hPx: number,
      dPx: number,
      texX: number,
      texY: number,
      relief: number,
      yOffset: number
    ): THREE.Mesh => {
      const mesh = setCharPartShadow(
        new THREE.Mesh(emptyOverlayPlaceholderGeo, skinOverlayMat),
        true
      );
      mesh.position.y = yOffset;
      mesh.visible = false;
      overlaySpecs.push({ mesh, wPx, hPx, dPx, texX, texY, relief });
      return mesh;
    };

    // Upper hips anchor (subtle hip top included so bottom crop edge stays 100% solid at waist)
    const legHipY = 12 * px;
    const halfLegY = -6 * px;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(-2 * px, legHipY, 0);
    const rLegGeo = registerGeo(createMinecraftBoxGeometry(4, 12, 4, 0, 16, px));
    const rLegMesh = setCharPartShadow(new THREE.Mesh(rLegGeo, skinBaseMat));
    rLegMesh.position.y = halfLegY;
    const rLegOverlay = createExtrudedOverlayMesh(4, 12, 4, 0, 32, bodyOverlayRelief, halfLegY);
    rightLegGroup.add(rLegMesh, rLegOverlay);
    characterGroup.add(rightLegGroup);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(2 * px, legHipY, 0);
    const lLegGeo = registerGeo(createMinecraftBoxGeometry(4, 12, 4, 16, 48, px));
    const lLegMesh = setCharPartShadow(new THREE.Mesh(lLegGeo, skinBaseMat));
    lLegMesh.position.y = halfLegY;
    const lLegOverlay = createExtrudedOverlayMesh(4, 12, 4, 0, 48, bodyOverlayRelief, halfLegY);
    leftLegGroup.add(lLegMesh, lLegOverlay);
    characterGroup.add(leftLegGroup);

    // -- UPPER BODY --
    const upperBodyGroup = new THREE.Group();
    upperBodyGroup.position.set(0, legHipY, 0);
    characterGroup.add(upperBodyGroup);

    const torsoGeo = registerGeo(createMinecraftBoxGeometry(8, 12, 4, 16, 16, px));
    const torsoMesh = setCharPartShadow(new THREE.Mesh(torsoGeo, skinBaseMat));
    torsoMesh.position.y = 6 * px;
    const torsoOverlay = createExtrudedOverlayMesh(8, 12, 4, 16, 32, bodyOverlayRelief, 6 * px);
    upperBodyGroup.add(torsoMesh, torsoOverlay);

    // -- HEAD + HAIR OVERLAY --
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 12 * px, 0);
    upperBodyGroup.add(headGroup);

    const headGeo = registerGeo(createMinecraftBoxGeometry(8, 8, 8, 0, 0, px));
    const headMesh = setCharPartShadow(new THREE.Mesh(headGeo, skinBaseMat));
    headMesh.position.y = 4 * px;
    const hatMesh = createExtrudedOverlayMesh(8, 8, 8, 32, 0, headOverlayRelief, 4 * px);
    headGroup.add(headMesh, hatMesh);

    // -- SLIM ARMS --
    const shoulderY = 10 * px;
    const armOffsetY = -4 * px;

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-5.5 * px, shoulderY, 0);
    const rArmGeo = registerGeo(createMinecraftBoxGeometry(3, 12, 4, 40, 16, px));
    const rArmMesh = setCharPartShadow(new THREE.Mesh(rArmGeo, skinBaseMat));
    rArmMesh.position.y = armOffsetY;
    const rArmOverlay = createExtrudedOverlayMesh(3, 12, 4, 40, 32, bodyOverlayRelief, armOffsetY);
    rightArmGroup.add(rArmMesh, rArmOverlay);
    rightArmGroup.rotation.z = -0.07;
    rightArmGroup.rotation.x = -0.06;
    upperBodyGroup.add(rightArmGroup);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(5.5 * px, shoulderY, 0);
    const lArmGeo = registerGeo(createMinecraftBoxGeometry(3, 12, 4, 32, 48, px));
    const lArmMesh = setCharPartShadow(new THREE.Mesh(lArmGeo, skinBaseMat));
    lArmMesh.position.y = armOffsetY;
    const lArmOverlay = createExtrudedOverlayMesh(3, 12, 4, 48, 48, bodyOverlayRelief, armOffsetY);
    leftArmGroup.add(lArmMesh, lArmOverlay);
    leftArmGroup.rotation.z = 0.07;
    leftArmGroup.rotation.x = 0.06;
    upperBodyGroup.add(leftArmGroup);

    // Start turned backwards cleanly until scrolled into view
    let smoothProgress = scrollProgressRef ? scrollProgressRef.current : 1;
    let smoothBodyYaw = (1 - smoothProgress) * Math.PI;
    characterGroup.rotation.y = smoothBodyYaw;

    // Fallback pointer listener if pointerTargetRef wasn't supplied
    const handleFallbackPointerMove = (e: PointerEvent) => {
      const host = cardRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      localPointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      localPointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    if (!pointerTargetRef) {
      window.addEventListener('pointermove', handleFallbackPointerMove, { passive: true });
    }

    // 6. Animation Loop (Scroll-Driven Back-to-Front Reveal + Low-Angle Cursor Tracking)
    let frameId = 0;
    const clock = new THREE.Clock();
    const smoothMouse = { x: 0, y: 0 };

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (isDisposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    function tick() {
      if (isDisposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const targetProgress = scrollProgressRef ? scrollProgressRef.current : 1;
      smoothProgress = THREE.MathUtils.damp(smoothProgress, targetProgress, 5.2, delta);

      const isDesktopLayout = width >= 720;
      const charAnchorX = isDesktopLayout ? 0.56 : 0;
      const charScreenOffsetNorm = isDesktopLayout ? 0.28 : 0;

      // Smoothly position character slightly right of center on desktop, centered on mobile
      stageAnchor.position.x = THREE.MathUtils.damp(stageAnchor.position.x, charAnchorX, 8, delta);

      // Re-center pointer relative to Ray's screen position so looking directly at him centers his eyes
      const rawPointer = pointerTargetRef ? pointerTargetRef.current : localPointerRef.current;
      const relTargetX = THREE.MathUtils.clamp((rawPointer.x - charScreenOffsetNorm) / 0.85, -1, 1);
      const relTargetY = THREE.MathUtils.clamp(rawPointer.y, -1, 1);

      smoothMouse.x = THREE.MathUtils.damp(smoothMouse.x, relTargetX, 6.5, delta);
      smoothMouse.y = THREE.MathUtils.damp(smoothMouse.y, relTargetY, 6.5, delta);

      const mx = smoothMouse.x;
      const my = smoothMouse.y;

      // A. Scroll-Driven Back-to-Front / Front-to-Back Spin (Math.PI -> 0 on scroll down, 0 -> Math.PI on scroll up)
      const prevBodyYaw = smoothBodyYaw;
      const targetBodyYaw = (1 - smoothProgress) * Math.PI + mx * 0.09 * smoothProgress;
      smoothBodyYaw = THREE.MathUtils.damp(smoothBodyYaw, targetBodyYaw, 6.0, delta);
      characterGroup.rotation.y = smoothBodyYaw;

      const yawVelocity = THREE.MathUtils.clamp((smoothBodyYaw - prevBodyYaw) / Math.max(delta, 0.008), -7, 7);

      // Weight & cursor gaze blend cleanly only as Ray turns toward the viewer
      const frontFacing = THREE.MathUtils.clamp((Math.cos(smoothBodyYaw) + 0.22) / 1.22, 0, 1);

      // B. Low-Angle Camera Crane Focused on Upper Half
      const aspect = Math.max(0.5, width / Math.max(1, height));
      const baseCamZ = aspect < 1.15 ? 2.95 : aspect < 1.65 ? 2.85 : 2.68;
      const revealCraneZ = baseCamZ + (1 - smoothProgress) * 0.42;
      const revealCamY = (aspect < 1.15 ? 0.94 : 0.88) - (1 - smoothProgress) * 0.08;
      const targetLookY = aspect < 1.15 ? 1.48 : 1.46;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, mx * 0.14, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, revealCamY - my * 0.06, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, revealCraneZ, 5, delta);

      _camTarget.set(mx * 0.05, targetLookY - my * 0.03, 0);
      camera.lookAt(_camTarget);

      // C. Expressive Upper-Body & Head Cursor Gaze + Spin Momentum
      upperBodyGroup.position.y = legHipY + Math.sin(elapsed * 1.8) * 0.008;
      upperBodyGroup.rotation.y = THREE.MathUtils.damp(
        upperBodyGroup.rotation.y,
        mx * 0.22 * frontFacing - yawVelocity * 0.035,
        7.5,
        delta
      );
      upperBodyGroup.rotation.x = THREE.MathUtils.damp(
        upperBodyGroup.rotation.x,
        0.02 + my * 0.08 * frontFacing,
        7,
        delta
      );
      upperBodyGroup.rotation.z = THREE.MathUtils.damp(
        upperBodyGroup.rotation.z,
        -mx * 0.035 * frontFacing + yawVelocity * 0.018,
        7,
        delta
      );

      const idleHeadYaw = Math.sin(elapsed * 0.72) * 0.028 * frontFacing;
      const idleHeadPitch = Math.sin(elapsed * 1.15) * 0.015;
      headGroup.rotation.y = THREE.MathUtils.damp(
        headGroup.rotation.y,
        idleHeadYaw + mx * 0.56 * frontFacing - yawVelocity * 0.045,
        9.5,
        delta
      );
      headGroup.rotation.x = THREE.MathUtils.damp(
        headGroup.rotation.x,
        0.05 + idleHeadPitch + my * 0.34 * frontFacing,
        9.5,
        delta
      );
      headGroup.rotation.z = THREE.MathUtils.damp(
        headGroup.rotation.z,
        -mx * 0.06 * frontFacing + yawVelocity * 0.014,
        8,
        delta
      );

      rightArmGroup.rotation.x = -0.06 - Math.sin(elapsed * 1.4) * 0.028 - my * 0.08 * frontFacing;
      rightArmGroup.rotation.z = -0.07 - Math.abs(yawVelocity) * 0.014 + mx * 0.02 * frontFacing;
      leftArmGroup.rotation.x = 0.06 + Math.sin(elapsed * 1.4) * 0.028 + my * 0.07 * frontFacing;
      leftArmGroup.rotation.z = 0.07 + Math.abs(yawVelocity) * 0.014 + mx * 0.02 * frontFacing;

      // D. Cinema Lighting (Silhouette Rim when Backward -> Full Studio Key on Front Reveal)
      const lightCurve = smoothProgress * smoothProgress * (3 - 2 * smoothProgress);
      hemiLight.intensity = 0.45 + 0.55 * lightCurve;
      keySpot.intensity = 38.0 * lightCurve;
      keySpot.target.position.x = stageAnchor.position.x;
      keySpot.position.x = stageAnchor.position.x + 1.35 + mx * 0.65;
      keySpot.position.z = 2.3 - my * 0.45;

      crownFill.intensity = 9.0 * lightCurve;
      crownFill.position.x = stageAnchor.position.x - 0.1 + mx * 0.25;
      crownFill.target.position.x = stageAnchor.position.x;

      frontFill.intensity = 0.12 + 0.32 * lightCurve;
      rimLight.intensity = 1.45 - 0.35 * lightCurve;

      beamPivot.position.x = mx * 0.1;
      beamPivot.rotation.z = mx * 0.04;
      beamPlaneMat.opacity = 0.12 + 0.38 * lightCurve;
      motesMat.opacity = 0.2 + 0.48 * lightCurve;

      // E. Orbital Gimbal Rings + AE Keyframe Diamond Crystals
      const haloRevealScale = 0.78 + 0.22 * smoothProgress;
      studioAccentsGroup.scale.setScalar(haloRevealScale);

      outerHalo.rotation.z = elapsed * 0.18 + (1 - smoothProgress) * Math.PI * 0.75;
      outerHalo.rotation.x = 0.34 - my * 0.14;
      outerHalo.rotation.y = -0.22 + mx * 0.18;
      haloMat.opacity = 0.14 + 0.28 * lightCurve;

      innerHalo.rotation.z = -elapsed * 0.24 - (1 - smoothProgress) * Math.PI * 0.5;
      innerHalo.rotation.x = -0.36 - my * 0.12;
      innerHalo.rotation.y = 0.26 + mx * 0.16;
      innerHaloMat.opacity = 0.1 + 0.18 * lightCurve;

      keyframeEdgeMat.opacity = 0.2 + 0.45 * lightCurve;
      for (let i = 0; i < keyframeMeshes.length; i++) {
        const kf = keyframeMeshes[i];
        kf.group.position.x = kf.baseX + Math.sin(elapsed * 0.55 + kf.phase) * 0.04 - mx * 0.06;
        kf.group.position.y = kf.baseY + Math.cos(elapsed * 0.72 + kf.phase) * 0.05 + my * 0.04;
        kf.group.rotation.y = elapsed * kf.speed + (1 - smoothProgress) * 2.2;
        kf.group.rotation.x = Math.sin(elapsed * 0.6 + kf.phase) * 0.35;
      }

      // F. Drifting Dust Motes
      const posAttr = motesGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < moteCount; i++) {
        const seedX = moteSeeds[i * 3 + 0];
        const seedY = moteSeeds[i * 3 + 1];
        const phase = moteSeeds[i * 3 + 2];
        posAttr.setX(i, seedX + Math.sin(elapsed * 0.28 + phase) * 0.04 - mx * 0.05);
        posAttr.setY(i, seedY + Math.cos(elapsed * 0.24 + phase * 1.2) * 0.055 - my * 0.025);
      }
      posAttr.needsUpdate = true;
      motesPoints.rotation.y = elapsed * 0.03 + mx * 0.03;

      // G. Sync Card Spotlight & Bottom Reveal Progress Hairline
      if (backdropGlowRef.current) {
        backdropGlowRef.current.style.opacity = (0.35 + 0.65 * lightCurve).toFixed(3);
      }
      if (scrollBarRef.current) {
        scrollBarRef.current.style.transform = `scaleX(${Math.max(0.06, smoothProgress).toFixed(3)})`;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 7. ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (isDisposed || !entries[0]) return;
      const rect = entries[0].contentRect;
      if (rect.width <= 0 || rect.height <= 0) return;
      width = rect.width;
      height = rect.height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 8. Resource Disposal
    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      if (!pointerTargetRef) {
        window.removeEventListener('pointermove', handleFallbackPointerMove);
      }
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [pointerTargetRef, scrollProgressRef]);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-3xl bg-[#050505]/95 border border-white/15 shadow-[0_0_70px_rgba(0,0,0,0.92)] overflow-visible"
    >
      {/* Signature Glowing Gemini Perimeter Halo */}
      <AnimatedGeminiBorder
        preset="gemini"
        mode="always"
        borderRadius="rounded-3xl"
        borderWidth="1.5px"
        auraBlur="blur-xl"
        auraOpacity={0.38}
        innerGlowOpacity={0.92}
        speedMs={18000}
        angleOffset={40}
      />

      {/* Inner Clipped Card Surface */}
      <div className="relative z-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c0c10] via-[#050507] to-[#020203] flex flex-col md:block md:min-h-[540px] lg:min-h-[580px]">
        {/* Studio Radial Spotlight Pool Positioned Behind Character on Right */}
        <div
          ref={backdropGlowRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.11)_0%,rgba(210,224,255,0.035)_38%,transparent_68%)] md:bg-[radial-gradient(circle_at_70%_48%,rgba(255,255,255,0.11)_0%,rgba(210,224,255,0.035)_34%,transparent_64%)]"
        />

        {/* Subtle Top Edge Light Line Inside Card */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-20"
        />

        {/* Minimal After Effects Frame Corner Brackets */}
        <div aria-hidden="true" className="hidden sm:block absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/25 pointer-events-none z-20" />
        <div aria-hidden="true" className="hidden sm:block absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/25 pointer-events-none z-20" />
        <div aria-hidden="true" className="hidden sm:block absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/25 pointer-events-none z-20" />
        <div aria-hidden="true" className="hidden sm:block absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/25 pointer-events-none z-20" />

        {/* Left Editorial Typography & Capabilities Column */}
        <div className="relative z-20 flex flex-col justify-between p-7 sm:p-10 lg:p-12 md:w-[56%] lg:w-[52%] md:min-h-[540px] lg:min-h-[580px]">
          <div>
            <div
              data-s3d="global"
              data-s3d-depth="0.55"
              data-s3d-global-tilt="1.2"
              className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-white/55 mb-4 will-change-transform"
            >
              <span>Editor Profile</span>
              <span aria-hidden="true" className="text-white/30">·</span>
              <span>Motion Designer</span>
            </div>

            <div
              data-s3d="global"
              data-s3d-depth="0.85"
              data-s3d-global-tilt="1.6"
              className="flex items-baseline gap-3 mb-2 will-change-transform"
            >
              <h3 className="text-4xl sm:text-5xl lg:text-[54px] font-mazzard font-bold tracking-tight text-white leading-none">
                I&apos;m Ray.
              </h3>
              <span className="font-brand-rychr text-2xl sm:text-3xl text-white/80 font-bold">
                (Rychr)
              </span>
            </div>

            <p
              data-s3d="global"
              data-s3d-depth="0.65"
              data-s3d-global-tilt="1.2"
              className="text-sm sm:text-base font-medium text-white/80 mb-5 will-change-transform"
            >
              Video Editor &amp; Motion Designer
            </p>

            <p
              data-s3d="global"
              data-s3d-depth="0.45"
              data-s3d-global-tilt="0.9"
              className="text-sm sm:text-base text-white/65 leading-relaxed max-w-lg font-normal will-change-transform"
            >
              Every cut is built from scratch with surgical keyframe pacing, bespoke After Effects visuals, and 3-layer soundscapes engineered to hold viewer attention past the final frame.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-7">
              <div
                data-s3d="global"
                data-s3d-depth="0.35"
                data-s3d-global-tilt="0.8"
                className="will-change-transform"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
                  Primary Suite
                </div>
                <div className="text-sm font-mazzard font-semibold text-white mt-1">
                  100% After Effects
                </div>
              </div>

              <div
                data-s3d="global"
                data-s3d-depth="0.35"
                data-s3d-global-tilt="0.8"
                className="will-change-transform"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
                  Audio Design
                </div>
                <div className="text-sm font-mazzard font-semibold text-white mt-1">
                  3-layer soundscapes
                </div>
              </div>

              <div
                data-s3d="global"
                data-s3d-depth="0.35"
                data-s3d-global-tilt="0.8"
                className="will-change-transform"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
                  Revision Policy
                </div>
                <div className="text-sm font-mazzard font-semibold text-white mt-1">
                  Up to 3 passes
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                data-s3d="button"
                data-s3d-depth="0.55"
                data-s3d-global-tilt="1.1"
                data-s3d-scale="1.06"
                data-s3d-tilt="9"
                className="relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold text-sm transition-[background-color,box-shadow] shadow-[0_0_24px_rgba(255,255,255,0.25)] hover:shadow-[0_0_34px_rgba(255,255,255,0.45)] group/cta will-change-transform"
              >
                <span>Work With Ray</span>
                <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-0.5 transition-transform" />
              </a>

              <span className="text-xs font-mono text-white/45">
                High-retention pacing
              </span>
            </div>
          </div>
        </div>

        {/* Low-Angle Half-Character 3D Viewport (Right-Offset on Desktop, Lower Stage on Mobile) */}
        <div
          ref={mountRef}
          className="relative w-full h-[350px] sm:h-[400px] md:h-auto md:absolute md:inset-0 z-10 pointer-events-none"
        />

        {/* Soft Bottom Edge Scrim so Waist Cutoff Melts Cleanly into Card Base */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#030304] via-[#030304]/45 to-transparent pointer-events-none z-10"
        />

        {/* Subtle Scroll-Reveal Hairline Accent along Card Base */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.06] pointer-events-none z-20"
        >
          <div
            ref={scrollBarRef}
            className="w-full h-full origin-left bg-gradient-to-r from-white/75 via-white to-white/40 shadow-[0_0_12px_rgba(255,255,255,0.6)] will-change-transform"
          />
        </div>

        {contextLost && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]/90 text-white/70 text-sm font-mono">
            3D view paused — restoring graphics context...
          </div>
        )}
      </div>
    </div>
  );
};
