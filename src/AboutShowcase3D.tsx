import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, MoveHorizontal } from 'lucide-react';

// Fixed stage camera framing (only the character turns; floor, protractor, and camera never spin away!)
const _baseCameraPos = new THREE.Vector3(0, 2.24, 5.55);
const _baseControlsTarget = new THREE.Vector3(0, 1.02, 0);

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
  const eps = 0.015 / texSize;

  const setFaceUV = (faceIndex: number, px: number, py: number, pw: number, ph: number) => {
    const u0 = px / texSize + eps;
    const u1 = (px + pw) / texSize - eps;
    const vTop = 1 - py / texSize - eps;
    const vBot = 1 - (py + ph) / texSize + eps;

    const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
    const base = faceIndex * 4;
    uvAttr.setXY(base + 0, u0, vTop);
    uvAttr.setXY(base + 1, u1, vTop);
    uvAttr.setXY(base + 2, u0, vBot);
    uvAttr.setXY(base + 3, u1, vBot);
  };

  setFaceUV(0, texX + dPx + wPx, texY + dPx, dPx, hPx); // +X Character Left
  setFaceUV(1, texX, texY + dPx, dPx, hPx); // -X Character Right
  setFaceUV(2, texX + dPx, texY, wPx, dPx); // +Y Top
  setFaceUV(3, texX + dPx + wPx, texY, wPx, dPx); // -Y Bottom
  setFaceUV(4, texX + dPx, texY + dPx, wPx, hPx); // +Z Front
  setFaceUV(5, texX + dPx + wPx + dPx, texY + dPx, wPx, hPx); // -Z Back

  geo.attributes.uv.needsUpdate = true;
  return geo;
}

interface StageTextures {
  floorAlphaMap: THREE.CanvasTexture;
  protractorLines: THREE.CanvasTexture;
  spotlightCone: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  moteSprite: THREE.CanvasTexture;
}

