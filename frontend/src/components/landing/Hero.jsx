import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import VinylRecord from '@/components/VinylRecord';
import { CM } from '@/constants/testIds';

// Focal point of the protagonist's lap / laptop in the hero image.
const FOCAL = { x: '43%', y: '63%' };

export default function Hero({ onEnter }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // The subway image dives toward the laptop.
  const bgScale = useTransform(scrollYProgress, [0, 0.9], [1, 4.4]);
  const bgOpacity = useTransform(scrollYProgress, [0.78, 0.96], [1, 0]);

  // The laptop "screen" grows from the lap to fill the viewport → becomes the app.
  const screenLeft = useTransform(scrollYProgress, [0, 0.85], ['43%', '50%']);
  const screenTop = useTransform(scrollYProgress, [0, 0.85], ['62%', '50%']);
  const screenScale = useTransform(scrollYProgress, [0, 0.85, 1], [0.55, 13, 18]);
  const screenRadius = useTransform(scrollYProgress, [0, 0.6], [10, 2]);
  const previewOpacity = useTransform(scrollYProgress, [0.4, 0.62], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 0.85], [0.4, 0.9, 0.2]);

  // Foreground UI.
  const titleOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.16], [0, -60]);
  const vinylOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.5, 0.66], [0, 1]);
  const finalFade = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[320vh]" id="hero">
      <div className="sticky top-0 h-screen w-full overflow-hidden grain bg-ink">
        {/* ── Subway background ── */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: bgScale, opacity: bgOpacity, transformOrigin: `${FOCAL.x} ${FOCAL.y}` }}
        >
          <img
            src="/assets/hero-subway.jpg"
            alt="A student riding the night train, headphones on"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" />
          <div className="absolute inset-0 halftone opacity-25 mix-blend-overlay" />
        </motion.div>

        {/* ── Growing laptop screen → workspace ── */}
        <motion.div
          className="absolute"
          style={{
            left: screenLeft,
            top: screenTop,
            x: '-50%',
            y: '-50%',
            scale: screenScale,
            width: 250,
            height: 158,
            transformOrigin: 'center center',
          }}
        >
          <motion.div
            className="absolute -inset-2 rounded-xl bg-cyan blur-md"
            style={{ opacity: glowOpacity }}
          />
          <motion.div
            className="relative w-full h-full overflow-hidden bg-coal border border-cyan/40"
            style={{ borderRadius: screenRadius }}
          >
            <WorkspacePreview opacity={previewOpacity} />
          </motion.div>
        </motion.div>

        {/* ── Headline ── */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="relative z-20 h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 pointer-events-none"
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
            <h1
              data-testid={CM.heroTitle}
              className="font-display font-black uppercase leading-[0.85] tracking-tighter text-6xl sm:text-7xl lg:text-8xl"
            >
              <span className="block">Learn on the</span>
              <span className="block comic text-cyan">Night Train.</span>
            </h1>
            <p className="mt-6 text-smoke text-base sm:text-lg max-w-xl leading-relaxed">
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
              <span className="font-mono text-xs text-ash hidden sm:block">
                or scroll to dive in ↓
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Vinyl (now playing) ── */}
        <motion.div style={{ opacity: vinylOpacity }} className="absolute bottom-10 right-8 sm:right-12 z-20">
          <VinylRecord />
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div
          style={{ opacity: vinylOpacity }}
          data-testid={CM.heroScrollHint}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-ash"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Dive in</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={20} className="text-cyan" />
          </motion.div>
        </motion.div>

        {/* ── CTA mid-dive ── */}
        <motion.div
          style={{ opacity: ctaOpacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30"
        >
          <button
            onClick={onEnter}
            className="h-12 px-6 rounded-2xl bg-cyan text-ink font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-[0_0_40px_rgba(0,240,255,0.5)]"
          >
            Enter the workspace <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* ── Final fade to handoff ── */}
        <motion.div style={{ opacity: finalFade }} className="absolute inset-0 z-40 bg-ink pointer-events-none" />
      </div>
    </section>
  );
}

// Miniature of the actual workspace shown inside the laptop screen as we zoom in.
function WorkspacePreview({ opacity }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex">
      {/* sidebar */}
      <div className="w-[22%] h-full bg-black/60 border-r border-white/10 p-1.5 space-y-1">
        <div className="h-1.5 w-3/4 rounded bg-cyan/70" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 w-full rounded bg-white/15" />
        ))}
      </div>
      {/* whiteboard */}
      <div className="flex-1 p-2">
        <div className="w-full h-full rounded-[3px] bg-paper halftone-dark relative overflow-hidden">
          <div className="absolute inset-0 p-2 space-y-1.5">
            <div className="h-2 w-2/5 bg-ink rounded-sm" />
            <div className="h-1 w-4/5 bg-ink/70 rounded-sm" />
            <div className="h-1 w-3/5 bg-ink/50 rounded-sm" />
            <div className="mt-2 grid grid-cols-3 gap-1">
              <div className="h-6 border-2 border-ink rounded-sm" />
              <div className="h-6 border-2 border-ink rounded-sm bg-acid/40" />
              <div className="h-6 border-2 border-ink rounded-sm" />
            </div>
          </div>
        </div>
      </div>
      {/* dock */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 px-1.5 py-1 rounded-full bg-black/70 border border-white/10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-[2px] ${i === 0 ? 'bg-cyan' : 'bg-white/40'}`} />
        ))}
      </div>
    </motion.div>
  );
}
