import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Loader } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Scene from '@/three/Scene';

function Overlay() {
  return (
    <div className="w-screen pointer-events-none select-none">
      {/* page 1 */}
      <section className="h-screen relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute left-6 sm:left-12 lg:left-20 bottom-28 max-w-sm"
        >
          <p className="text-cyan text-xs sm:text-sm tracking-[0.35em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            learn on the night train
          </p>
          <p className="font-light text-smoke text-sm mt-3 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            an ai tutor that teaches on a moving chalkboard.
          </p>
          <p className="font-light text-ash text-xs mt-1 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            scroll to ride over his shoulder, into the screen.
          </p>
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ash">
          <span className="text-[10px] tracking-[0.3em] uppercase">dive in</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={20} className="text-cyan" />
          </motion.div>
        </div>
      </section>
      {/* page 2 */}
      <section className="h-screen flex items-center justify-center">
        <p className="text-ash text-xs tracking-[0.3em] uppercase">almost there…</p>
      </section>
      {/* page 3 — the laptop UI takes over */}
      <section className="h-screen" />
    </div>
  );
}

export default function Experience({ onEnter }) {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 1.6]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [2.7, 1.7, 3.1], fov: 56 }}
        >
          <color attach="background" args={['#05060a']} />
          <fog attach="fog" args={['#05060a', 9, 26]} />
          <Suspense fallback={null}>
            <ScrollControls pages={3} damping={0.3}>
              <Scene onEnter={onEnter} />
              <Scroll html>
                <Overlay />
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
      <Loader />
    </>
  );
}
