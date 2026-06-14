import { Home, Layers, GraduationCap, Settings, FolderOpen, FolderClosed, Hash, Mic, ArrowUp, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

// A crisp, full-resolution replica of the real workspace, shown as we "arrive"
// inside the laptop screen. Rendered at 1:1 so it never pixelates.
export default function WorkspaceMock() {
  return (
    <div className="w-full h-full flex bg-ink overflow-hidden text-left select-none">
      {/* sidebar */}
      <aside className="w-60 h-full glass-strong border-r border-white/10 flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-white/5">
          <Logo size={26} />
          <span className="text-sm tracking-[0.12em]">chalk<span className="text-cyan">mind</span></span>
        </div>
        <div className="px-3 pt-3">
          <p className="text-[9px] tracking-[0.25em] uppercase text-cyan mb-2 font-light">collections</p>
          <div className="flex items-center gap-2 h-9 px-2.5 rounded-xl bg-white/10">
            <FolderOpen size={15} className="text-cyan" />
            <span className="text-[13px] font-medium text-white/90">Machine Learning</span>
          </div>
          <div className="ml-3 pl-3 border-l border-white/10 mt-1 space-y-0.5">
            {['Gradient Descent', 'Backprop', 'Overfitting'].map((c, i) => (
              <div key={c} className={`flex items-center gap-2 h-7 px-2 rounded-lg text-[12px] ${i === 0 ? 'bg-cyan/10 text-cyan' : 'text-white/60'}`}>
                <Hash size={11} className="opacity-60" /> {c}
              </div>
            ))}
          </div>
          {['Linear Algebra', 'Organic Chemistry'].map((p) => (
            <div key={p} className="flex items-center gap-2 h-9 px-2.5 rounded-xl hover:bg-white/5 mt-0.5">
              <FolderClosed size={15} className="text-cyan/80" />
              <span className="text-[13px] text-white/80">{p}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 min-w-0 relative flex flex-col">
        <div className="h-14 flex items-center gap-2.5 px-6 shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 text-cyan"><GraduationCap size={16} /></span>
          <div>
            <p className="text-[9px] tracking-[0.25em] uppercase text-ash font-light">teaching agent</p>
            <h1 className="text-sm leading-none mt-0.5 lowercase">gradient descent</h1>
          </div>
        </div>

        {/* chalkboard */}
        <div className="flex-1 overflow-hidden px-6 pb-2">
          <div className="mx-auto max-w-2xl relative rounded-2xl border-2 border-black bg-paper whiteboard-shadow h-full">
            <div className="halftone-dark absolute inset-0 opacity-30 rounded-2xl" />
            <div className="relative p-6 text-ink">
              <h2 className="text-2xl border-b-4 border-ink pb-2 lowercase">gradient descent</h2>
              <p className="text-ink/85 mt-3 text-[13px] leading-relaxed font-light">
                imagine standing on a foggy hill, feeling the slope and stepping downhill toward the valley…
              </p>
              <div className="inline-flex items-center gap-2 bg-ink text-paper px-3 py-1 rounded-sm text-[9px] tracking-[0.2em] uppercase mt-4">the core idea</div>
              <div className="mt-3 inline-block bg-ink text-paper font-mono text-sm px-4 py-2.5 rounded">θ := θ − α ∇J(θ)</div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {['input', 'loss', 'update'].map((b, i) => (
                  <div key={b} className={`h-12 grid place-items-center border-2 border-ink rounded text-xs ${i === 1 ? 'bg-acid' : ''}`}>{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* floating prompt */}
        <div className="px-6 pb-3">
          <div className="mx-auto max-w-2xl flex items-center gap-2 rounded-2xl glass-strong px-4 h-12">
            <Sparkles size={15} className="text-cyan" />
            <span className="flex-1 text-ash text-sm font-light">ask anything…</span>
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/10"><Mic size={14} className="text-cyan" /></span>
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-cyan text-ink"><ArrowUp size={16} strokeWidth={2.5} /></span>
          </div>
        </div>

        {/* dock */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-2.5 px-3 py-2 rounded-2xl glass-strong">
          {[Home, Layers, GraduationCap, Settings].map((Icon, i) => (
            <span key={i} className={`relative grid place-items-center w-9 h-9 rounded-xl border ${i === 2 ? 'bg-cyan/15 border-cyan/50 text-cyan' : 'bg-white/[0.06] border-white/10 text-white/80'}`}>
              <Icon size={17} />
              {i === 2 && <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-cyan" />}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
