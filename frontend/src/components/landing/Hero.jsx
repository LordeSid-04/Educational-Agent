import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import VinylRecord from '@/components/VinylRecord';
import WorkspaceMock from '@/components/landing/WorkspaceMock';
import { CM } from '@/constants/testIds';

// Laptop screen focal point in the HD render (~67% x, 50% y).
const FOCAL = { x: '66%', y: '52%' };

export default function Hero({ onEnter }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // ── Camera: push toward the laptop, arc slightly to face the screen ──
  const camScale = useTransform(scrollYProgress, [0, 0.5], [1.04, 1.6]);
  const camRotY = useTransform(scrollYProgress, [0, 0.5], [5, -3]);
  const camRotX = useTransform(scrollYProgress, [0, 0.5], [2, -1]);
  const sceneOpacity = useTransform(scrollYProgress, [0.58, 0.74], [1, 0]);

  // ── Workspace reveal: a crisp screen that expands from the laptop to fill the view ──
  const revealOpacity = useTransform(scrollYProgress, [0.4, 0.54], [0, 1]);
  const revealClip = useTransform(
    scrollYProgress,
    [0.4, 0.68],
    ['inset(42% 25% 40% 57%)', 'inset(0% 0% 0% 0%)']
  );
  const revealGlow = useTransform(scrollYProgress, [0.4, 0.6, 0.7], [0.9, 0.5, 0]);
  const revealShadow = useTransform(revealGlow, (g) => `inset 0 0 120px ${g * 60}px rgba(0,240,255,${g * 0.4})`);

  // ── Foreground UI ──
  const titleOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.14], [0, -70]);
  const vinylOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.3, 0.42], [0.7, 0.9, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);

  // ── Mouse parallax (camera looks toward cursor) ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const pRotY = useSpring(useTransform(mx, [-0.5, 0.5], [6, -6]), { stiffness: 60, damping: 18 });
  const pRotX = useSpring(useTransform(my, [-0.5, 0.5], [-4, 4]), { stiffness: 60, damping: 18 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section ref={ref} className="relative h-[420vh]" id="hero">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden bg-ink"
        onMouseMove={onMove}
        style={{ perspective: 1400 }}
      >
        {/* ════ 3D SUBWAY WORLD ════ */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: sceneOpacity, rotateY: pRotY, rotateX: pRotX, transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ scale: camScale, rotateY: camRotY, rotateX: camRotX, transformOrigin: `${FOCAL.x} ${FOCAL.y}` }}
          >
            {/* train sway */}
            <motion.div
              className="absolute inset-[-3%]"
              animate={{ x: [0, -6, 4, -3, 0], y: [0, 3, -2, 2, 0], rotateZ: [0, 0.18, -0.16, 0.1, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/assets/hero-hd.png"
                alt="A student on the night train, headphones on, glowing laptop in his lap"
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* color grade + depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 66% 52%, transparent 30%, rgba(5,5,5,0.78) 100%)' }} />

              {/* neon tunnel streaks (train moving forward) */}
              <div className="absolute left-0 top-[8%] bottom-[20%] w-[42%] overflow-hidden pointer-events-none">
                {[
                  { c: '#FF003C', d: 5, y: '10%', delay: 0 },
                  { c: '#00F0FF', d: 6.5, y: '40%', delay: 1.2 },
                  { c: '#FF5C00', d: 4.4, y: '68%', delay: 2.1 },
                  { c: '#FAFF00', d: 7, y: '85%', delay: 0.6 },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-10 w-[55%] rounded-full blur-2xl"
                    style={{ top: s.y, background: s.c, mixBlendMode: 'screen', opacity: 0.5 }}
                    animate={{ x: ['120%', '-160%'] }}
                    transition={{ duration: s.d, repeat: Infinity, ease: 'linear', delay: s.delay }}
                  />
                ))}
              </div>
            </motion.div>

            {/* flickering ceiling lights */}
            <div className="absolute top-0 inset-x-0 h-1/3 pointer-events-none">
              <div className="absolute top-6 left-[20%] w-40 h-2 rounded-full bg-amber-100/60 blur-md animate-flicker" />
              <div className="absolute top-10 right-[14%] w-52 h-2 rounded-full bg-cyan/30 blur-md animate-flicker" style={{ animationDelay: '1.3s' }} />
            </div>

            {/* floating dust in the light */}
            {[...Array(9)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40 blur-[1px]"
                style={{ left: `${15 + i * 9}%`, top: `${30 + (i % 4) * 14}%` }}
                animate={{ y: [0, -18, 0], opacity: [0.1, 0.6, 0.1] }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              />
            ))}
          </motion.div>

          {/* pulsing ring marking the laptop target */}
          <motion.div
            style={{ opacity: ringOpacity }}
            className="absolute"
            // matches the focal screen rect
          >
            <div className="absolute" style={{ left: '57%', top: '44%', width: '18%', height: '16%' }}>
              <motion.div
                className="absolute inset-0 rounded-lg border border-cyan/70"
                animate={{ boxShadow: ['0 0 0 0 rgba(0,240,255,0.5)', '0 0 30px 6px rgba(0,240,255,0.25)', '0 0 0 0 rgba(0,240,255,0.5)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="absolute -top-7 left-0 font-mono text-[10px] tracking-[0.2em] uppercase text-cyan whitespace-nowrap">
                his screen ↓
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ════ WORKSPACE ARRIVAL (crisp, expands from the screen) ════ */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: revealOpacity, clipPath: revealClip, WebkitClipPath: revealClip }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ boxShadow: revealShadow }}
          >
            <WorkspaceMock />
          </motion.div>
        </motion.div>

        {/* ════ HEADLINE ════ */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="relative z-30 h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-acid" />
              <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-smoke">
                Your tutor rides the underground
              </span>
            </div>
            <h1 data-testid={CM.heroTitle} className="font-display font-black uppercase leading-[0.85] tracking-tighter text-6xl sm:text-7xl lg:text-8xl">
              <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">Learn on the</span>
              <span className="block comic text-cyan">Night Train.</span>
            </h1>
            <p className="mt-6 text-smoke text-base sm:text-lg max-w-xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              ChalkMind is an AI teaching agent that sketches lessons on an infinite
              chalkboard — scaffolding concepts the way a great tutor would, one
              checkpoint at a time.
            </p>
            <div className="mt-8 flex items-center gap-4 pointer-events-auto">
              <button
                data-testid={CM.heroEnter}
                onClick={onEnter}
                className="group h-13 px-7 py-3.5 rounded-2xl bg-white text-ink font-bold flex items-center gap-2 hover:bg-cyan transition-colors"
              >
                Step inside the screen
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <span className="font-mono text-xs text-ash hidden sm:block">or scroll to dive in ↓</span>
            </div>
          </motion.div>
        </motion.div>

        {/* vinyl */}
        <motion.div style={{ opacity: vinylOpacity }} className="absolute bottom-10 right-8 sm:right-12 z-30">
          <VinylRecord />
        </motion.div>

        {/* scroll hint */}
        <motion.div style={{ opacity: hintOpacity }} data-testid={CM.heroScrollHint} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-ash">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Dive in</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={20} className="text-cyan" />
          </motion.div>
        </motion.div>

        {/* CTA after arrival */}
        <motion.div style={{ opacity: ctaOpacity }} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={onEnter}
            className="h-12 px-6 rounded-2xl bg-cyan text-ink font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-[0_0_40px_rgba(0,240,255,0.5)]"
          >
            Enter the workspace <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
