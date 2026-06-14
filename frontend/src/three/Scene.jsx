import { Suspense } from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import Subway from '@/three/Subway';
import Character from '@/three/Character';
import Laptop from '@/three/Laptop';
import CameraRig from '@/three/CameraRig';

export default function Scene({ onEnter }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#8fb6ff', '#160e26', 0.5]} />
      <directionalLight position={[4, 6, 3]} intensity={0.55} color="#cfe2ff" />

      <Suspense fallback={null}>
        <Subway />
        <Character />
        <Laptop onEnter={onEnter} />
      </Suspense>

      <CameraRig />

      <EffectComposer disableNormalPass>
        <DepthOfField
          target={[-0.95, 1.08, 0.02]}
          focalLength={0.025}
          bokehScale={3.2}
          height={480}
        />
        <Bloom intensity={0.85} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.28} darkness={0.82} eskil={false} />
      </EffectComposer>
    </>
  );
}
