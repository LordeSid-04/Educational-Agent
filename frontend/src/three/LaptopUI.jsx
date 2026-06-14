import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, Sparkles } from 'lucide-react';

const CHIPS = ['gradient descent', 'the krebs cycle', 'big-o notation'];

// The interactive screen UI living inside the 3D laptop. Real, clickable DOM.
export default function LaptopUI({ onEnter }) {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const go = (text) => {
    const q = (text ?? value).trim();
    if (q) sessionStorage.setItem('cm_prompt', q);
    if (onEnter) onEnter();
    else navigate('/app');
  };

  return (
    <div
      className="w-[560px] h-[400px] rounded-xl overflow-hidden relative font-mono text-white select-text"
      style={{
        background: 'rgba(8,10,16,0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,229,255,0.35)',
        boxShadow: '0 0 0 1px rgba(0,229,255,0.15), inset 0 0 60px rgba(0,229,255,0.06)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 px-4 h-9 border-b border-cyan/15">
        <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-acid/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-cyan/80" />
        <span className="ml-2 text-[11px] tracking-[0.2em] text-cyan/80 flex items-center gap-1.5">
          <Terminal size={12} /> chalkmind // teaching agent
        </span>
      </div>

      <div className="p-5">
        <p className="text-[11px] text-white/40 tracking-[0.15em]">$ session --new</p>
        <h2 className="text-cyan text-2xl mt-2 lowercase tracking-tight">what should we learn?</h2>
        <p className="text-white/50 text-xs mt-2 leading-relaxed">
          type a question — the agent draws the lesson on a live chalkboard, then quizzes you.
        </p>

        <div
          className="mt-5 flex items-center gap-2 rounded-lg px-3 h-11"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,229,255,0.25)' }}
        >
          <span className="text-cyan">&gt;</span>
          <input
            data-testid="laptop-prompt-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="ask anything…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
          />
          <button
            data-testid="laptop-enter-btn"
            onClick={() => go()}
            className="grid place-items-center w-8 h-8 rounded-md bg-cyan text-ink hover:bg-white transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => go(c)}
              className="px-2.5 py-1 rounded-full text-[11px] text-white/70 hover:text-ink hover:bg-cyan transition-colors lowercase"
              style={{ border: '1px solid rgba(255,255,255,0.14)' }}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={() => go('')}
          className="mt-6 inline-flex items-center gap-2 text-[12px] text-acid hover:text-white transition-colors tracking-wide"
        >
          <Sparkles size={13} /> open the full workspace →
        </button>
      </div>

      {/* scanline sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)' }}
      />
    </div>
  );
}
