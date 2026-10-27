import * as THREE from 'three';
import { createRoundedShape } from './geometry.ts';
import { createSmokedGlassMaterial } from './materials.ts';

export class BackSliver {
  public group: THREE.Group;
  public mesh: THREE.Mesh | null = null;
  public labelMesh: THREE.Mesh | null = null;
  public labelCanvas: HTMLCanvasElement;
  public labelTexture: THREE.CanvasTexture | null = null;
  public isHovered = false;
  public visible = false;
  public scale = 0; // 0 to 1
  public targetScale = 0;

  private k = 1;
  private width = 1440;
  private height = 960;
  private centerWorld = new THREE.Vector3(0, 0, 0);
  private material: THREE.MeshPhysicalMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;

    // Same smoked glass material as cells, iridescence 0.35, no cursor glow
    const { material } = createSmokedGlassMaterial({
      enableCursorGlow: false,
      iridescence: 0.35,
      envMapIntensity: 1.1,
    });
    this.material = material;

    this.labelCanvas = document.createElement('canvas');
  }

  public rebuild(viewportW: number, viewportH: number) {
    this.width = viewportW;
    this.height = viewportH;
    this.k = viewportW / 1918.0;

    // Clean existing meshes
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }
    if (this.labelMesh) {
      this.group.remove(this.labelMesh);
      this.labelMesh.geometry.dispose();
      (this.labelMesh.material as THREE.Material).dispose();
      this.labelMesh = null;
    }

    // Centroid at (.219 W, .238 H)
    const centerX = 0.219 * viewportW;
    const centerY = 0.238 * viewportH;

    // World coordinates at z = 0 (1 unit = 1 px)
    this.centerWorld.set(centerX - viewportW / 2, viewportH / 2 - centerY, 0);
    this.group.position.copy(this.centerWorld);

    // Outline viewport fractions: (.147,.243) (.252,.169) (.287,.277) (.151,.258)
    const fractions = [
      { x: 0.147, y: 0.243 },
      { x: 0.252, y: 0.169 },
      { x: 0.287, y: 0.277 },
      { x: 0.151, y: 0.258 },
    ];

    // Convert to local points relative to centroid in Three.js coords (y up)
    const localPoints = fractions.map((p) => ({
      x: (p.x * viewportW - centerX),
      y: (centerY - p.y * viewportH),
    }));

    // Rounded shape, 11*k extrusion, bright bevel
    const radius = Math.max(6, 12 * this.k);
    const shape = createRoundedShape(localPoints, radius);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 11 * this.k,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 2.2 * this.k,
      bevelThickness: 2.2 * this.k,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.computeVertexNormals();

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);

    // Build text label on top face
    this.updateLabelTexture();

    const labelGeo = new THREE.PlaneGeometry(160 * this.k, 48 * this.k);
    const labelMat = new THREE.MeshBasicMaterial({
      map: this.labelTexture!,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    this.labelMesh = new THREE.Mesh(labelGeo, labelMat);
    // Position just above top face
    this.labelMesh.position.set(0, 0, 11 * this.k + 2.4 * this.k + 0.1);
    this.group.add(this.labelMesh);

    // Base tilt: rotateY -0.16, rotateX 0.08
    this.group.rotation.set(0.08, -0.16, 0);
  }

  public updateLabelTexture() {
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const w = 240 * dpr;
    const h = 72 * dpr;
    this.labelCanvas.width = w;
    this.labelCanvas.height = h;

    const ctx = this.labelCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(dpr, dpr);

    // 0.66 vw Inter 500, white, turns lavender #b9abff on hover
    const fontSize = Math.max(12, this.width * 0.0066);
    ctx.font = `500 ${fontSize}px Inter, sans-serif`;
    ctx.letterSpacing = '-0.01em';
    ctx.fillStyle = this.isHovered ? '#b9abff' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← Back', 120, 36);

    ctx.restore();

    if (!this.labelTexture) {
      this.labelTexture = new THREE.CanvasTexture(this.labelCanvas);
      this.labelTexture.colorSpace = THREE.SRGBColorSpace;
      this.labelTexture.minFilter = THREE.LinearFilter;
      this.labelTexture.magFilter = THREE.LinearFilter;
    } else {
      this.labelTexture.needsUpdate = true;
    }
  }

  public setHovered(hovered: boolean) {
    if (this.isHovered !== hovered) {
      this.isHovered = hovered;
      this.updateLabelTexture();
      this.material.iridescence = hovered ? 0.75 : 0.35;
      this.material.envMapIntensity = hovered ? 1.6 : 1.1;
    }
  }

  public update(time: number, dt: number, pointerWorld?: THREE.Vector3) {
    // Smooth scaling
    this.scale += (this.targetScale - this.scale) * (1 - Math.exp(-dt * 12));
    this.group.scale.setScalar(Math.max(0.0001, this.scale));
    this.group.visible = this.scale > 0.01;

    if (!this.group.visible) return;

    // Slow idle wobble (+-0.03-0.04 rad at ~1 Hz)
    const wobbleY = 0.035 * Math.sin(time * 6.28 * 1.0);
    const wobbleX = 0.02 * Math.cos(time * 6.28 * 0.85);

    let tipX = 0;
    let tipY = 0;
    if (this.isHovered && pointerWorld) {
      const dx = (pointerWorld.x - this.centerWorld.x) / (120 * this.k);
      const dy = (pointerWorld.y - this.centerWorld.y) / (40 * this.k);
      tipY = Math.max(-0.14, Math.min(0.14, dx * 0.14));
      tipX = Math.max(-0.14, Math.min(0.14, -dy * 0.14));
    }

    // Base tilt: rotateY -0.16, rotateX 0.08
    this.group.rotation.x = 0.08 + wobbleX + tipX;
    this.group.rotation.y = -0.16 + wobbleY + tipY;
  }
}
