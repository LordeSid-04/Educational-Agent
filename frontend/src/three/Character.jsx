import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { makeToonGradient } from '@/three/materials';

const grad = makeToonGradient(4);
const M = (color, emissive = '#000000', ei = 0) => (
  <meshToonMaterial color={color} gradientMap={grad} emissive={emissive} emissiveIntensity={ei} />
);

// Stylized character sitting on the bench, facing +x (toward the aisle/camera).
export default function Character({ position = [-1.55, 0, 0] }) {
  const root = useRef();
  const torso = useRef();
  const head = useRef();
  const lEye = useRef();
  const rEye = useRef();
  const legs = useRef();
  const lHand = useRef();
  const rHand = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // breathing
    if (torso.current) {
      torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.025;
      torso.current.position.y = 0.92 + Math.sin(t * 1.6) * 0.01;
    }
    // head bob to imaginary music + sway
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 2.4) * 0.06;
      head.current.rotation.x = Math.sin(t * 1.2) * 0.04 - 0.05;
      head.current.position.y = 1.42 + Math.sin(t * 2.4) * 0.015;
    }
    // blink (quick periodic)
    const blink = (Math.sin(t * 2.1) > 0.995 || Math.sin(t * 1.3 + 2) > 0.997) ? 0.1 : 1;
    if (lEye.current) lEye.current.scale.y = blink;
    if (rEye.current) rEye.current.scale.y = blink;
    // legs shift with train rattle
    if (legs.current) legs.current.rotation.z = Math.sin(t * 3.1) * 0.015;
    // typing
    if (lHand.current) lHand.current.position.y = 0.82 + Math.abs(Math.sin(t * 6.0)) * 0.03;
    if (rHand.current) rHand.current.position.y = 0.82 + Math.abs(Math.sin(t * 6.0 + 1.4)) * 0.03;
    // subtle whole-body sway
    if (root.current) root.current.rotation.z = Math.sin(t * 1.5) * 0.01;
  });

  return (
    <group ref={root} position={position}>
      {/* hips */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.42, 0.3, 0.5]} />
        {M('#2b2f3a')}
      </mesh>

      {/* torso (hoodie) */}
      <mesh ref={torso} position={[0, 0.92, 0]}>
        <capsuleGeometry args={[0.26, 0.34, 6, 12]} />
        {M('#3f7d5a')}
      </mesh>
      {/* hood */}
      <mesh position={[-0.12, 1.12, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.2, 16, 12, 0, Math.PI]} />
        {M('#356a4c')}
      </mesh>

      {/* head */}
      <group ref={head} position={[0.05, 1.42, 0]}>
        <mesh>
          <sphereGeometry args={[0.2, 24, 20]} />
          {M('#e8b89a')}
        </mesh>
        {/* hair */}
        <mesh position={[-0.02, 0.08, 0]}>
          <sphereGeometry args={[0.205, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          {M('#5b3d25')}
        </mesh>
        {/* eyes (facing +x) */}
        <mesh ref={lEye} position={[0.19, 0.0, 0.08]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          {M('#101014')}
        </mesh>
        <mesh ref={rEye} position={[0.19, 0.0, -0.08]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          {M('#101014')}
        </mesh>
        {/* headphones */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.21, 0.025, 8, 24, Math.PI]} />
          {M('#15171d')}
        </mesh>
        {[-0.2, 0.2].map((z, i) => (
          <mesh key={i} position={[-0.01, 0.0, z]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
            <meshToonMaterial color="#1b1e26" gradientMap={grad} emissive="#00e5ff" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>

      {/* arms reaching to the laptop */}
      <mesh ref={lHand} position={[0.42, 0.82, 0.16]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.07, 0.34, 6, 10]} />
        {M('#3f7d5a')}
      </mesh>
      <mesh ref={rHand} position={[0.42, 0.82, -0.16]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.07, 0.34, 6, 10]} />
        {M('#3f7d5a')}
      </mesh>

      {/* legs (thighs forward, shins down) */}
      <group ref={legs}>
        {[0.16, -0.16].map((z, i) => (
          <group key={i}>
            <mesh position={[0.28, 0.6, z]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.4, 6, 10]} />
              {M('#2b2f3a')}
            </mesh>
            <mesh position={[0.5, 0.32, z]}>
              <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
              {M('#23262f')}
            </mesh>
            <mesh position={[0.56, 0.06, z]}>
              <boxGeometry args={[0.26, 0.1, 0.14]} />
              {M('#e9eef2')}
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
