import { motion } from 'framer-motion';
import { MessageSquareText, Brain, GitBranch, Mic, ArrowUpRight } from 'lucide-react';
import CollectionSurfer from '@/components/CollectionSurfer';

const STEPS = [
  {
    n: '01',
    icon: MessageSquareText,
    title: 'Ask anything',
    body: 'Type or speak a question into the Claude-style input. Photosynthesis, gradient descent, the French Revolution — anything.',
    color: '#00F0FF',
  },
  {
    n: '02',
    icon: Brain,
    title: 'Watch it think',
    body: 'The agent scaffolds a lesson in real time, reasoning out loud before sketching diagrams, graphs and equations on the board.',
    color: '#FF5C00',
  },
  {
    n: '03',
    icon: GitBranch,
    title: 'Prove it stuck',
    body: 'Every lesson ends in a checkpoint. Get it right and you level up; miss it and the agent re-explains a different way.',
    color: '#FAFF00',
  },
];

const SURF_ITEMS = [
  { id: 'd1', title: 'Linear Algebra', tag: 'Math', meta: '12 topics · 41 nodes', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80' },
  { id: 'd2', title: 'Neural Networks', tag: 'AI', meta: '8 topics · 33 nodes', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80' },
  { id: 'd3', title: 'Organic Chemistry', tag: 'Science', meta: '15 topics · 60 nodes', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80' },
  { id: 'd4', title: 'World History', tag: 'Humanities', meta: '20 topics · 88 nodes', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80' },
  { id: 'd5', title: 'Quantum Physics', tag: 'Science', meta: '9 topics · 27 nodes', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80' },
  { id: 'd6', title: 'Data Structures', tag: 'CS', meta: '11 topics · 52 nodes', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80' },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 px-6 sm:px-12 lg:px-20 bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>The ride · 03 stops</SectionLabel>
        <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl mt-4 max-w-2xl">
          Not a chatbot. <span className="text-cyan">A tutor with chalk.</span>
        </h2>
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="group relative rounded-3xl glass p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="halftone absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className="grid place-items-center w-12 h-12 rounded-2xl"
                    style={{ background: `${s.color}1a`, color: s.color }}
                  >
                    <s.icon size={22} />
                  </span>
                  <span className="font-display font-black text-4xl text-white/10">{s.n}</span>
                </div>
                <h3 className="font-display font-bold text-2xl mt-6">{s.title}</h3>
                <p className="text-smoke mt-3 leading-relaxed text-[15px]">{s.body}</p>
              </div>
              <div
                className="absolute -bottom-px left-7 right-7 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg,transparent,${s.color},transparent)` }}
              />
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
      <div className="absolute inset-0 halftone opacity-10" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <SectionLabel>Collection Surfer</SectionLabel>
            <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl mt-4 max-w-xl">
              Your knowledge, on rails.
            </h2>
          </div>
          <p className="text-smoke max-w-sm text-[15px]">
            Every subject becomes a collection of topics and nodes you can surf through
            in 3D. Drag, scroll, dive in.
          </p>
        </div>
      </div>
      <div className="mt-6">
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
          <SectionLabel>The Teaching Agent</SectionLabel>
          <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl mt-4">
            One black-and-white board. <span className="text-warm">Infinite lessons.</span>
          </h2>
          <p className="text-smoke mt-5 text-lg leading-relaxed max-w-xl">
            No sidebars cluttering the canvas. Just you, a prompt bar, and a brutalist
            chalkboard where the agent draws diagrams, plots functions, writes equations
            and quizzes you — all in one panel.
          </p>
          <ul className="mt-8 space-y-3 font-mono text-sm">
            {['Bloom’s-taxonomy aware scaffolding', 'Live reasoning while it thinks', 'Voice dictation built in'].map(
              (t) => (
                <li key={t} className="flex items-center gap-3 text-smoke">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan" /> {t}
                </li>
              )
            )}
          </ul>
          <button
            onClick={onTry}
            className="mt-10 group inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-2xl bg-white text-ink font-bold hover:bg-cyan transition-colors"
          >
            Try the board <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* mock board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="rounded-3xl border-2 border-black bg-paper whiteboard-shadow overflow-hidden">
            <div className="halftone-dark absolute inset-0 opacity-40" />
            <div className="relative p-8 text-ink">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink/50">Chalkboard</p>
              <h3 className="font-display font-black text-3xl mt-2">Gradient Descent</h3>
              <p className="mt-3 text-ink/80 leading-relaxed text-sm">
                Imagine standing on a foggy hill, trying to reach the valley. You feel the
                slope under your feet and step downhill…
              </p>
              <div className="mt-5 inline-block bg-ink text-paper font-mono text-sm px-4 py-2 rounded">
                θ := θ − α ∇J(θ)
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['Input', 'Loss', 'Update'].map((b, i) => (
                  <div key={b} className={`h-16 grid place-items-center border-2 border-ink rounded font-bold text-sm ${i === 1 ? 'bg-acid' : ''}`}>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* floating prompt bar */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[88%] glass-strong rounded-2xl px-4 h-14 flex items-center gap-3">
            <span className="text-ash text-sm flex-1 font-mono">Ask the agent anything…</span>
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10">
              <Mic size={16} className="text-cyan" />
            </span>
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-cyan text-ink font-bold">↑</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer({ onTry }) {
  return (
    <footer className="relative bg-coal border-t border-white/10 py-16 px-6 sm:px-12 lg:px-20 overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <div className="font-display font-black text-3xl tracking-tight">
            CHALK<span className="text-cyan">MIND</span>
          </div>
          <p className="text-ash mt-2 font-mono text-xs">Learn on the night train. © 2026</p>
        </div>
        <button
          onClick={onTry}
          className="h-13 px-8 py-3.5 rounded-2xl bg-white text-ink font-bold hover:bg-cyan transition-colors"
        >
          Board now →
        </button>
      </div>
    </footer>
  );
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-cyan">
      <span className="w-6 h-px bg-cyan" /> {children}
    </span>
  );
}
