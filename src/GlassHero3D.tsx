import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createSmokedGlassMaterial } from './materials.ts';
import {
  computeCutPoints,
  getCellPolygons,
  insetPolygon,
  createRoundedShape,
} from './geometry.ts';

interface GlassHero3DProps {
  scrollY: number;
}

export const GlassHero3D: React.FC<GlassHero3DProps> = ({ scrollY }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(scrollY);
  scrollYRef.current = scrollY;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Detect software WebGL
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

    // Scene & Camera setup (FOV 30°, 1 world unit = 1 CSS px at z = 0)
    const scene = new THREE.Scene();
    scene.background = null; // transparent so the glowing cosmic curved horizon background shows through!

    const fov = 30;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 10000);
    const halfFovRad = (fov / 2) * (Math.PI / 180);
    const cameraDist = height / 2 / Math.tan(halfFovRad);
    camera.position.set(0, 0, cameraDist);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Environment map via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    // Directional Key Light & Soft Ambient Fill
    const keyLight = new THREE.DirectionalLight(0xddeeff, 2.0);
    keyLight.position.set(-width * 0.45, height * 0.55, 750);
    scene.add(keyLight);

    const blueBackLight = new THREE.DirectionalLight(0x4477ff, 1.2);
    blueBackLight.position.set(width * 0.35, -height * 0.4, 400);
    scene.add(blueBackLight);

    const hemiLight = new THREE.HemisphereLight(0x353a4a, 0x050507, 0.9);
    scene.add(hemiLight);

    // Slab Group (Tilts with mouse)
    const slabGroup = new THREE.Group();
    scene.add(slabGroup);

    // Compute dimensions (Note: NO top nav slab piece, as requested by user)
    const marginSide = width < 600 ? 16 : width * 0.055;
    const marginTopBottom = height < 600 ? 20 : height * 0.085;
    const panelWidth = width - 2 * marginSide;
    const panelHeight = height - 2 * marginTopBottom;
    const S = panelWidth / 1730;

    // 5 Glass Shard Cells (A, B, C, D, E)
    const isPortrait = width < height;
    const cutNodes = computeCutPoints(0, null, isPortrait);
    const polys = getCellPolygons(cutNodes);

    interface ShardItem {
      id: string;
      group: THREE.Group;
      mesh: THREE.Mesh;
      material: THREE.MeshPhysicalMaterial;
      uniforms: any;
      basePos: THREE.Vector3;
      shatterVel: THREE.Vector3;
      shatterRotAxis: THREE.Vector3;
      shatterRotAngle: number;
      lift: number;
      liftVel: number;
      isHovered: boolean;
    }

    const shards: ShardItem[] = [];

    // Explicit OUTWARDS velocities so each shard travels completely off-screen:
    // Left shards travel far left (x < -width), right shards travel far right (x > +width), etc.
    const outwardDirections: Record<string, { vx: number; vy: number; vz: number; axis: THREE.Vector3; angle: number }> = {
      A: {
        vx: -1.7 * width,
        vy: -0.9 * height,
        vz: 1300 * S,
        axis: new THREE.Vector3(-0.6, -0.7, 0.4).normalize(),
        angle: 3.2,
      },
      B: {
        vx: -1.4 * width,
        vy: 1.4 * height,
        vz: 1600 * S,
        axis: new THREE.Vector3(-0.5, 0.8, -0.3).normalize(),
        angle: 3.5,
      },
      C: {
        vx: 1.3 * width,
        vy: 1.5 * height,
        vz: 1500 * S,
        axis: new THREE.Vector3(0.7, 0.6, 0.3).normalize(),
        angle: 3.0,
      },
      D: {
        vx: -0.5 * width,
        vy: -1.8 * height,
        vz: 1200 * S,
        axis: new THREE.Vector3(-0.3, -0.8, 0.5).normalize(),
        angle: 2.8,
      },
      E: {
        vx: 1.8 * width,
        vy: -0.7 * height,
        vz: 1700 * S,
        axis: new THREE.Vector3(0.8, -0.4, -0.4).normalize(),
        angle: 3.6,
      },
    };

    polys.forEach(({ id, poly }) => {
      const { material, uniforms } = createSmokedGlassMaterial({
        iridescence: 0.55,
        envMapIntensity: 1.25,
      });

      const cellGroup = new THREE.Group();
      cellGroup.position.set(0, 0, 0);
      slabGroup.add(cellGroup);

      const localPoints = poly.map((p) => ({
        x: (p.x - 0.5) * panelWidth,
        y: (0.5 - p.y) * panelHeight,
      }));

      const inset = insetPolygon(localPoints, 7 * S);
      const roundedShape = createRoundedShape(inset, 20 * S);

      const extrudeGeo = new THREE.ExtrudeGeometry(roundedShape, {
        depth: 13 * S,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 2.6 * S,
        bevelThickness: 2.6 * S,
      });
      extrudeGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(extrudeGeo, material);
      mesh.name = id;
      cellGroup.add(mesh);

      const dir = outwardDirections[id] || {
        vx: 1.5 * width,
        vy: 1.0 * height,
        vz: 1400 * S,
        axis: new THREE.Vector3(0.5, 0.5, 0.5),
        angle: 3.0,
      };

      shards.push({
        id,
        group: cellGroup,
        mesh,
        material,
        uniforms,
        basePos: new THREE.Vector3(0, 0, 0),
        shatterVel: new THREE.Vector3(dir.vx, dir.vy, dir.vz),
        shatterRotAxis: dir.axis,
        shatterRotAngle: dir.angle,
        lift: 0,
        liftVel: 0,
        isHovered: false,
      });
    });

    // Pointer Interaction
    let pointerX = width / 2;
    let pointerY = height / 2;
    let pointerInWindow = false;
    let currentRotX = 0;
    let currentRotY = 0;
    const pointerWorld = new THREE.Vector3();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    const onPointerMove = (e: MouseEvent) => {
      pointerInWindow = true;
      pointerX = e.clientX;
      pointerY = e.clientY;

      const ndcX = (e.clientX / width) * 2 - 1;
      const ndcY = -(e.clientY / height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      raycaster.ray.intersectPlane(planeZ0, pointerWorld);

      // Raycast against shards when assembled
      if (scrollYRef.current < 100) {
        const hits = raycaster.intersectObjects(shards.map((s) => s.mesh), false);
        const hitName = hits.length > 0 ? (hits[0].object as THREE.Mesh).name : null;

        shards.forEach((s) => {
          s.isHovered = s.id === hitName;
        });
      }
    };

    const onPointerLeave = () => {
      pointerInWindow = false;
      shards.forEach((s) => (s.isHovered = false));
    };

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      const newCameraDist = height / 2 / Math.tan(halfFovRad);
      camera.position.set(0, 0, newCameraDist);
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    // Animation Loop with smooth, slow physical scroll easing
    let animId = 0;
    let lastTime = performance.now();
    let smoothScrollFactor = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 1. Mouse Tilt (smoothed)
      let targetRotY = (-1.0 * Math.PI) / 180;
      let targetRotX = (0.6 * Math.PI) / 180;

      if (pointerInWindow && scrollYRef.current < 250) {
        const nx = (pointerX - width / 2) / (width / 2);
        const ny = (pointerY - height / 2) / (height / 2);
        targetRotY = ((nx * 6.0 - 1.0) * Math.PI) / 180;
        targetRotX = ((-ny * 4.5 + 0.6) * Math.PI) / 180;
      }

      const tiltSmoothing = 1 - Math.exp(-dt / 0.35);
      currentRotY += (targetRotY - currentRotY) * tiltSmoothing;
      currentRotX += (targetRotX - currentRotX) * tiltSmoothing;

      slabGroup.rotation.x = currentRotX;
      slabGroup.rotation.y = currentRotY;

      // 2. Slow, Majestic Scroll-Driven Outward Shatter
      // Map scroll over 1200px (slow animation, does not disappear in a flash)
      const targetScrollFactor = Math.min(1.0, Math.max(0, scrollYRef.current / 1150));
      // Exponential smoothing for slow physical drift
      const scrollFollowRate = 1 - Math.exp(-dt * 2.8);
      smoothScrollFactor += (targetScrollFactor - smoothScrollFactor) * scrollFollowRate;

      // Power curve for cinematic acceleration
      const easeOutward = Math.pow(smoothScrollFactor, 1.85);

      const k = 170;
      const c = 19;

      shards.forEach((shard) => {
        // If at top, apply hover spring
        if (smoothScrollFactor < 0.015) {
          const targetLift = shard.isHovered ? 45 * S : 0;
          const fLift = -k * (shard.lift - targetLift) - c * shard.liftVel;
          shard.liftVel += fLift * dt;
          shard.lift += shard.liftVel * dt;

          shard.group.position.set(0, shard.basePos.y, shard.lift);
          shard.group.rotation.set(0, 0, 0);
          shard.material.iridescence = shard.isHovered ? 1.0 : 0.55;
          shard.material.envMapIntensity = shard.isHovered ? 1.8 : 1.25;
        } else {
          // Shards fly OUTWARDS of the screen
          shard.group.position.x = shard.shatterVel.x * easeOutward;
          shard.group.position.y = shard.basePos.y + shard.shatterVel.y * easeOutward;
          shard.group.position.z = shard.shatterVel.z * easeOutward;

          shard.group.setRotationFromAxisAngle(shard.shatterRotAxis, shard.shatterRotAngle * easeOutward);
          shard.material.iridescence = 0.55 + 0.35 * easeOutward;
        }
      });

      // Update cursor glow uniforms
      const glowTarget = pointerInWindow && smoothScrollFactor < 0.1 ? 1.0 : 0.0;
      shards.forEach((s) => {
        s.uniforms.uPointerWorldPos.value.copy(pointerWorld);
        s.uniforms.uScaleS.value = S;
        s.uniforms.uPointerGlow.value += (glowTarget - s.uniforms.uPointerGlow.value) * (1 - Math.exp(-dt * 6));
      });

      if (smoothScrollFactor > 0.98) {
        slabGroup.visible = false;
      } else {
        slabGroup.visible = true;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{
        opacity: Math.max(0, 1 - scrollY / 1300),
      }}
    />
  );
};
