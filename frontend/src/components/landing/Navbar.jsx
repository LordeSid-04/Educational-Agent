import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
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
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 py-4"
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
            <Logo size={32} className="transition-transform group-hover:scale-110" />
            <span className="font-mono font-medium text-base tracking-[0.12em]">
              chalk<span className="text-cyan">mind</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                data-testid={CM.navEnter}
                onClick={() => navigate('/app')}
                className="h-10 px-5 rounded-xl bg-cyan text-ink font-medium text-sm hover:bg-white transition-colors"
              >
                open workspace
              </button>
            ) : (
              <>
                <button
                  data-testid={CM.navLogin}
                  onClick={onLogin}
                  className="h-10 px-4 rounded-xl text-sm font-light text-white/80 hover:bg-white/10 transition-colors"
                >
                  log in
                </button>
                <button
                  data-testid={CM.navSignup}
                  onClick={onSignup}
                  className="h-10 px-5 rounded-xl bg-cyan text-ink font-medium text-sm hover:bg-white transition-colors"
                >
                  get a pass
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
