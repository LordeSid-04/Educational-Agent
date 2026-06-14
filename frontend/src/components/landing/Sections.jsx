import { motion } from 'framer-motion';
import { MessageSquareText, Brain, GitBranch, Mic, ArrowUpRight } from 'lucide-react';
import CollectionSurfer from '@/components/CollectionSurfer';

const STEPS = [
  { n: '01', icon: MessageSquareText, title: 'ask', body: 'Type or speak a question. Anything.', color: '#00F0FF' },
  { n: '02', icon: Brain, title: 'watch it think', body: 'It reasons out loud, then draws the lesson.', color: '#FF5C00' },
  { n: '03', icon: GitBranch, title: 'prove it stuck', body: 'A quick checkpoint. Miss it, it re-explains.', color: '#FAFF00' },
];

const SURF_ITEMS = [
  { id: 'd1', title: 'Linear Algebra', tag: 'math', meta: '12 topics', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80' },
  { id: 'd2', title: 'Neural Networks', tag: 'ai', meta: '8 topics', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80' },
  { id: 'd3', title: 'Organic Chemistry', tag: 'science', meta: '15 topics', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80' },
  { id: 'd4', title: 'World History', tag: 'humanities', meta: '20 topics', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80' },
  { id: 'd5', title: 'Quantum Physics', tag: 'science', meta: '9 topics', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80' },
  { id: 'd6', title: 'Data Structures', tag: 'cs', meta: '11 topics', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80' },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 px-6 sm:px-12 lg:px-20 bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>three stops</SectionLabel>
        <h2 className="font-light tracking-tight text-3xl sm:text-4xl lg:text-5xl mt-4 max-w-2xl text-cyan">
          not a chatbot. a tutor with chalk.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-3xl glass p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-11 h-11 rounded-2xl" style={{ background: `${s.color}1a`, color: s.color }}>
                  <s.icon size={20} />
                </span>
                <span className="font-light text-3xl text-white/10">{s.n}</span>
              </div>
              <h3 className="text-xl mt-6 lowercase tracking-wide">{s.title}</h3>
              <p className="text-smoke font-light mt-2 text-sm">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SurferShowcase({ onTry }) {
  return (
    <section id="surfer" className="relative py-24 overflow-hidden bg-coal">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        <SectionLabel>collection surfer</SectionLabel>
        <h2 className="font-light tracking-tight text-3xl sm:text-4xl mt-4 text-cyan">your subjects, on rails.</h2>
        <p className="text-smoke font-light mt-3 text-sm max-w-md">drag through them in 3d. open one to start a lesson.</p>
      </div>
      <div className="mt-4">
        <CollectionSurfer items={SURF_ITEMS} onSelect={onTry} />
      </div>
    </section>
  );
}

export function AgentPreview({ onTry }) {
  return (
    <section id="agent" className="relative py-28 px-6 sm:px-12 lg:px-20 bg-ink">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <SectionLabel>the board</SectionLabel>
          <h2 className="font-light tracking-tight text-3xl sm:text-4xl lg:text-5xl mt-4 text-cyan">
            one chalkboard. every lesson.
          </h2>
          <p className="text-smoke font-light mt-4 text-base leading-relaxed max-w-md">
            no clutter — just you, a prompt, and a board the agent draws on in real time.
          </p>
          <ul className="mt-7 space-y-2.5 text-sm font-light">
            {['knows how deep to go', 'thinks out loud', 'listens when you talk'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-smoke lowercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan" /> {t}
              </li>
            ))}
          </ul>
          <button
            onClick={onTry}
            className="mt-9 group inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-cyan text-ink font-medium hover:bg-white transition-colors"
          >
            try it <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="rounded-3xl border-2 border-black bg-paper whiteboard-shadow overflow-hidden">
            <div className="halftone-dark absolute inset-0 opacity-40" />
            <div className="relative p-8 text-ink">
              <p className="text-[10px] tracking-[0.3em] uppercase text-ink/50">chalkboard</p>
              <h3 className="text-2xl mt-2">gradient descent</h3>
              <p className="mt-3 text-ink/80 leading-relaxed text-sm font-light">
                imagine a foggy hill. you feel the slope and step downhill…
              </p>
              <div className="mt-4 inline-block bg-ink text-paper text-sm px-4 py-2 rounded">θ := θ − α ∇J(θ)</div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {['input', 'loss', 'update'].map((b, i) => (
                  <div key={b} className={`h-14 grid place-items-center border-2 border-ink rounded text-sm ${i === 1 ? 'bg-acid' : ''}`}>{b}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[88%] glass-strong rounded-2xl px-4 h-14 flex items-center gap-3">
            <span className="text-ash text-sm flex-1 font-light">ask anything…</span>
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10"><Mic size={16} className="text-cyan" /></span>
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-cyan text-ink">↑</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer({ onTry }) {
  return (
    <footer className="relative bg-coal border-t border-white/10 py-16 px-6 sm:px-12 lg:px-20">
      <div className="relative mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <div className="text-2xl tracking-[0.12em]">chalk<span className="text-cyan">mind</span></div>
          <p className="text-ash font-light mt-2 text-xs">learn on the night train · 2026</p>
        </div>
        <button onClick={onTry} className="h-12 px-7 rounded-2xl bg-cyan text-ink font-medium hover:bg-white transition-colors">
          board now →
        </button>
      </div>
    </footer>
  );
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-cyan font-light">
      <span className="w-6 h-px bg-cyan" /> {children}
    </span>
  );
}
