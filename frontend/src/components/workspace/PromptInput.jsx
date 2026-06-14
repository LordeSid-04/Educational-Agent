import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, ArrowUp, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRecorder } from '@/hooks/useRecorder';
import { CM } from '@/constants/testIds';

const BLOOM = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

export default function PromptInput({ onSubmit, busy, bloom, setBloom }) {
  const [value, setValue] = useState('');

  const { recording, transcribing, toggle } = useRecorder({
    onText: (text, err) => {
      if (err) return toast.error('mic unavailable here. type instead.');
      if (text) {
        setValue((v) => (v ? `${v} ${text}` : text));
        toast.success('got it.');
      }
    },
  });

  const submit = () => {
    const t = value.trim();
    if (!t || busy) return;
    onSubmit(t);
    setValue('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* bloom selector */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto no-scrollbar" data-testid={CM.bloomSelect}>
        <span className="text-[10px] uppercase tracking-[0.2em] text-ash shrink-0 mr-1 font-light">depth</span>
        {BLOOM.map((b) => (
          <button
            key={b}
            onClick={() => setBloom(b)}
            className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              bloom === b
                ? 'bg-cyan text-ink border-cyan font-bold'
                : 'border-white/10 text-ash hover:text-white hover:border-white/30'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <motion.div
        animate={recording ? { boxShadow: '0 0 0 2px rgba(255,0,60,0.6), 0 0 40px rgba(255,0,60,0.35)' } : { boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
        className="relative flex items-end gap-2 rounded-3xl glass-strong p-2.5 pl-5"
      >
        <textarea
          data-testid={CM.promptInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={recording ? 'listening…' : 'ask anything…'}
          className="flex-1 bg-transparent resize-none outline-none text-white placeholder:text-ash py-2.5 max-h-40 text-[15px]"
          style={{ minHeight: 24 }}
        />

        <button
          data-testid={CM.micBtn}
          onClick={toggle}
          disabled={transcribing}
          title="Voice dictation"
          className={`shrink-0 grid place-items-center w-11 h-11 rounded-2xl transition-colors ${
            recording ? 'bg-magenta text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {transcribing ? <Loader2 size={18} className="animate-spin" /> : recording ? <Square size={16} /> : <Mic size={18} />}
        </button>

        <button
          data-testid={CM.promptSubmit}
          onClick={submit}
          disabled={busy || !value.trim()}
          className="shrink-0 grid place-items-center w-11 h-11 rounded-2xl bg-cyan text-ink hover:bg-white transition-colors disabled:opacity-40"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={2.5} />}
        </button>
      </motion.div>
      <p className="text-center text-[10px] text-ash/70 mt-2 font-light">
        enter to send · ⇧ + enter for a new line · 🎤 to speak
      </p>
    </div>
  );
}
