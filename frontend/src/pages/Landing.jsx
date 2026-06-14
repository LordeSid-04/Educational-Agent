import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import { HowItWorks, SurferShowcase, AgentPreview, Footer } from '@/components/landing/Sections';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingEnter, setPendingEnter] = useState(false);

  const enterWorkspace = () => {
    if (user) navigate('/app');
    else {
      setPendingEnter(true);
      setAuthOpen(true);
    }
  };

  return (
    <main className="relative bg-ink">
      <Navbar onLogin={() => setAuthOpen(true)} onSignup={() => setAuthOpen(true)} />
      <Hero onEnter={enterWorkspace} />
      <HowItWorks />
      <SurferShowcase onTry={enterWorkspace} />
      <AgentPreview onTry={enterWorkspace} />
      <Footer onTry={enterWorkspace} />

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingEnter(false);
        }}
        onAuthed={() => {
          setAuthOpen(false);
          if (pendingEnter || true) navigate('/app');
        }}
      />
    </main>
  );
}
