import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { apiErr } from '@/lib/api';
import { CM } from '@/constants/testIds';

export default function AuthModal({ open, onClose, onAuthed }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(username.trim(), password);
      else await register(username.trim(), password, displayName.trim() || username.trim());
      toast.success(mode === 'login' ? 'Welcome back.' : 'Account created. Step inside.');
      onAuthed?.();
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setBusy(false);
    }
  };

  const enterAsGuest = () => {
    toast('Riding as a guest. Your work is saved locally.', { icon: '🎫' });
    onAuthed?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
          <motion.div
            data-testid={CM.authModal}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md glass-strong rounded-3xl overflow-hidden grain"
          >
            <div className="halftone absolute inset-0 opacity-30 pointer-events-none" />
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-ash hover:text-white transition-colors"
              data-testid="auth-close-btn"
            >
              <X size={20} />
            </button>

            <div className="relative p-8">
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan uppercase mb-2">
                ChalkMind Transit Pass
              </p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">
                {mode === 'login' ? 'Board the train' : 'Get your pass'}
              </h2>
              <p className="text-ash text-sm mt-1">
                {mode === 'login'
                  ? 'Pick up where the lesson left off.'
                  : 'Create a pass to save your collections across rides.'}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === 'register' && (
                  <Field
                    label="Display name"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Miles M."
                    testId={CM.authDisplayName}
                  />
                )}
                <Field
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="night_rider"
                  testId={CM.authUsername}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  testId={CM.authPassword}
                  required
                />

                {error && (
                  <p data-testid={CM.authError} className="text-magenta text-sm font-medium">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  data-testid={CM.authSubmit}
                  className="w-full h-12 rounded-2xl bg-cyan text-ink font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-60"
                >
                  {busy && <Loader2 size={18} className="animate-spin" />}
                  {mode === 'login' ? 'Log in' : 'Create pass'}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  data-testid={CM.authToggle}
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-smoke hover:text-white transition-colors"
                >
                  {mode === 'login' ? 'Need a pass? Sign up' : 'Have a pass? Log in'}
                </button>
                <button
                  data-testid={CM.authGuest}
                  onClick={enterAsGuest}
                  className="flex items-center gap-1.5 text-ash hover:text-acid transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  <Ticket size={14} /> Ride as guest
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, testId, required }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">{label}</span>
      <input
        data-testid={testId}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-ash/60 outline-none focus:border-cyan/60 focus:bg-white/[0.07] transition-colors"
      />
    </label>
  );
}
