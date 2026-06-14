import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CM } from '@/constants/testIds';

const THOUGHTS = [
  'reading your question…',
  'recalling the basics…',
  'picking an analogy…',
  'sketching the diagram…',
  'plotting it out…',
  'writing a checkpoint…',
];

// Glowing particle cluster + live "reasoning" stream shown while the agent works.
export default function ThinkingState() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % THOUGHTS.length), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      data-testid={CM.thinkingState}
      className="rounded-2xl border-2 border-ink/10 bg-paper/95 p-8 max-w-2xl relative overflow-hidden"
    >
      <div className="flex items-center gap-5">
        {/* particle core */}
        <div className="relative w-16 h-16 shrink-0">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2px ${i % 2 ? '#FF003C' : '#00F0FF'}` }}
              animate={{ scale: [0.6, 2.2], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.6, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{ background: 'radial-gradient(circle,#FF003C,#00F0FF)' }}
            animate={{ rotate: 360, scale: [1, 1.15, 1] }}
            transition={{ rotate: { repeat: Infinity, duration: 3, ease: 'linear' }, scale: { repeat: Infinity, duration: 1.2 } }}
          />
        </div>

        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink/40 font-light">thinking</p>
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-ink mt-1 lowercase"
          >
            {THOUGHTS[step]}
          </motion.p>
          <div className="flex gap-1.5 mt-3">
            {THOUGHTS.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'w-7 bg-ink' : 'w-3 bg-ink/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* scanning sheen */}
      <motion.div
        className="absolute inset-y-0 w-1/3"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(0,240,255,0.12),transparent)' }}
        animate={{ x: ['-120%', '320%'] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
      />
    </div>
  );
}
