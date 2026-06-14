import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CM } from '@/constants/testIds';

export default function Navbar({ onLogin, onSignup }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 h-14 transition-all duration-300 ${
            scrolled ? 'glass-strong' : 'bg-transparent'
          }`}
        >
          <button
            data-testid={CM.navLogo}
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-cyan text-ink">
              <Train size={18} strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl bg-cyan blur-md opacity-50 -z-10 group-hover:opacity-80 transition-opacity" />
            </span>
            <span className="font-display font-extrabold text-lg tracking-tight">
              CHALK<span className="text-cyan">MIND</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-[0.15em] uppercase text-smoke">
            <a href="#how" className="hover:text-white transition-colors">The Ride</a>
            <a href="#surfer" className="hover:text-white transition-colors">Collections</a>
            <a href="#agent" className="hover:text-white transition-colors">Teaching Agent</a>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                data-testid={CM.navEnter}
                onClick={() => navigate('/app')}
                className="h-10 px-5 rounded-xl bg-cyan text-ink font-bold text-sm hover:bg-white transition-colors"
              >
                Open workspace
              </button>
            ) : (
              <>
                <button
                  data-testid={CM.navLogin}
                  onClick={onLogin}
                  className="h-10 px-4 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                >
                  Log in
                </button>
                <button
                  data-testid={CM.navSignup}
                  onClick={onSignup}
                  className="h-10 px-5 rounded-xl bg-white text-ink font-bold text-sm hover:bg-cyan transition-colors"
                >
                  Get a pass
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