function createFloorAlphaMap(): THREE.CanvasTexture {
  // Soft radial alpha fade tightly hugging the circular floor spotlight pool into #000
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(256, 256, 36, 256, 256, 218);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#cfcfcf');
  grad.addColorStop(0.8, '#363636');
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function createProtractorLinesTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Inner bright standing ring hugging the smaller character's feet
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 68, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Middle dashed protractor reference ring
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([7, 11]);
  ctx.beginPath();
  ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Subtle 45-degree radial dashed spoke lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 9]);
  for (let deg = 0; deg < 360; deg += 45) {
    const rad = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * 74, cy + Math.sin(rad) * 74);
    ctx.lineTo(cx + Math.cos(rad) * 176, cy + Math.sin(rad) * 176);
    ctx.stroke();
  }
  ctx.restore();

  // Outer protractor degree ring & full 360° ticks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 178, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 212, 0, Math.PI * 2);
  ctx.stroke();

  for (let deg = 0; deg < 360; deg += 5) {
    const isMajor = deg % 30 === 0;
    const isMedium = deg % 15 === 0 && !isMajor;

    const canvasAngle = Math.PI / 2 - (deg * Math.PI) / 180;
    const cosA = Math.cos(canvasAngle);
    const sinA = Math.sin(canvasAngle);

    const rInner = isMajor ? 168 : isMedium ? 172 : 174;
    const rOuter = isMajor ? 187 : isMedium ? 183 : 178;

    ctx.strokeStyle = isMajor
      ? 'rgba(255, 255, 255, 0.6)'
      : isMedium
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = isMajor ? 1.8 : 1;

    ctx.beginPath();
    ctx.moveTo(cx + cosA * rInner, cy + sinA * rInner);
    ctx.lineTo(cx + cosA * rOuter, cy + sinA * rOuter);
    ctx.stroke();

    if (isMajor) {
      const label = String(deg).padStart(3, '0');
      const rText = 198;
      const tx = cx + cosA * rText;
      const ty = cy + sinA * rText;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(canvasAngle - Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createTrueSpotlightConeTexture(): THREE.CanvasTexture {
  // Visible, softly feathered volumetric overhead spotlight cone with subtle vertical light shafts
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
    const coneHalfWidth = 0.11 + ny * 0.18;
    const edgeFeather = 0.12 + ny * 0.11;

    const botFade = 1 - smoothstep(0.48, 0.94, ny);
    const verticalIntensity = botFade * (0.92 * Math.pow(1 - ny * 0.58, 1.3) + 0.08);

    for (let x = 0; x < w; x++) {
      const u = x / (w - 1) - 0.5;
      const dist = Math.abs(u);
      const insideCone = 1 - smoothstep(coneHalfWidth - edgeFeather * 0.4, coneHalfWidth + edgeFeather, dist);
      const sigma = coneHalfWidth * 0.62;
      const coreBoost = 0.62 + 0.38 * Math.exp(-(dist * dist) / (2 * sigma * sigma));
      // Subtle soft volumetric rays inside the beam
      const rayStreaks = 0.85 + 0.15 * Math.cos(u * 28.0 + ny * 1.2) * Math.cos(u * 13.0);
      const alpha = Math.max(0, Math.min(1, insideCone * coreBoost * verticalIntensity * rayStreaks));

      const idx = (y * w + x) * 4;
      data[idx + 0] = 245;
      data[idx + 1] = 247;
      data[idx + 2] = 252;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStageTextures(maxAnisotropy: number): StageTextures {
  const floorAlphaMap = createFloorAlphaMap();
  const protractorLines = createProtractorLinesTexture(maxAnisotropy);
  const spotlightCone = createTrueSpotlightConeTexture();

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
  sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  const moteCanvas = document.createElement('canvas');
  moteCanvas.width = 64;
  moteCanvas.height = 64;
  const mCtx = moteCanvas.getContext('2d')!;
  const mGrad = mCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  mGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  mGrad.addColorStop(0.45, 'rgba(235, 240, 248, 0.45)');
  mGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  mCtx.fillStyle = mGrad;
  mCtx.fillRect(0, 0, 64, 64);
  const moteSprite = new THREE.CanvasTexture(moteCanvas);
  moteSprite.colorSpace = THREE.SRGBColorSpace;

  return {
    floorAlphaMap,
    protractorLines,
    spotlightCone,
    contactShadow,
    moteSprite,
  };
}

interface AboutShowcase3DProps {
  pointerTargetRef?: React.MutableRefObject<{ x: number; y: number }>;
  scrollLightRef?: React.MutableRefObject<number>;
}

export const AboutShowcase3D: React.FC<AboutShowcase3DProps> = ({
  pointerTargetRef,
  scrollLightRef,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const resetCallbackRef = useRef<(() => void) | null>(null);
  const localPointerRef = useRef({ x: 0, y: 0 });

  // Animated top white line + tight spotlight aperture refs
  const topLineAuraRef = useRef<HTMLDivElement>(null);
  const topLineStrokeRef = useRef<HTMLDivElement>(null);
  const topApertureRef = useRef<HTMLDivElement>(null);

  // DOM overlay refs updated directly inside RAF (zero React re-renders!)
  const grainOverlayRef = useRef<HTMLDivElement>(null);
  const statFarLeftRef = useRef<HTMLDivElement>(null);
  const statMidLeftRef = useRef<HTMLDivElement>(null);
  const statMidRightRef = useRef<HTMLDivElement>(null);
  const statFarRightRef = useRef<HTMLDivElement>(null);
  const identityCalloutRef = useRef<HTMLDivElement>(null);
  const rightSpecsRef = useRef<HTMLDivElement>(null);
  const mobileIdentityRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 740;

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

    // 2. Scene, Camera, Alpha-Transparent Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 80);
    camera.position.copy(_baseCameraPos);
    camera.lookAt(_baseControlsTarget);

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

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 3. Stage & Minecraft Skin Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createStageTextures(maxAniso);

    const textureLoader = new THREE.TextureLoader();
    const skinTexture = textureLoader.load('/assets/aistudio/raychristo_ea864ecd.png', () => {
      skinTexture.needsUpdate = true;
    });
    skinTexture.colorSpace = THREE.SRGBColorSpace;
    skinTexture.magFilter = THREE.NearestFilter;
    skinTexture.minFilter = THREE.NearestFilter;
    skinTexture.generateMipmaps = false;

    // 4. STUDIO SPOTLIGHT RIG (Crisp head/shoulder shadows onto chest & floor, clean neutral tones)
    const hemiLight = new THREE.HemisphereLight(0xeef2f7, 0x2c2e33, 0);
    scene.add(hemiLight);

    // Key SpotLight from upper-right-front casts crisp shadow back-left on floor + diagonal across chest
    const mainSpot = new THREE.SpotLight(0xffffff, 0, 18, Math.PI / 7.2, 0.68, 1.25);
    mainSpot.position.set(1.95, 5.2, 2.35);
    mainSpot.target.position.set(0, 0.35, 0);
    if (!isSoftwareGl) {
      mainSpot.castShadow = true;
      mainSpot.shadow.mapSize.width = 2048;
      mainSpot.shadow.mapSize.height = 2048;
      mainSpot.shadow.camera.near = 2.0;
      mainSpot.shadow.camera.far = 11.5;
      mainSpot.shadow.focus = 0.85;
      mainSpot.shadow.bias = -0.0004;
      mainSpot.shadow.normalBias = 0.016;
      mainSpot.shadow.radius = 1.15;
    }
    scene.add(mainSpot);
    scene.add(mainSpot.target);

    // Overhead soft studio fill for top hair & shoulders
    const crownFill = new THREE.SpotLight(0xf8faff, 0, 14, Math.PI / 5.2, 0.9, 1.4);
    crownFill.position.set(-0.1, 5.4, 0.7);
    crownFill.target.position.set(0, 0.9, 0);
    scene.add(crownFill);
    scene.add(crownFill.target);

    // Soft front-left fill reveals dark hoodie voxel plane shading without flattening key shadow
    const frontFill = new THREE.DirectionalLight(0xeef2f7, 0);
    frontFill.position.set(-2.0, 1.6, 3.0);
    scene.add(frontFill);

    // Neutral-cool back rim light separates dark charcoal hoodie edges cleanly from dark background
    const rimLight = new THREE.DirectionalLight(0xdce6f5, 0);
    rimLight.position.set(-1.4, 3.8, -2.9);
    scene.add(rimLight);

    // 5. Lit Physical Floor Plane + Protractor Overlay
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const floorSize = 8.4;

    const litFloorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const litFloorMat = new THREE.MeshStandardMaterial({
      color: 0x35373c,
      roughness: 0.94,
      metalness: 0.0,
      alphaMap: textures.floorAlphaMap,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const litFloorMesh = new THREE.Mesh(litFloorGeo, litFloorMat);
    litFloorMesh.rotation.x = -Math.PI / 2;
    litFloorMesh.position.y = 0.0;
    litFloorMesh.receiveShadow = !isSoftwareGl;
    litFloorMesh.renderOrder = 0;
    stageGroup.add(litFloorMesh);

    const protractorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const protractorMat = new THREE.MeshBasicMaterial({
      map: textures.protractorLines,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const protractorMesh = new THREE.Mesh(protractorGeo, protractorMat);
    protractorMesh.rotation.x = -Math.PI / 2;
    protractorMesh.position.y = 0.005;
    protractorMesh.renderOrder = 2;
    stageGroup.add(protractorMesh);

    const contactGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const contactMat = new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = 0.003;
    contactMesh.renderOrder = 1;
    stageGroup.add(contactMesh);

    // Soft overhead volumetric light shaft descending behind the character (stays strictly above floor y >= 0.06)
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 3.0, -0.78);
    stageGroup.add(beamPivot);

    const beamPlaneGeo = new THREE.PlaneGeometry(5.2, 2.94);
    const beamPlaneMat = new THREE.MeshBasicMaterial({
      map: textures.spotlightCone,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamBillboard = new THREE.Mesh(beamPlaneGeo, beamPlaneMat);
    beamBillboard.position.set(0, -1.47, 0);
    beamBillboard.renderOrder = 4;
    beamPivot.add(beamBillboard);

    // === PROTRACTOR TRIANGULAR LOOK-DIRECTION MARKER (toneMapped: false so always razor-white!) ===
    const innerRingWorldR = (68 / 512) * (floorSize / 2); // ~0.558
    const outerRingWorldR = (178 / 512) * (floorSize / 2); // ~1.460

    const lookMarkerPivot = new THREE.Group();
    lookMarkerPivot.position.set(0, 0.016, 0);
    stageGroup.add(lookMarkerPivot);

    const triShape = new THREE.Shape();
    triShape.moveTo(0, 0.2);
    triShape.lineTo(-0.1, -0.02);
    triShape.lineTo(0.1, -0.02);
    triShape.closePath();

    const triGeo = new THREE.ShapeGeometry(triShape);
    triGeo.rotateX(Math.PI / 2);

    const triMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const triMesh = new THREE.Mesh(triGeo, triMat);
    triMesh.position.set(0, 0, innerRingWorldR + 0.03);
    triMesh.renderOrder = 3;
    lookMarkerPivot.add(triMesh);

    const outerTriShape = new THREE.Shape();
    outerTriShape.moveTo(0, -0.14);
    outerTriShape.lineTo(-0.08, 0.02);
    outerTriShape.lineTo(0.08, 0.02);
    outerTriShape.closePath();
    const outerTriGeo = new THREE.ShapeGeometry(outerTriShape);
    outerTriGeo.rotateX(Math.PI / 2);
    const outerTriMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const outerTriMesh = new THREE.Mesh(outerTriGeo, outerTriMat);
    outerTriMesh.position.set(0, 0, outerRingWorldR - 0.04);
    outerTriMesh.renderOrder = 3;
    lookMarkerPivot.add(outerTriMesh);

    const sightStartZ = innerRingWorldR + 0.19;
    const sightEndZ = outerRingWorldR - 0.16;
    const sightLen = Math.max(0.1, sightEndZ - sightStartZ);
    const sightLineGeo = new THREE.PlaneGeometry(0.014, sightLen);
    sightLineGeo.rotateX(-Math.PI / 2);
    const sightLineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const sightLine = new THREE.Mesh(sightLineGeo, sightLineMat);
    sightLine.position.set(0, 0, (sightStartZ + sightEndZ) / 2);
    sightLine.renderOrder = 3;
    lookMarkerPivot.add(sightLine);

    // Dust motes suspended strictly inside the narrow triangular spotlight beam
    const moteCount = 44;
    const motePositions = new Float32Array(moteCount * 3);
    const moteSeeds = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const yVal = 0.25 + Math.random() * 2.05;
      // Pinpoint narrow near top source, flaring cleanly inside triangle toward floor
      const maxR = 0.05 + (1 - yVal / 2.42) * 0.78;
      const r = Math.random() * maxR;
      const theta = Math.random() * Math.PI * 2;
      motePositions[i * 3 + 0] = Math.cos(theta) * r;
      motePositions[i * 3 + 1] = yVal;
      motePositions[i * 3 + 2] = Math.sin(theta) * r;

      moteSeeds[i * 3 + 0] = motePositions[i * 3 + 0];
      moteSeeds[i * 3 + 1] = motePositions[i * 3 + 1];
      moteSeeds[i * 3 + 2] = Math.random() * Math.PI * 2;
    }
    const motesGeo = new THREE.BufferGeometry();
    motesGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const motesMat = new THREE.PointsMaterial({
      map: textures.moteSprite,
      size: 0.032,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const motesPoints = new THREE.Points(motesGeo, motesMat);
    stageGroup.add(motesPoints);

    // 6. Authentic Slim (3px Arm) 64x64 Minecraft Character + Full 2nd-Layer Overlays
    // Base core meshes cast & receive crisp self-shadows (e.g. tilted head shadow onto chest!);
    // 2nd-layer clothing/hair overlays receive shadows cleanly without casting acne onto base meshes below!
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    const px = 0.049;
    const overlayExpand = 0.015;

    const skinBaseMat = new THREE.MeshStandardMaterial({
      map: skinTexture,
      roughness: 0.78,
      metalness: 0.04,
      alphaTest: 0.5,
    });
    const skinOverlayMat = new THREE.MeshStandardMaterial({
      map: skinTexture,
      roughness: 0.76,
      metalness: 0.05,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    const geometriesToDispose: THREE.BufferGeometry[] = [
      litFloorGeo,
      protractorGeo,
      contactGeo,
      beamPlaneGeo,
      triGeo,
      outerTriGeo,
      sightLineGeo,
      motesGeo,
    ];
    const materialsToDispose: THREE.Material[] = [
      litFloorMat,
      protractorMat,
      contactMat,
      beamPlaneMat,
      triMat,
      outerTriMat,
      sightLineMat,
      motesMat,
      skinBaseMat,
      skinOverlayMat,
    ];

    const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometriesToDispose.push(g);
      return g;
    };

    // Base meshes cast crisp shadows onto torso & floor; overlays receive shadows without acne
    const setCharPartShadow = (mesh: THREE.Mesh, isOverlay = false) => {
      mesh.castShadow = !isSoftwareGl && !isOverlay;
      mesh.receiveShadow = !isSoftwareGl;
      return mesh;
    };

    // -- LEGS --
    const legHipY = 12 * px;
    const halfLegY = -6 * px;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(-2 * px, legHipY, 0);
    const rLegGeo = registerGeo(createMinecraftBoxGeometry(4, 12, 4, 0, 16, px));
    const rLegMesh = setCharPartShadow(new THREE.Mesh(rLegGeo, skinBaseMat));
    rLegMesh.position.y = halfLegY;
    const rLegOverlayGeo = registerGeo(
      createMinecraftBoxGeometry(4, 12, 4, 0, 32, px, overlayExpand)
    );
    const rLegOverlay = setCharPartShadow(new THREE.Mesh(rLegOverlayGeo, skinOverlayMat), true);
    rLegOverlay.position.y = halfLegY;
    rightLegGroup.add(rLegMesh, rLegOverlay);
    rightLegGroup.rotation.x = 0.04;
    rightLegGroup.rotation.z = -0.015;
    characterGroup.add(rightLegGroup);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(2 * px, legHipY, 0);
    const lLegGeo = registerGeo(createMinecraftBoxGeometry(4, 12, 4, 16, 48, px));
    const lLegMesh = setCharPartShadow(new THREE.Mesh(lLegGeo, skinBaseMat));
    lLegMesh.position.y = halfLegY;
    const lLegOverlayGeo = registerGeo(
      createMinecraftBoxGeometry(4, 12, 4, 0, 48, px, overlayExpand)
    );
    const lLegOverlay = setCharPartShadow(new THREE.Mesh(lLegOverlayGeo, skinOverlayMat), true);
    lLegOverlay.position.y = halfLegY;
    leftLegGroup.add(lLegMesh, lLegOverlay);
    leftLegGroup.rotation.x = -0.04;
    leftLegGroup.rotation.z = 0.015;
    characterGroup.add(leftLegGroup);

    // -- UPPER BODY --
    const upperBodyGroup = new THREE.Group();
    upperBodyGroup.position.set(0, legHipY, 0);
    characterGroup.add(upperBodyGroup);

    const torsoGeo = registerGeo(createMinecraftBoxGeometry(8, 12, 4, 16, 16, px));
    const torsoMesh = setCharPartShadow(new THREE.Mesh(torsoGeo, skinBaseMat));
    torsoMesh.position.y = 6 * px;
    const torsoOverlayGeo = registerGeo(
      createMinecraftBoxGeometry(8, 12, 4, 16, 32, px, overlayExpand)
    );
    const torsoOverlay = setCharPartShadow(new THREE.Mesh(torsoOverlayGeo, skinOverlayMat), true);
    torsoOverlay.position.y = 6 * px;
    upperBodyGroup.add(torsoMesh, torsoOverlay);

    // -- HEAD + HAIR/CROWN OVERLAY --
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 12 * px, 0);
    upperBodyGroup.add(headGroup);

    const headGeo = registerGeo(createMinecraftBoxGeometry(8, 8, 8, 0, 0, px));
    const headMesh = setCharPartShadow(new THREE.Mesh(headGeo, skinBaseMat));
    headMesh.position.y = 4 * px;
    const hatGeo = registerGeo(createMinecraftBoxGeometry(8, 8, 8, 32, 0, px, overlayExpand * 1.45));
    const hatMesh = setCharPartShadow(new THREE.Mesh(hatGeo, skinOverlayMat), true);
    hatMesh.position.y = 4 * px;
    headGroup.add(headMesh, hatMesh);

    // -- SLIM ARMS --
    const shoulderY = 10 * px;
    const armOffsetY = -4 * px;

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-5.5 * px, shoulderY, 0);
    const rArmGeo = registerGeo(createMinecraftBoxGeometry(3, 12, 4, 40, 16, px));
    const rArmMesh = setCharPartShadow(new THREE.Mesh(rArmGeo, skinBaseMat));
    rArmMesh.position.y = armOffsetY;
    const rArmOverlayGeo = registerGeo(
      createMinecraftBoxGeometry(3, 12, 4, 40, 32, px, overlayExpand)
    );
    const rArmOverlay = setCharPartShadow(new THREE.Mesh(rArmOverlayGeo, skinOverlayMat), true);
    rArmOverlay.position.y = armOffsetY;
    rightArmGroup.add(rArmMesh, rArmOverlay);
    rightArmGroup.rotation.z = -0.07;
    rightArmGroup.rotation.x = -0.08;
    upperBodyGroup.add(rightArmGroup);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(5.5 * px, shoulderY, 0);
    const lArmGeo = registerGeo(createMinecraftBoxGeometry(3, 12, 4, 32, 48, px));
    const lArmMesh = setCharPartShadow(new THREE.Mesh(lArmGeo, skinBaseMat));
    lArmMesh.position.y = armOffsetY;
    const lArmOverlayGeo = registerGeo(
      createMinecraftBoxGeometry(3, 12, 4, 48, 48, px, overlayExpand)
    );
    const lArmOverlay = setCharPartShadow(new THREE.Mesh(lArmOverlayGeo, skinOverlayMat), true);
    lArmOverlay.position.y = armOffsetY;
    leftArmGroup.add(lArmMesh, lArmOverlay);
    leftArmGroup.rotation.z = 0.07;
    leftArmGroup.rotation.x = 0.08;
    upperBodyGroup.add(leftArmGroup);

    // 7. Character-Only 360° Turntable Drag
    let isPointerDown = false;
    let activePointerId: number | null = null;
    let lastClientX = 0;
    let targetCharYaw = 0;
    let smoothCharYaw = 0;
    let yawVelocity = 0;

    const canvasEl = renderer.domElement;

    const onCanvasPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isPointerDown = true;
      activePointerId = e.pointerId;
      lastClientX = e.clientX;
      yawVelocity = 0;
      setIsDragging(true);
      try {
        canvasEl.setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    };

    const onCanvasPointerMove = (e: PointerEvent) => {
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      const dx = e.clientX - lastClientX;
      lastClientX = e.clientX;
      const deltaYaw = dx * 0.011;
      targetCharYaw += deltaYaw;
      yawVelocity = deltaYaw * 14;
    };

    const onCanvasPointerUpOrCancel = (e: PointerEvent) => {
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;
      setIsDragging(false);
      try {
        if (canvasEl.hasPointerCapture(e.pointerId)) {
          canvasEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    };

    canvasEl.addEventListener('pointerdown', onCanvasPointerDown);
    canvasEl.addEventListener('pointermove', onCanvasPointerMove);
    canvasEl.addEventListener('pointerup', onCanvasPointerUpOrCancel);
    canvasEl.addEventListener('pointercancel', onCanvasPointerUpOrCancel);

    resetCallbackRef.current = () => {
      const twoPi = Math.PI * 2;
      const remainder = ((targetCharYaw % twoPi) + twoPi) % twoPi;
      const shortestOffset = remainder > Math.PI ? remainder - twoPi : remainder;
      targetCharYaw -= shortestOffset;
      smoothCharYaw = targetCharYaw + shortestOffset;
      yawVelocity = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const host = wrapperRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      localPointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      localPointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    const handlePointerLeave = () => {
      localPointerRef.current.x = 0;
      localPointerRef.current.y = 0;
    };

    const hostEl = wrapperRef.current;
    if (!pointerTargetRef && hostEl) {
      hostEl.addEventListener('pointermove', handlePointerMove, { passive: true });
      hostEl.addEventListener('pointerleave', handlePointerLeave);
    }

    // 8. Animation Loop
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();
    const smoothMouse = { x: 0, y: 0 };
    let smoothLight = 0;

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

      const targetLight = scrollLightRef ? scrollLightRef.current : 1;
      smoothLight = THREE.MathUtils.damp(smoothLight, targetLight, 4.5, delta);

      const targetMouse = pointerTargetRef ? pointerTargetRef.current : localPointerRef.current;
      smoothMouse.x = THREE.MathUtils.damp(smoothMouse.x, targetMouse.x, 2.4, delta);
      smoothMouse.y = THREE.MathUtils.damp(smoothMouse.y, targetMouse.y, 2.4, delta);

      const mx = smoothMouse.x;
      const my = smoothMouse.y;

      // Spin ONLY characterGroup
      if (!isPointerDown && Math.abs(yawVelocity) > 0.001) {
        targetCharYaw += yawVelocity * delta;
        yawVelocity *= Math.exp(-5.0 * delta);
      }
      smoothCharYaw = THREE.MathUtils.damp(smoothCharYaw, targetCharYaw, 10, delta);
      characterGroup.rotation.y = smoothCharYaw;

      // Animated White Horizontal Ceiling Line + Tight Top Spotlight Aperture
      const sweepPct = 50 + Math.sin(elapsed * 0.42) * 32;
      const breath = 0.65 + 0.35 * Math.sin(elapsed * 0.9);
      const lineGrad = `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) ${Math.max(
        0,
        sweepPct - 35
      ).toFixed(1)}%, rgba(255,255,255,${(0.95 * breath).toFixed(3)}) ${sweepPct.toFixed(
        1
      )}%, rgba(255,255,255,0.12) ${Math.min(100, sweepPct + 35).toFixed(
        1
      )}%, transparent 100%)`;

      if (topLineStrokeRef.current) {
        topLineStrokeRef.current.style.background = lineGrad;
        topLineStrokeRef.current.style.opacity = (0.45 + 0.55 * smoothLight).toFixed(3);
      }
      if (topLineAuraRef.current) {
        topLineAuraRef.current.style.background = lineGrad;
        topLineAuraRef.current.style.opacity = (0.22 + 0.48 * smoothLight).toFixed(3);
      }
      if (topApertureRef.current) {
        topApertureRef.current.style.opacity = (0.3 * smoothLight).toFixed(3);
        topApertureRef.current.style.transform = `translate3d(calc(-50% + ${(mx * 12).toFixed(
          1
        )}px), 0, 0)`;
      }

      // A. Character Idle + Natural Mouse Gaze Reaction (subtle downward tilt like reference)
      upperBodyGroup.position.y = legHipY + Math.sin(elapsed * 1.7) * 0.01;
      upperBodyGroup.rotation.y = THREE.MathUtils.damp(
        upperBodyGroup.rotation.y,
        mx * 0.16,
        6,
        delta
      );
      upperBodyGroup.rotation.x = THREE.MathUtils.damp(
        upperBodyGroup.rotation.x,
        0.02 + Math.max(0, my) * 0.05,
        6,
        delta
      );
      upperBodyGroup.rotation.z = THREE.MathUtils.damp(
        upperBodyGroup.rotation.z,
        -mx * 0.024,
        6,
        delta
      );

      const idleHeadYaw = Math.sin(elapsed * 0.65) * 0.035;
      const idleHeadPitch = Math.sin(elapsed * 1.1) * 0.015;
      headGroup.rotation.y = THREE.MathUtils.damp(
        headGroup.rotation.y,
        idleHeadYaw + mx * 0.44,
        7,
        delta
      );
      headGroup.rotation.x = THREE.MathUtils.damp(
        headGroup.rotation.x,
        0.08 + idleHeadPitch + my * 0.24,
        7,
        delta
      );
      headGroup.rotation.z = THREE.MathUtils.damp(
        headGroup.rotation.z,
        -mx * 0.045,
        6,
        delta
      );

      rightArmGroup.rotation.x = -0.08 - Math.sin(elapsed * 1.35) * 0.03 - my * 0.08;
      rightArmGroup.rotation.z = -0.07 - Math.abs(mx) * 0.025 + mx * 0.02;
      leftArmGroup.rotation.x = 0.08 + Math.sin(elapsed * 1.35) * 0.03 + my * 0.07;
      leftArmGroup.rotation.z = 0.07 + Math.abs(mx) * 0.025 + mx * 0.02;

      // B. Protractor Triangular Marker tracks character's 360° look direction
      const totalLookYaw =
        characterGroup.rotation.y + upperBodyGroup.rotation.y + headGroup.rotation.y;
      lookMarkerPivot.rotation.y = totalLookYaw;

      // C. STUDIO SPOTLIGHT RIG (Soft readable shadows + crisp head/chest diagonal shadow!)
      hemiLight.intensity = 0.95 * smoothLight;

      mainSpot.intensity = 58.0 * smoothLight;
      mainSpot.position.x = 1.95 + mx * 0.9;
      mainSpot.position.y = 5.2;
      mainSpot.position.z = 2.35 - my * 0.6;
      mainSpot.target.position.x = -mx * 0.14;
      mainSpot.target.position.y = 0.35;
      mainSpot.target.position.z = -my * 0.12;

      crownFill.intensity = 10.5 * smoothLight;
      crownFill.position.x = -0.1 + mx * 0.3;

      frontFill.intensity = 0.38 * smoothLight;
      rimLight.intensity = 0.78 * smoothLight;

      // Overhead soft volumetric shaft subtly reacts to cursor
      beamPivot.position.x = mx * 0.16;
      beamPivot.rotation.z = mx * 0.055;
      beamPlaneMat.opacity = 0.46 * smoothLight;

      litFloorMat.opacity = smoothLight;
      protractorMat.opacity = 0.88 * smoothLight;
      contactMat.opacity = 0.32 * smoothLight;
      triMat.opacity = 0.98 * smoothLight;
      outerTriMat.opacity = 0.78 * smoothLight;
      sightLineMat.opacity = 0.3 * smoothLight;
      motesMat.opacity = 0.52 * smoothLight;

      // D. Dust Motes shimmering inside narrow spotlight beam
      const posAttr = motesGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < moteCount; i++) {
        const seedX = moteSeeds[i * 3 + 0];
        const seedY = moteSeeds[i * 3 + 1];
        const phase = moteSeeds[i * 3 + 2];
        posAttr.setX(i, seedX + Math.sin(elapsed * 0.25 + phase) * 0.045 - mx * 0.06);
        posAttr.setY(i, seedY + Math.cos(elapsed * 0.2 + phase * 1.3) * 0.07 - my * 0.03);
      }
      posAttr.needsUpdate = true;
      motesPoints.rotation.y = elapsed * 0.02 + mx * 0.03;

      // E. Subtle Camera Mouse Parallax
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        _baseCameraPos.x + mx * 0.18,
        5,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        _baseCameraPos.y - my * 0.1,
        5,
        delta
      );
      camera.lookAt(
        _baseControlsTarget.x + mx * 0.07,
        _baseControlsTarget.y - my * 0.035,
        _baseControlsTarget.z
      );

      // F. Constrained Film Grain & Mouse Parallax Overlays (NO washed-out sky!)
      if (grainOverlayRef.current) {
        grainOverlayRef.current.style.opacity = (0.025 + smoothLight * 0.045).toFixed(3);
      }

      const uiOpacity = (0.28 + smoothLight * 0.72).toFixed(3);

      if (statFarLeftRef.current) {
        statFarLeftRef.current.style.opacity = uiOpacity;
        statFarLeftRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 16
        ).toFixed(2)}px, ${(my * 10).toFixed(2)}px, 0) rotateY(${(22 + mx * 4.2).toFixed(
          2
        )}deg) rotateX(${(-my * 3.5).toFixed(2)}deg) rotateZ(-2.5deg)`;
      }
      if (statMidLeftRef.current) {
        statMidLeftRef.current.style.opacity = uiOpacity;
        statMidLeftRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 12
        ).toFixed(2)}px, ${(my * 8).toFixed(2)}px, 0) rotateY(${(14 + mx * 3.5).toFixed(
          2
        )}deg) rotateX(${(-my * 3).toFixed(2)}deg) rotateZ(-1.5deg)`;
      }
      if (statMidRightRef.current) {
        statMidRightRef.current.style.opacity = uiOpacity;
        statMidRightRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 12
        ).toFixed(2)}px, ${(my * 8).toFixed(2)}px, 0) rotateY(${(-14 + mx * 3.5).toFixed(
          2
        )}deg) rotateX(${(-my * 3).toFixed(2)}deg) rotateZ(1.5deg)`;
      }
      if (statFarRightRef.current) {
        statFarRightRef.current.style.opacity = uiOpacity;
        statFarRightRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 16
        ).toFixed(2)}px, ${(my * 10).toFixed(2)}px, 0) rotateY(${(-22 + mx * 4.2).toFixed(
          2
        )}deg) rotateX(${(-my * 3.5).toFixed(2)}deg) rotateZ(2.5deg)`;
      }
      if (identityCalloutRef.current) {
        identityCalloutRef.current.style.opacity = uiOpacity;
        identityCalloutRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 14
        ).toFixed(2)}px, ${(my * 9).toFixed(2)}px, 0) rotateY(${(mx * 3.6).toFixed(
          2
        )}deg) rotateX(${(-my * 3).toFixed(2)}deg)`;
      }
      if (rightSpecsRef.current) {
        rightSpecsRef.current.style.opacity = uiOpacity;
        rightSpecsRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 14
        ).toFixed(2)}px, ${(my * 9).toFixed(2)}px, 0) rotateY(${(mx * 3.6).toFixed(
          2
        )}deg) rotateX(${(-my * 3).toFixed(2)}deg)`;
      }
      if (mobileIdentityRef.current) {
        mobileIdentityRef.current.style.opacity = uiOpacity;
        mobileIdentityRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 10
        ).toFixed(2)}px, ${(my * 6).toFixed(2)}px, 0)`;
      }
      if (bottomBarRef.current) {
        bottomBarRef.current.style.opacity = uiOpacity;
        bottomBarRef.current.style.transform = `perspective(900px) translate3d(${(
          mx * 9
        ).toFixed(2)}px, ${(my * 5).toFixed(2)}px, 0)`;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 9. ResizeObserver
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

    // 10. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      canvasEl.removeEventListener('pointerdown', onCanvasPointerDown);
      canvasEl.removeEventListener('pointermove', onCanvasPointerMove);
      canvasEl.removeEventListener('pointerup', onCanvasPointerUpOrCancel);
      canvasEl.removeEventListener('pointercancel', onCanvasPointerUpOrCancel);
      if (!pointerTargetRef && hostEl) {
        hostEl.removeEventListener('pointermove', handlePointerMove);
        hostEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      Object.values(textures).forEach((t) => {
        if (t instanceof THREE.Texture) t.dispose();
      });
      skinTexture.dispose();
      renderer.dispose();
    };
  }, [pointerTargetRef, scrollLightRef]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-[640px] sm:h-[720px] lg:h-[800px] select-none overflow-visible"
    >
      {/* Clean Animated White Light-Beam Line Across Top Cutoff + Focused Spotlight Fixture Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
      >
        <div
          ref={topLineAuraRef}
          className="h-3 -mt-1.5 w-full blur-md pointer-events-none"
          style={{ opacity: 0.4 }}
        />
        <div
          ref={topLineStrokeRef}
          className="h-[1.5px] -mt-1.5 w-full pointer-events-none"
          style={{ opacity: 0.65 }}
        />
        {/* Soft top-edge spotlight ambient glow */}
        <div
          ref={topApertureRef}
          className="absolute top-0 left-1/2 w-56 h-12 -mt-1.5 pointer-events-none"
          style={{
            opacity: 0,
            transform: 'translate3d(-50%, 0, 0)',
            background:
              'radial-gradient(ellipse 50% 55% at 50% 15%, rgba(255, 255, 255, 0.32) 0%, rgba(235, 240, 248, 0.1) 48%, rgba(0, 0, 0, 0) 85%)',
          }}
        />
      </div>

      {/* Edge-to-Edge Transparent WebGL Canvas */}
      <div
        ref={mountRef}
        className={`relative z-10 w-full h-full touch-pan-y ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 82%, transparent 100%)',
        }}
      />

      {/* Subtle 35mm Film Grain Strictly Inside Spotlight Cone */}
      <div
        ref={grainOverlayRef}
        aria-hidden="true"
        className="absolute top-0 -bottom-16 left-0 right-0 z-20 pointer-events-none mix-blend-screen"
        style={{
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
          maskImage: 'radial-gradient(ellipse 28% 66% at 50% 48%, black 10%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 28% 66% at 50% 48%, black 10%, transparent 78%)',
        }}
      />

      {/* WebGL Context Loss Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 text-white/70 text-sm font-mono">
          3D view paused — restoring graphics context...
        </div>
      )}

      {/* === CENTERED MAX-WIDTH OVERLAY CONTAINER === */}
      <div className="absolute inset-0 max-w-7xl mx-auto z-20 pointer-events-none">
        {/* Far Left: 4+ years experience */}
        <div
          ref={statFarLeftRef}
          className="hidden md:block absolute top-[28%] left-4 lg:left-8 xl:left-10 will-change-transform"
          style={{ transform: 'perspective(900px) rotateY(22deg) rotateZ(-2.5deg)' }}
        >
          <div className="flex items-baseline gap-2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <span className="text-2xl lg:text-4xl xl:text-[42px] font-mazzard font-bold tracking-tight text-white">
              4+
            </span>
            <span className="text-xs lg:text-sm xl:text-base font-normal text-white/65">
              years experience
            </span>
          </div>
        </div>

        {/* Mid Left: 50+ videos edited */}
        <div
          ref={statMidLeftRef}
          className="hidden md:block absolute top-[14%] left-[14%] lg:left-[18%] xl:left-[19%] will-change-transform"
          style={{ transform: 'perspective(900px) rotateY(14deg) rotateZ(-1.5deg)' }}
        >
          <div className="flex items-baseline gap-2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <span className="text-xl lg:text-3xl font-mazzard font-bold tracking-tight text-white">
              50+
            </span>
            <span className="text-xs lg:text-sm font-normal text-white/65">
              videos edited
            </span>
          </div>
        </div>

        {/* Mid Right: Reliable turnaround time */}
        <div
          ref={statMidRightRef}
          className="hidden md:block absolute top-[14%] right-[12%] lg:right-[17%] xl:right-[18%] will-change-transform"
          style={{ transform: 'perspective(900px) rotateY(-14deg) rotateZ(1.5deg)' }}
        >
          <div className="flex items-baseline gap-2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <span className="text-xl lg:text-3xl font-mazzard font-bold tracking-tight text-white">
              Reliable
            </span>
            <span className="text-xs lg:text-sm font-normal text-white/65">
              turnaround time
            </span>
          </div>
        </div>

        {/* Far Right: 100% After Effects */}
        <div
          ref={statFarRightRef}
          className="hidden md:block absolute top-[28%] right-4 lg:right-8 xl:right-10 will-change-transform"
          style={{ transform: 'perspective(900px) rotateY(-22deg) rotateZ(2.5deg)' }}
        >
          <div className="flex items-baseline gap-2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <span className="text-2xl lg:text-4xl xl:text-[42px] font-mazzard font-bold tracking-tight text-white">
              100%
            </span>
            <span className="text-xs lg:text-sm xl:text-base font-normal text-white/65">
              After Effects
            </span>
          </div>
        </div>

        {/* Inner Left Identity Callout */}
        <div
          ref={identityCalloutRef}
          className="hidden md:block absolute bottom-[24%] left-6 lg:left-[18%] xl:left-[20%] will-change-transform"
        >
          <div className="text-[11px] font-mono tracking-wider text-white/45 mb-1">
            Editor
          </div>
          <div className="flex items-baseline gap-2 drop-shadow-[0_6px_22px_rgba(0,0,0,0.9)]">
            <h2 className="text-2xl lg:text-3xl font-mazzard font-bold text-white tracking-tight">
              I&apos;m Ray.
            </h2>
            <span className="font-brand-rychr text-lg lg:text-xl text-white/85 font-bold">
              (Rychr)
            </span>
          </div>
          <p className="text-xs text-white/55 mt-1">
            Video Editor &amp; Motion Designer
          </p>
        </div>

        {/* Inner Right Spec Callouts */}
        <div
          ref={rightSpecsRef}
          className="hidden md:flex flex-col gap-5 absolute bottom-[24%] right-6 lg:right-[17%] xl:right-[19%] text-left will-change-transform"
        >
          <div className="drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <div className="text-xs font-mono text-white/85 tabular-nums">
              3-layer soundscapes
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              High-retention pacing
            </div>
          </div>
          <div className="drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
            <div className="text-[11px] font-mono text-white/50">
              Revision policy
            </div>
            <div className="text-sm font-mazzard font-semibold text-white/90 mt-0.5">
              Up to 3 passes
            </div>
          </div>
        </div>

        {/* Mobile Identity Header (< md) */}
        <div
          ref={mobileIdentityRef}
          className="md:hidden absolute top-6 left-5 right-5 flex items-center justify-between will-change-transform"
        >
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/45">
              About the editor
            </div>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-2xl font-mazzard font-bold text-white tracking-tight">
                I&apos;m Ray.
              </h2>
              <span className="font-brand-rychr text-lg text-white/85 font-bold">
                (Rychr)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Controls (Reset view & Drag hint) */}
        <div
          ref={bottomBarRef}
          className="absolute bottom-6 left-5 right-5 sm:left-8 sm:right-8 flex items-center justify-between will-change-transform"
        >
          <button
            type="button"
            data-s3d="button"
            data-s3d-depth="0.5"
            data-s3d-global-tilt="1.2"
            data-s3d-scale="1.08"
            data-s3d-tilt="10"
            onClick={() => resetCallbackRef.current?.()}
            className="pointer-events-auto inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/[0.06] will-change-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset view</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-mono text-white/50">
            <span>Drag to turn 360°</span>
            <MoveHorizontal className="w-3.5 h-3.5 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
