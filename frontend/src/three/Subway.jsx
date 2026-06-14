import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import { makeToonGradient, TunnelMaterial } from '@/three/materials';

const toonGrad = makeToonGradient(4);

function Toon({ color, ...props }) {
  return <meshToonMaterial color={color} gradientMap={toonGrad} {...props} />;
}

// neon tunnel rushing past the windows
function Tunnel({ side }) {
  const matRef = useRef();
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uTime += dt;
  });
  const x = side === 'left' ? -3.4 : 3.4;
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  return (
    <mesh position={[x, 1.4, 0]} rotation={[0, rotY, 0]}>
      <planeGeometry args={[20, 3.2]} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <tunnelMaterial ref={matRef} key={TunnelMaterial.key} toneMapped={false} />
    </mesh>
  );
}

function Wall({ side }) {
  const x = side === 'left' ? -2.2 : 2.2;
  const sign = side === 'left' ? 1 : -1;
  // window gaps along z; pillars between
  const pillars = [-6, -3.2, -0.4, 2.4, 5.2];
  return (
    <group>
      {/* lower wall */}
      <mesh position={[x, 0.5, 0]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 1]} />
        <Toon color="#2a2f3a" />
      </mesh>
      {/* upper wall */}
      <mesh position={[x, 2.25, 0]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.7]} />
        <Toon color="#222732" />
      </mesh>
      {/* window pillars */}
      {pillars.map((z, i) => (
        <mesh key={i} position={[x + sign * 0.02, 1.45, z]}>
          <boxGeometry args={[0.12, 1.1, 0.5]} />
          <Toon color="#3a4150" />
        </mesh>
      ))}
      {/* graffiti glow accents */}
      <mesh position={[x + sign * 0.05, 1.45, -1.7]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 0.9]} />
        <meshBasicMaterial color="#ff2bd6" transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <mesh position={[x + sign * 0.05, 1.4, 3.3]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Benches({ side }) {
  const x = side === 'left' ? -1.95 : 1.95;
  const zs = useMemo(() => [-5.2, -3.4, 2.6, 4.4], []);
  return (
    <Instances range={zs.length} castShadow>
      <boxGeometry args={[0.7, 0.12, 1.5]} />
      <Toon color="#1c3a5e" />
      {zs.map((z, i) => (
        <Instance key={i} position={[x, 0.5, z]} />
      ))}
    </Instances>
  );
}

function Poles() {
  const xs = [-0.7, 0.7];
  return (
    <group>
      <Instances range={xs.length}>
        <cylinderGeometry args={[0.04, 0.04, 2.5, 12]} />
        <meshStandardMaterial color="#9aa3b2" metalness={0.9} roughness={0.25} />
        {xs.map((x, i) => (
          <Instance key={i} position={[x, 1.25, 0.5]} />
        ))}
      </Instances>
      {/* horizontal handrails */}
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 16, 12]} />
          <meshStandardMaterial color="#9aa3b2" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// flickering fluorescent ceiling strips
function CeilingLights() {
  const a = useRef();
  const b = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const f1 = 0.7 + 0.3 * Math.sin(t * 40) * Math.sin(t * 7) + (Math.random() < 0.03 ? -0.5 : 0);
    const f2 = 0.8 + 0.2 * Math.sin(t * 33 + 1) + (Math.random() < 0.02 ? -0.6 : 0);
    if (a.current) a.current.intensity = Math.max(0.15, f1) * 2.0;
    if (b.current) b.current.intensity = Math.max(0.15, f2) * 1.6;
  });
  return (
    <group>
      <mesh position={[0, 2.58, 0]}>
        <boxGeometry args={[0.5, 0.04, 16]} />
        <meshBasicMaterial color="#cfefff" toneMapped={false} />
      </mesh>
      <pointLight ref={a} position={[0, 2.4, -2]} color="#bfe6ff" distance={9} />
      <pointLight ref={b} position={[0, 2.4, 3]} color="#dff0ff" distance={9} />
    </group>
  );
}

export default function Subway() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[4.4, 18]} />
        <Toon color="#191c24" />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.6, 0]}>
        <planeGeometry args={[4.4, 18]} />
        <Toon color="#20242e" />
      </mesh>
      {/* end walls */}
      {[-8.5, 8.5].map((z, i) => (
        <mesh key={i} position={[0, 1.3, z]}>
          <planeGeometry args={[4.4, 2.6]} />
          <Toon color="#262b36" />
        </mesh>
      ))}

      <Wall side="left" />
      <Wall side="right" />
      <Tunnel side="left" />
      <Tunnel side="right" />
      <Benches side="left" />
      <Benches side="right" />
      <Poles />
      <CeilingLights />

      {/* neon under-glow from graffiti */}
      <pointLight position={[-2, 1.4, -1.7]} color="#ff2bd6" intensity={3} distance={5} />
      <pointLight position={[2, 1.4, 3.3]} color="#00e5ff" intensity={2.5} distance={5} />
    </group>
  );
}
