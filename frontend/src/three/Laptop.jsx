import { Html } from '@react-three/drei';
import { makeToonGradient } from '@/three/materials';
import LaptopUI from '@/three/LaptopUI';

const grad = makeToonGradient(4);

// Open laptop resting on the character's lap. Screen faces +x (toward the aisle/camera).
export default function Laptop({ onEnter, position = [-1.12, 0.74, 0] }) {
  return (
    <group position={position}>
      {/* keyboard deck */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.42, 0.025, 0.36]} />
        <meshToonMaterial color="#1a1d24" gradientMap={grad} />
      </mesh>
      <mesh position={[0.02, 0.014, 0]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.34, 0.004, 0.3]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* screen assembly (tilted back) */}
      <group position={[-0.2, 0.02, 0]} rotation={[0, 0, 0.32]}>
        {/* lid / bezel */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.022, 0.4, 0.44]} />
          <meshToonMaterial color="#23272f" gradientMap={grad} />
        </mesh>
        {/* glow plane behind the UI */}
        <mesh position={[0.013, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 0.36]} />
          <meshBasicMaterial color="#00e5ff" toneMapped={false} />
        </mesh>
        {/* interactive HTML screen */}
        <Html
          transform
          position={[0.016, 0.2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          distanceFactor={0.42}
          zIndexRange={[40, 0]}
          occlude={false}
          wrapperClass="laptop-screen-wrapper"
          style={{ pointerEvents: 'auto' }}
        >
          <LaptopUI onEnter={onEnter} />
        </Html>
      </group>
    </group>
  );
}
