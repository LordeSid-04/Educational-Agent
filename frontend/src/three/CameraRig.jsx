import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

// camera keyframes: wide shot → over the shoulder → locked on the laptop screen
const CUTS = [
  { pos: [2.7, 1.7, 3.1], tgt: [-0.9, 1.05, 0.15], fov: 56 },
  { pos: [1.45, 1.5, 1.25], tgt: [-1.0, 1.05, 0.05], fov: 46 },
  { pos: [0.4, 1.2, 0.2], tgt: [-0.95, 1.08, 0.02], fov: 33 },
];

const pA = new THREE.Vector3();
const pB = new THREE.Vector3();
const tA = new THREE.Vector3();
const tB = new THREE.Vector3();
const curPos = new THREE.Vector3();
const curTgt = new THREE.Vector3();

export default function CameraRig() {
  const scroll = useScroll();
  const { camera } = useThree();
  const initial = useRef(true);

  useFrame((state) => {
    const o = scroll ? scroll.offset : 0;
    // pick segment
    const seg = o < 0.5 ? 0 : 1;
    const f = THREE.MathUtils.clamp(seg === 0 ? o / 0.5 : (o - 0.5) / 0.5, 0, 1);
    const ease = f * f * (3 - 2 * f); // smoothstep
    const A = CUTS[seg];
    const B = CUTS[seg + 1];

    pA.set(...A.pos); pB.set(...B.pos);
    tA.set(...A.tgt); tB.set(...B.tgt);
    curPos.lerpVectors(pA, pB, ease);
    curTgt.lerpVectors(tA, tB, ease);

    // train rattle — strong early, calms as we focus on the screen
    const t = state.clock.elapsedTime;
    const amp = 0.05 * (1 - o) + 0.006;
    curPos.x += Math.sin(t * 13.0) * amp * 0.6;
    curPos.y += Math.sin(t * 17.0 + 1.3) * amp;
    curPos.z += Math.sin(t * 11.0 + 0.7) * amp * 0.4;

    const fov = THREE.MathUtils.lerp(A.fov, B.fov, ease);

    if (initial.current) {
      camera.position.copy(curPos);
      initial.current = false;
    } else {
      camera.position.lerp(curPos, 0.12);
    }
    camera.lookAt(curTgt);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
