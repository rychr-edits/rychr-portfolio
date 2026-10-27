import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  computeCutPoints,
  getCellPolygons,
  insetPolygon,
  createRoundedShape,
  createRoundedRectShape,
  Point2D,
} from './geometry.ts';
import { createSmokedGlassMaterial } from './materials.ts';
import { drawPanelCanvas, drawNavCanvas, PanelCanvasState } from './canvasRenderer.ts';
import { BackSliver } from './BackSliver.ts';

interface ShardObject {
  id: string;
  name: string;
  group: THREE.Group;
  glassMesh: THREE.Mesh;
  decalMesh: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  uniforms: any;
  basePos: THREE.Vector3;
  // Spring physics
  lift: number;
  liftVel: number;
  tipX: number;
  tipXVel: number;
  tipY: number;
  tipYVel: number;
  // Shatter physics
  shatterVel: THREE.Vector3;
  shatterRotAxis: THREE.Vector3;
  shatterRotAngle: number;
  staggerMs: number;
}

export const FacetHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'assembled' | 'shattering' | 'paper' | 'assembling'>('assembling');
  const [paperOpacity, setPaperOpacity] = useState(0);
  const [canvasHoverState, setCanvasHoverState] = useState<PanelCanvasState>({
    hoveredButton: null,
    hoveredNavLink: null,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References for render loop
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    slabGroup: THREE.Group;
    navGroup: THREE.Group;
    navGlassMesh: THREE.Mesh | null;
    navDecalMesh: THREE.Mesh | null;
    navMaterial: THREE.MeshPhysicalMaterial;
    navUniforms: any;
    shards: Map<string, ShardObject>;
    backSliver: BackSliver;
    panelCanvas: HTMLCanvasElement;
    panelTexture: THREE.CanvasTexture;
    navCanvas: HTMLCanvasElement;
    navTexture: THREE.CanvasTexture;
    hitBoxes: any;
    pointerScreen: THREE.Vector2;
    pointerNormPanel: Point2D | null;
    pointerWorld: THREE.Vector3;
    pointerInWindow: boolean;
    currentRotX: number;
    currentRotY: number;
    lastRebuildTime: number;
    scaleS: number;
    blockWidth: number;
    blockHeight: number;
    panelWidth: number;
    panelHeight: number;
    navHeight: number;
    shatterStartTime: number;
    assembleStartTime: number;
    viewState: 'assembled' | 'shattering' | 'paper' | 'assembling';
    hoveredPieceId: string | null;
  } | null>(null);

  // Trigger Shatter Sequence
  const handleReadPaperClick = useCallback(() => {
    if (!sceneRef.current) return;
    const s = sceneRef.current;
    if (s.viewState !== 'assembled') return;

    s.viewState = 'shattering';
    s.shatterStartTime = performance.now();
    setViewMode('shattering');
  }, []);

  // Trigger Re-assemble Sequence
  const handleBackClick = useCallback(() => {
    if (!sceneRef.current) return;
    const s = sceneRef.current;
    if (s.viewState !== 'paper') return;

    s.viewState = 'assembling';
    s.assembleStartTime = performance.now();
    s.backSliver.targetScale = 0;
    setViewMode('assembling');
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect Software WebGL
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

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera setup
    // Camera fov 30deg, placed so that 1 world unit = 1 CSS px at z = 0
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    const fov = 30;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 10000);
    const halfFovRad = (fov / 2) * (Math.PI / 180);
    const cameraDist = height / 2 / Math.tan(halfFovRad);
    camera.position.set(0, 0, cameraDist);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Environment & Lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environmentIntensity = 0.42;
    pmrem.dispose();

    // Soft white-blue key light from top-left
    const keyLight = new THREE.DirectionalLight(0xdde8ff, 1.45);
    keyLight.position.set(-width * 0.4, height * 0.5, 600);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x2a3040, 0x050507, 0.65);
    scene.add(hemiLight);

    // 4. Canvases for printed glass content
    const panelCanvas = document.createElement('canvas');
    const panelTexture = new THREE.CanvasTexture(panelCanvas);
    panelTexture.colorSpace = THREE.SRGBColorSpace;
    panelTexture.minFilter = THREE.LinearFilter;
    panelTexture.magFilter = THREE.LinearFilter;

    const navCanvas = document.createElement('canvas');
    const navTexture = new THREE.CanvasTexture(navCanvas);
    navTexture.colorSpace = THREE.SRGBColorSpace;
    navTexture.minFilter = THREE.LinearFilter;
    navTexture.magFilter = THREE.LinearFilter;

    // 5. Slab Group and Back Sliver
    const slabGroup = new THREE.Group();
    scene.add(slabGroup);

    const navGroup = new THREE.Group();
    slabGroup.add(navGroup);

    const { material: navMaterial, uniforms: navUniforms } = createSmokedGlassMaterial({
      iridescence: 0.55,
      envMapIntensity: 1.0,
    });

    const backSliver = new BackSliver();
    scene.add(backSliver.group);

    // Shard Map
    const shards = new Map<string, ShardObject>();

    // Initial scale & layout parameters
    const marginSide = width < 600 ? 16 : width * 0.055;
    const marginTopBottom = height < 600 ? 16 : height * 0.085;
    const blockWidth = width - 2 * marginSide;
    const blockHeight = height - 2 * marginTopBottom;
    const scaleS = blockWidth / 1730;
    const navHeight = 0.108 * blockHeight;
    const gap = 14;
    const panelWidth = blockWidth;
    const panelHeight = blockHeight - navHeight - gap;

    // Build Nav Slab
    const navShape = createRoundedRectShape(
      panelWidth - 14 * scaleS,
      navHeight - 14 * scaleS,
      Math.max(8, 18 * scaleS)
    );
    const navExtrudeGeo = new THREE.ExtrudeGeometry(navShape, {
      depth: 13 * scaleS,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 2.6 * scaleS,
      bevelThickness: 2.6 * scaleS,
    });
    navExtrudeGeo.computeVertexNormals();

    const navGlassMesh = new THREE.Mesh(navExtrudeGeo, navMaterial);
    navGlassMesh.name = 'nav';
    navGroup.add(navGlassMesh);

    // Nav Decal
    const navDecalGeo = new THREE.PlaneGeometry(panelWidth - 14 * scaleS, navHeight - 14 * scaleS);
    const navDecalMat = new THREE.MeshBasicMaterial({
      map: navTexture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const navDecalMesh = new THREE.Mesh(navDecalGeo, navDecalMat);
    navDecalMesh.position.set(0, 0, 13 * scaleS + 2.6 * scaleS + 0.15);
    navGroup.add(navDecalMesh);

    // Position nav slab at top of block
    const navCenterY = blockHeight / 2 - navHeight / 2;
    navGroup.position.set(0, navCenterY, 0);

    // Initial draw of textures
    const initialHitBoxes = {
      ...drawPanelCanvas(panelCanvas, panelWidth, panelHeight, scaleS, {
        hoveredButton: null,
        hoveredNavLink: null,
      }).hitBoxes,
      ...drawNavCanvas(navCanvas, panelWidth, navHeight, scaleS, {
        hoveredButton: null,
        hoveredNavLink: null,
      }).hitBoxes,
    };
    panelTexture.needsUpdate = true;
    navTexture.needsUpdate = true;

    // Create 5 cell shard objects
    const cellIds = ['A', 'B', 'C', 'D', 'E'];
    const cellNames = ['Hero A', 'Shard B', 'Shard C', 'Shard D', 'Shard E'];
    const panelCenterY = -navHeight / 2 - gap / 2;

    cellIds.forEach((id, index) => {
      const { material, uniforms } = createSmokedGlassMaterial({
        iridescence: 0.55,
        envMapIntensity: 1.0,
      });

      const cellGroup = new THREE.Group();
      cellGroup.position.set(0, panelCenterY, 0);
      slabGroup.add(cellGroup);

      // Random outward/downward velocities for shatter
      const outwardX = (index - 2) * (180 + Math.random() * 100);
      const shatterVel = new THREE.Vector3(
        outwardX * scaleS,
        (-240 - Math.random() * 260) * scaleS,
        (450 + Math.random() * 320) * scaleS
      );

      // Random tumble axis (2.0 - 3.6 rad tumble)
      const shatterRotAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      const shatterRotAngle = 2.0 + Math.random() * 1.6;

      const dummyGeo = new THREE.BufferGeometry();
      const glassMesh = new THREE.Mesh(dummyGeo, material);
      glassMesh.name = id;
      cellGroup.add(glassMesh);

      const decalMat = new THREE.MeshBasicMaterial({
        map: panelTexture,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const decalMesh = new THREE.Mesh(dummyGeo, decalMat);
      cellGroup.add(decalMesh);

      shards.set(id, {
        id,
        name: cellNames[index],
        group: cellGroup,
        glassMesh,
        decalMesh,
        material,
        uniforms,
        basePos: new THREE.Vector3(0, panelCenterY, 0),
        lift: 0,
        liftVel: 0,
        tipX: 0,
        tipXVel: 0,
        tipY: 0,
        tipYVel: 0,
        shatterVel,
        shatterRotAxis,
        shatterRotAngle,
        staggerMs: 25 + index * 25,
      });
    });

    backSliver.rebuild(width, height);

    // Scene Ref
    interface SceneState {
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      renderer: THREE.WebGLRenderer;
      slabGroup: THREE.Group;
      navGroup: THREE.Group;
      navGlassMesh: THREE.Mesh | null;
      navDecalMesh: THREE.Mesh | null;
      navMaterial: THREE.MeshPhysicalMaterial;
      navUniforms: any;
      shards: Map<string, ShardObject>;
      backSliver: BackSliver;
      panelCanvas: HTMLCanvasElement;
      panelTexture: THREE.CanvasTexture;
      navCanvas: HTMLCanvasElement;
      navTexture: THREE.CanvasTexture;
      hitBoxes: any;
      pointerScreen: THREE.Vector2;
      pointerNormPanel: Point2D | null;
      pointerWorld: THREE.Vector3;
      pointerInWindow: boolean;
      currentRotX: number;
      currentRotY: number;
      lastRebuildTime: number;
      scaleS: number;
      blockWidth: number;
      blockHeight: number;
      panelWidth: number;
      panelHeight: number;
      navHeight: number;
      shatterStartTime: number;
      assembleStartTime: number;
      viewState: 'assembled' | 'shattering' | 'paper' | 'assembling';
      hoveredPieceId: string | null;
    }

    const sRef: SceneState = {
      scene,
      camera,
      renderer,
      slabGroup,
      navGroup,
      navGlassMesh,
      navDecalMesh,
      navMaterial,
      navUniforms,
      shards,
      backSliver,
      panelCanvas,
      panelTexture,
      navCanvas,
      navTexture,
      hitBoxes: initialHitBoxes,
      pointerScreen: new THREE.Vector2(width / 2, height / 2),
      pointerNormPanel: null,
      pointerWorld: new THREE.Vector3(0, 0, 0),
      pointerInWindow: false,
      currentRotX: 0,
      currentRotY: 0,
      lastRebuildTime: 0,
      scaleS,
      blockWidth,
      blockHeight,
      panelWidth,
      panelHeight,
      navHeight,
      shatterStartTime: 0,
      assembleStartTime: performance.now(),
      viewState: 'assembling',
      hoveredPieceId: null,
    };
    sceneRef.current = sRef;

    // Helper: Rebuild cut cells geometry
    const rebuildCutCells = (time: number) => {
      const isPortrait = width < height;
      const nodes = computeCutPoints(time, sRef.pointerNormPanel, isPortrait);
      const polys = getCellPolygons(nodes);

      const S = sRef.scaleS;
      const halfGap = 7 * S;
      const cornerRadius = 20 * S;
      const extrudeDepth = 13 * S;
      const bevelSize = 2.6 * S;

      polys.forEach(({ id, poly }) => {
        const shard = sRef.shards.get(id);
        if (!shard) return;

        // Convert normalized [0, 1]x[0, 1] to panel local coordinates (x right, y up)
        const localPoints: Point2D[] = poly.map((p) => ({
          x: (p.x - 0.5) * sRef.panelWidth,
          y: (0.5 - p.y) * sRef.panelHeight,
        }));

        // Inset polygon by halfGap (7 * S)
        const inset = insetPolygon(localPoints, halfGap);
        const roundedShape = createRoundedShape(inset, cornerRadius);

        // Extrude geometry for 3D glass
        const extrudeGeo = new THREE.ExtrudeGeometry(roundedShape, {
          depth: extrudeDepth,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: bevelSize,
          bevelThickness: bevelSize,
        });
        extrudeGeo.computeVertexNormals();

        // ShapeGeometry for printed text decal
        const decalGeo = new THREE.ShapeGeometry(roundedShape);
        // Map UVs to full panel canvas
        const posAttr = decalGeo.attributes.position;
        const uvs = new Float32Array((posAttr.count) * 2);
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vy = posAttr.getY(i);
          const u = (vx + sRef.panelWidth / 2) / sRef.panelWidth;
          const v = (sRef.panelHeight / 2 - vy) / sRef.panelHeight;
          uvs[i * 2] = u;
          uvs[i * 2 + 1] = 1.0 - v; // Flip y for Three.js texture coordinate
        }
        decalGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Dispose old geometries and assign new
        shard.glassMesh.geometry.dispose();
        shard.glassMesh.geometry = extrudeGeo;

        shard.decalMesh.geometry.dispose();
        shard.decalMesh.geometry = decalGeo;
        shard.decalMesh.position.set(0, 0, extrudeDepth + bevelSize + 0.15);
      });
    };

    // First rebuild
    rebuildCutCells(0);

    // Event Handlers
    const raycaster = new THREE.Raycaster();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onPointerMove = (e: MouseEvent) => {
      sRef.pointerInWindow = true;
      sRef.pointerScreen.set(e.clientX, e.clientY);

      // Raycast to find pointer world position at z = 0
      const ndcX = (e.clientX / width) * 2 - 1;
      const ndcY = -(e.clientY / height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      raycaster.ray.intersectPlane(planeZ0, sRef.pointerWorld);

      // Compute normalized pointer in panel space [0, 1]x[0, 1]
      const panelCenterX = 0;
      const panelCenterY = -sRef.navHeight / 2 - 7;
      const px = (sRef.pointerWorld.x - (panelCenterX - sRef.panelWidth / 2)) / sRef.panelWidth;
      const py = (panelCenterY + sRef.panelHeight / 2 - sRef.pointerWorld.y) / sRef.panelHeight;

      if (px >= 0 && px <= 1 && py >= 0 && py <= 1) {
        sRef.pointerNormPanel = { x: px, y: py };
      } else {
        sRef.pointerNormPanel = null;
      }

      // Check button hover states on canvas
      const canvasPx = px * sRef.panelWidth;
      const canvasPy = py * sRef.panelHeight;

      let hoveredBtn: 'open-studio' | 'read-paper' | null = null;
      if (sRef.hitBoxes.openStudio) {
        const b = sRef.hitBoxes.openStudio;
        if (canvasPx >= b.x && canvasPx <= b.x + b.width && canvasPy >= b.y && canvasPy <= b.y + b.height) {
          hoveredBtn = 'open-studio';
        }
      }
      if (sRef.hitBoxes.readPaper) {
        const b = sRef.hitBoxes.readPaper;
        if (canvasPx >= b.x && canvasPx <= b.x + b.width && canvasPy >= b.y && canvasPy <= b.y + b.height) {
          hoveredBtn = 'read-paper';
        }
      }

      // Check nav links hover
      let hoveredNav: string | null = null;
      const navCenterY = sRef.blockHeight / 2 - sRef.navHeight / 2;
      const navLocalY = navCenterY + sRef.navHeight / 2 - sRef.pointerWorld.y;
      const navLocalX = sRef.pointerWorld.x + sRef.panelWidth / 2;
      if (navLocalY >= 0 && navLocalY <= sRef.navHeight) {
        if (sRef.hitBoxes.signIn) {
          const b = sRef.hitBoxes.signIn;
          if (navLocalX >= b.x && navLocalX <= b.x + b.width) hoveredNav = 'signin';
        }
        if (!hoveredNav && sRef.hitBoxes.centerLinks) {
          const b = sRef.hitBoxes.centerLinks;
          if (navLocalX >= b.x && navLocalX <= b.x + b.width) hoveredNav = 'center';
        }
      }

      if (hoveredBtn !== canvasHoverState.hoveredButton || hoveredNav !== canvasHoverState.hoveredNavLink) {
        setCanvasHoverState({ hoveredButton: hoveredBtn, hoveredNavLink: hoveredNav });
        drawPanelCanvas(sRef.panelCanvas, sRef.panelWidth, sRef.panelHeight, sRef.scaleS, {
          hoveredButton: hoveredBtn,
          hoveredNavLink: hoveredNav,
        });
        drawNavCanvas(sRef.navCanvas, sRef.panelWidth, sRef.navHeight, sRef.scaleS, {
          hoveredButton: hoveredBtn,
          hoveredNavLink: hoveredNav,
        });
        sRef.panelTexture.needsUpdate = true;
        sRef.navTexture.needsUpdate = true;
      }

      // Raycast against 3D glass pieces
      if (sRef.viewState === 'paper') {
        // Test back sliver
        if (sRef.backSliver.mesh) {
          const hits = raycaster.intersectObject(sRef.backSliver.mesh, false);
          sRef.backSliver.setHovered(hits.length > 0);
          document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
        }
      } else if (sRef.viewState === 'assembled') {
        const testMeshes: THREE.Object3D[] = [];
        if (sRef.navGlassMesh) testMeshes.push(sRef.navGlassMesh);
        sRef.shards.forEach((shard) => testMeshes.push(shard.glassMesh));

        const intersects = raycaster.intersectObjects(testMeshes, false);
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          sRef.hoveredPieceId = hitMesh.name;
          document.body.style.cursor = hoveredBtn || hoveredNav ? 'pointer' : 'default';
        } else {
          sRef.hoveredPieceId = null;
          document.body.style.cursor = 'default';
        }
      }
    };

    const onPointerLeave = () => {
      sRef.pointerInWindow = false;
      sRef.pointerNormPanel = null;
      sRef.hoveredPieceId = null;
      sRef.backSliver.setHovered(false);
      document.body.style.cursor = 'default';
    };

    const onClick = (e: MouseEvent) => {
      const ndcX = (e.clientX / width) * 2 - 1;
      const ndcY = -(e.clientY / height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

      if (sRef.viewState === 'paper') {
        if (sRef.backSliver.mesh) {
          const hits = raycaster.intersectObject(sRef.backSliver.mesh, false);
          if (hits.length > 0) {
            handleBackClick();
            return;
          }
        }
      }

      if (sRef.viewState === 'assembled') {
        // Check hit boxes
        if (canvasHoverState.hoveredButton === 'read-paper') {
          handleReadPaperClick();
          return;
        }
        if (canvasHoverState.hoveredButton === 'open-studio') {
          showToast('Facet Studio: Real-time dispersion & transmission engine active.');
          return;
        }
        if (canvasHoverState.hoveredNavLink === 'signin') {
          showToast('Facet Accounts: Developer session ready.');
          return;
        }
        if (canvasHoverState.hoveredNavLink === 'center') {
          showToast('Facet Lab: Exploring material formulas...');
          return;
        }
      }
    };

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      const newCameraDist = height / 2 / Math.tan(halfFovRad);
      camera.position.set(0, 0, newCameraDist);
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      const newMarginSide = width < 600 ? 16 : width * 0.055;
      const newMarginTopBottom = height < 600 ? 16 : height * 0.085;
      sRef.blockWidth = width - 2 * newMarginSide;
      sRef.blockHeight = height - 2 * newMarginTopBottom;
      sRef.scaleS = sRef.blockWidth / 1730;
      sRef.navHeight = 0.108 * sRef.blockHeight;
      sRef.panelWidth = sRef.blockWidth;
      sRef.panelHeight = sRef.blockHeight - sRef.navHeight - 14;

      backSliver.rebuild(width, height);
      rebuildCutCells(performance.now() / 1000);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    // Main Render Loop
    let lastTime = performance.now();
    let animId = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const timeSec = now / 1000;

      // 1. Global Tilt Smoothed with 0.3s exponential
      let targetRotY = (-1.2 * Math.PI) / 180;
      let targetRotX = (0.8 * Math.PI) / 180;

      if (sRef.pointerInWindow && sRef.viewState === 'assembled') {
        const nx = (sRef.pointerScreen.x - width / 2) / (width / 2);
        const ny = (sRef.pointerScreen.y - height / 2) / (height / 2);
        targetRotY = ((nx * 7.0 - 1.2) * Math.PI) / 180;
        targetRotX = ((-ny * 5.5 + 0.8) * Math.PI) / 180;
      }

      const tiltSmoothing = 1 - Math.exp(-dt / 0.3);
      sRef.currentRotY += (targetRotY - sRef.currentRotY) * tiltSmoothing;
      sRef.currentRotX += (targetRotX - sRef.currentRotX) * tiltSmoothing;

      sRef.slabGroup.rotation.x = sRef.currentRotX;
      sRef.slabGroup.rotation.y = sRef.currentRotY;

      // Update cursor glow uniforms on materials
      const glowTarget = sRef.pointerInWindow && sRef.viewState === 'assembled' ? 1.0 : 0.0;
      sRef.navUniforms.uPointerWorldPos.value.copy(sRef.pointerWorld);
      sRef.navUniforms.uScaleS.value = sRef.scaleS;
      sRef.navUniforms.uPointerGlow.value +=
        (glowTarget - sRef.navUniforms.uPointerGlow.value) * (1 - Math.exp(-dt * 8));

      sRef.shards.forEach((shard) => {
        shard.uniforms.uPointerWorldPos.value.copy(sRef.pointerWorld);
        shard.uniforms.uScaleS.value = sRef.scaleS;
        shard.uniforms.uPointerGlow.value = sRef.navUniforms.uPointerGlow.value;
      });

      // 2. State Machine: Assembled, Shattering, Paper, Assembling
      if (sRef.viewState === 'assembled') {
        // Rebuild cut cells at ~45x/s (every ~22ms)
        if (now - sRef.lastRebuildTime > 22) {
          rebuildCutCells(timeSec);
          sRef.lastRebuildTime = now;
        }

        // Spring Hover Physics (k = 170, c = 19)
        const k = 170;
        const c = 19;
        const S = sRef.scaleS;

        // Nav Slab spring
        const isNavHovered = sRef.hoveredPieceId === 'nav';
        const targetNavLift = isNavHovered ? 32 * S : 0;
        const navForce = -k * (sRef.navGroup.position.z - targetNavLift) - c * 0;
        sRef.navGroup.position.z += navForce * dt * 0.05;
        sRef.navMaterial.iridescence = isNavHovered ? 1.0 : 0.55;
        sRef.navMaterial.envMapIntensity = isNavHovered ? 1.9 : 1.0;

        // Cells spring
        sRef.shards.forEach((shard) => {
          const isHovered = sRef.hoveredPieceId === shard.id;
          const targetLift = isHovered ? 50 * S : 0;

          // Tip calculation based on pointer offset from shard center
          let targetTipX = 0;
          let targetTipY = 0;
          if (isHovered && sRef.pointerNormPanel) {
            targetTipX = (sRef.pointerNormPanel.y - 0.5) * 0.24;
            targetTipY = (sRef.pointerNormPanel.x - 0.5) * -0.24;
          }

          // Spring for lift
          const fLift = -k * (shard.lift - targetLift) - c * shard.liftVel;
          shard.liftVel += fLift * dt;
          shard.lift += shard.liftVel * dt;

          // Spring for tipX
          const fTipX = -k * (shard.tipX - targetTipX) - c * shard.tipXVel;
          shard.tipXVel += fTipX * dt;
          shard.tipX += shard.tipXVel * dt;

          // Spring for tipY
          const fTipY = -k * (shard.tipY - targetTipY) - c * shard.tipYVel;
          shard.tipYVel += fTipY * dt;
          shard.tipY += shard.tipYVel * dt;

          shard.group.position.z = shard.lift;
          shard.group.rotation.x = shard.tipX;
          shard.group.rotation.y = shard.tipY;

          // Iridescence 0.55 -> 1.0, envMapIntensity 1.0 -> 1.9 on hover
          shard.material.iridescence = isHovered ? 1.0 : 0.55;
          shard.material.envMapIntensity = isHovered ? 1.9 : 1.0;
        });
      } else if (sRef.viewState === 'shattering') {
        const elapsed = (now - sRef.shatterStartTime) / 1000;
        const duration = 0.72; // 0.72s shatter

        // Nav flies off first (stagger 0)
        const navT = Math.min(1.0, Math.max(0, elapsed / duration));
        const navEase = navT * navT * navT; // ease-in cubic
        sRef.navGroup.position.z = 600 * sRef.scaleS * navEase;
        sRef.navGroup.position.y = sRef.blockHeight / 2 - sRef.navHeight / 2 - 250 * sRef.scaleS * navEase;
        sRef.navGroup.position.x = 80 * sRef.scaleS * navEase;
        sRef.navGroup.rotation.x = 1.4 * navEase;
        sRef.navGroup.rotation.y = -0.8 * navEase;

        // Shards fly off with ease-in cubic and stagger
        sRef.shards.forEach((shard) => {
          const shardElapsed = Math.max(0, elapsed - shard.staggerMs / 1000);
          const t = Math.min(1.0, shardElapsed / (duration - shard.staggerMs / 1000));
          const easeInCubic = t * t * t;

          shard.group.position.x = shard.shatterVel.x * easeInCubic;
          shard.group.position.y = shard.basePos.y + shard.shatterVel.y * easeInCubic;
          shard.group.position.z = shard.shatterVel.z * easeInCubic;

          const angle = shard.shatterRotAngle * easeInCubic;
          shard.group.setRotationFromAxisAngle(shard.shatterRotAxis, angle);
        });

        // Definitions view fades in from 0.28s over 0.4s
        if (elapsed >= 0.28) {
          const paperT = Math.min(1.0, (elapsed - 0.28) / 0.4);
          setPaperOpacity(paperT);
        }

        // Back sliver grows in from 0.3s
        if (elapsed >= 0.3) {
          sRef.backSliver.targetScale = 1.0;
        }

        if (elapsed >= duration + 0.15) {
          sRef.viewState = 'paper';
          setViewMode('paper');
          setPaperOpacity(1.0);
        }
      } else if (sRef.viewState === 'paper') {
        // Fully transitioned into paper/definitions view
        setPaperOpacity(1.0);
        sRef.backSliver.targetScale = 1.0;
      } else if (sRef.viewState === 'assembling') {
        const elapsed = (now - sRef.assembleStartTime) / 1000;
        const duration = 0.72; // 0.72s fly back

        // Definitions fade out in 0.25s
        const fadeT = Math.max(0, 1.0 - elapsed / 0.25);
        setPaperOpacity(fadeT);

        // Ease-out-back helper with slight overshoot
        const easeOutBack = (x: number): number => {
          const c1 = 1.35;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        };

        // Fly back along the reverse trajectories
        const navT = Math.min(1.0, Math.max(0, elapsed / duration));
        const navFactor = 1.0 - easeOutBack(navT);
        sRef.navGroup.position.z = 600 * sRef.scaleS * Math.max(0, navFactor);
        sRef.navGroup.position.y =
          sRef.blockHeight / 2 - sRef.navHeight / 2 - 250 * sRef.scaleS * Math.max(0, navFactor);
        sRef.navGroup.position.x = 80 * sRef.scaleS * Math.max(0, navFactor);
        sRef.navGroup.rotation.x = 1.4 * Math.max(0, navFactor);
        sRef.navGroup.rotation.y = -0.8 * Math.max(0, navFactor);

        sRef.shards.forEach((shard) => {
          const shardElapsed = Math.max(0, elapsed - shard.staggerMs / 1000);
          const t = Math.min(1.0, shardElapsed / (duration - shard.staggerMs / 1000));
          const factor = t < 1.0 ? 1.0 - easeOutBack(t) : 0;

          shard.group.position.x = shard.shatterVel.x * factor;
          shard.group.position.y = shard.basePos.y + shard.shatterVel.y * factor;
          shard.group.position.z = shard.shatterVel.z * factor;

          const angle = shard.shatterRotAngle * factor;
          shard.group.setRotationFromAxisAngle(shard.shatterRotAxis, angle);
        });

        if (elapsed >= duration + 0.15) {
          sRef.viewState = 'assembled';
          setViewMode('assembled');
          setPaperOpacity(0);
          // Reset positions clean
          sRef.navGroup.position.set(0, sRef.blockHeight / 2 - sRef.navHeight / 2, 0);
          sRef.navGroup.rotation.set(0, 0, 0);
          sRef.shards.forEach((shard) => {
            shard.group.position.set(0, shard.basePos.y, 0);
            shard.group.rotation.set(0, 0, 0);
            shard.lift = 0;
            shard.liftVel = 0;
            shard.tipX = 0;
            shard.tipXVel = 0;
            shard.tipY = 0;
            shard.tipYVel = 0;
          });
        }
      }

      // Update Back Sliver
      sRef.backSliver.update(timeSec, dt, sRef.pointerWorld);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [handleBackClick, handleReadPaperClick]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507] font-['Inter',sans-serif]">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-default" />

      {/* Definitions / Paper View (Fades in over 0.4s starting at 0.28s) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 flex flex-col justify-center"
        style={{
          opacity: paperOpacity,
          display: paperOpacity <= 0.01 && viewMode === 'assembled' ? 'none' : 'flex',
        }}
      >
        <div
          className="absolute"
          style={{
            left: '32.4vw',
            width: '33.9vw',
            top: '32.5vh',
          }}
        >
          {/* Title: Inter 650, 1.36vw, tracking -.022em, white */}
          <h1
            className="text-white font-[650] leading-tight select-text mb-[2.2vh]"
            style={{
              fontSize: '1.36vw',
              letterSpacing: '-0.022em',
            }}
          >
            Real-time glass, in five terms.
          </h1>

          {/* 5 Paragraphs (.73vw, 1.72 line height, 60% white, bold term white + em dash, gaps 1.05vw) */}
          <div
            className="flex flex-col select-text"
            style={{
              gap: '1.05vw',
              fontSize: '0.73vw',
              lineHeight: 1.72,
              color: 'rgba(255, 255, 255, 0.60)',
            }}
          >
            <p>
              <strong className="text-white font-medium">Iridescence</strong> — Thin-film wave interference producing spectral color bands that shift continuously with viewing angle and nanometre optical thickness (250–650 nm).
            </p>
            <p>
              <strong className="text-white font-medium">Index of refraction</strong> — The ratio of light speed in vacuum to phase velocity in glass, governing boundary reflectance, Fresnel gain, and Snell’s angular deviation.
            </p>
            <p>
              <strong className="text-white font-medium">Dispersion</strong> — Variation of refractive index with wavelength, decomposing incident white light into chromatic fringes along acute faceted chamfers.
            </p>
            <p>
              <strong className="text-white font-medium">Transmission</strong> — The fraction of radiant flux traversing the solid volume without absorption, balancing dense charcoal attenuation with crystal clarity.
            </p>
            <p>
              <strong className="text-white font-medium">Roughness</strong> — Microfacet orientation distribution modulating specular crispness, hairline rim highlights, and grazing-angle reflections.
            </p>
          </div>
        </div>
      </div>

      {/* Accessible DOM Interaction Overlay for Buttons and Selectable Text */}
      {viewMode === 'assembled' && (
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Subtle toast feedback */}
          {toastMessage && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#121217]/90 border border-white/15 px-4 py-2 rounded-full text-xs font-mono text-white/90 backdrop-blur-md shadow-2xl transition-all">
              {toastMessage}
            </div>
          )}
        </div>
      )}

      {/* Bottom Zen Mode Control Bar (Consolidated & Collapsible as per Three.js skill guidelines) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-[#0d0d12]/80 border border-white/10 rounded-full text-[11px] font-mono text-white/60 backdrop-blur-md z-30 select-none">
        <span className="flex items-center gap-1.5 text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#36d67e]" />
          WebGL 2.0 PBR
        </span>
        <span className="text-white/20">|</span>
        <span>MeshPhysicalMaterial · 14·S Gap</span>
        <span className="text-white/20">|</span>
        <button
          onClick={viewMode === 'paper' ? handleBackClick : handleReadPaperClick}
          className="text-white/90 hover:text-white transition-colors underline cursor-pointer pointer-events-auto"
        >
          {viewMode === 'paper' ? 'Assemble Glass Slab' : 'Trigger Shatter'}
        </button>
      </div>
    </div>
  );
};
