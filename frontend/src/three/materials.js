import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// ── Stepped toon gradient map for cel-shading ──
export function makeToonGradient(steps = 4) {
  const colors = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    const v = Math.round((i / (steps - 1)) * 255);
    colors[i * 4 + 0] = v;
    colors[i * 4 + 1] = v;
    colors[i * 4 + 2] = v;
    colors[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(colors, steps, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// ── Moving neon tunnel streaks (GLSL) seen through the windows ──
const TunnelMaterial = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 5.0,
    uColorA: new THREE.Color('#ff2bd6'),
    uColorB: new THREE.Color('#00e5ff'),
    uColorC: new THREE.Color('#7c3aed'),
  },
  /* glsl vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl fragment */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uSpeed;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;

    float band(float x) { return pow(fract(x), 10.0); }

    void main() {
      // fast horizontal streaks (train speed)
      float x = vUv.x * 22.0 - uTime * uSpeed;
      float streak = band(x) + 0.6 * band(x * 0.5 + 0.3) + 0.4 * band(x * 2.0 + 0.7);

      // vertical neon strips (passing lights / pillars)
      float p = vUv.y * 8.0 + uTime * uSpeed * 0.15;
      float pillar = smoothstep(0.92, 1.0, fract(p));

      vec3 col = mix(uColorA, uColorB, vUv.x);
      col = mix(col, uColorC, pillar * 0.6);

      float intensity = streak * 1.8 + pillar * 0.9;
      // keep the floor/ceiling of the tunnel dark
      intensity *= smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);

      vec3 outc = col * intensity;
      outc += vec3(0.01, 0.012, 0.03); // faint base so it's not pure black
      gl_FragColor = vec4(outc, 1.0);
    }
  `
);

extend({ TunnelMaterial });

export { TunnelMaterial };
