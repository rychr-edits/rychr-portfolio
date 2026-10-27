import * as THREE from 'three';

export interface GlassMaterialOptions {
  enableCursorGlow?: boolean;
  iridescence?: number;
  envMapIntensity?: number;
}

export function createSmokedGlassMaterial(options: GlassMaterialOptions = {}): {
  material: THREE.MeshPhysicalMaterial;
  uniforms: {
    uPointerWorldPos: { value: THREE.Vector3 };
    uPointerGlow: { value: number };
    uScaleS: { value: number };
  };
} {
  const uniforms = {
    uPointerWorldPos: { value: new THREE.Vector3(0, 0, 0) },
    uPointerGlow: { value: 0.0 },
    uScaleS: { value: 1.0 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x17171b,
    roughness: 0.36,
    metalness: 0.08,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    specularIntensity: 0.7,
    iridescence: options.iridescence ?? 0.55,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [250, 650],
    envMapIntensity: options.envMapIntensity ?? 1.0,
    reflectivity: 0.85,
  });

  if (options.enableCursorGlow !== false) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uPointerWorldPos = uniforms.uPointerWorldPos;
      shader.uniforms.uPointerGlow = uniforms.uPointerGlow;
      shader.uniforms.uScaleS = uniforms.uScaleS;

      shader.vertexShader = `
        varying vec3 vGlassWorldPos;
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vGlassWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );

      shader.fragmentShader = `
        uniform vec3 uPointerWorldPos;
        uniform float uPointerGlow;
        uniform float uScaleS;
        varying vec3 vGlassWorldPos;
        ${shader.fragmentShader}
      `;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        if (uPointerGlow > 0.001) {
          float dGlow = length(vGlassWorldPos.xy - uPointerWorldPos.xy);
          float rGlow = 300.0 * max(uScaleS, 0.25);
          float atten = exp(-1.6 * (dGlow * dGlow) / (rGlow * rGlow)) * uPointerGlow;
          vec3 lavenderGlow = vec3(0.42, 0.37, 0.62) * 0.16 * atten;
          gl_FragColor.rgb += lavenderGlow;
        }
        `
      );
    };
  }

  return { material, uniforms };
}
