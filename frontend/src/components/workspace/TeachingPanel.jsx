import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GraduationCap } from 'lucide-react';
import Whiteboard from '@/components/workspace/Whiteboard';
import ThinkingState from '@/components/workspace/ThinkingState';
import PromptInput from '@/components/workspace/PromptInput';
import { CM } from '@/constants/testIds';

const SUGGESTIONS = [
  'how do neural networks learn?',
  'explain the pythagorean theorem',
  'what is gradient descent?',
  'break down photosynthesis',
];

export default function TeachingPanel({ title, segments, thinking, busy, bloom, setBloom, onSubmit, onContinue }) {
  const scrollRef = useRef(null);
  const hasContent = segments.length > 0 || thinking;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [segments.length, thinking]);

  return (
    <div data-testid={CM.teachingPanel} className="flex flex-col h-full relative">
      {/* header */}
      <div className="shrink-0 px-6 sm:px-10 pt-5 pb-3 flex items-center gap-3 pr-44">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-cyan shrink-0">
          <GraduationCap size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.25em] uppercase text-ash font-light">teaching agent</p>
          <h1 className="text-lg leading-none mt-0.5 truncate lowercase">{title || 'the chalkboard'}</h1>
        </div>
      </div>

      {/* board */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 pb-56">
        <div className="mx-auto max-w-4xl mt-2">
          <div className="relative rounded-3xl border-2 border-black bg-paper whiteboard-shadow min-h-[60vh]">
            <div className="halftone-dark absolute inset-0 opacity-30 rounded-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-10">
              {!hasContent ? (
                <EmptyBoard onPick={onSubmit} />
              ) : (
                <>
                  <Whiteboard segments={segments} onContinue={onContinue} />
                  {thinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                      <ThinkingState />
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* floating prompt */}
      <div className="absolute bottom-0 inset-x-0 px-4 pb-[88px] z-40 pointer-events-none">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/95 to-transparent" />
        <div className="pointer-events-auto">
          <PromptInput onSubmit={onSubmit} busy={busy} bloom={bloom} setBloom={setBloom} />
        </div>
      </div>
    </div>
  );
}

function EmptyBoard({ onPick }) {
  return (
    <div className="text-ink text-center py-12">
      <div className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-1.5 rounded-sm text-[10px] tracking-[0.2em] uppercase">
        <Sparkles size={13} /> blank board
      </div>
      <h2 className="text-3xl sm:text-4xl mt-5 font-light lowercase">what should we learn?</h2>
      <p className="text-ink/60 font-light mt-2 max-w-sm mx-auto text-sm">
        type below, or tap one to start.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5 max-w-xl mx-auto">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="px-4 py-2.5 rounded-full border-2 border-ink/30 hover:border-ink hover:bg-ink hover:text-paper transition-colors font-medium text-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
