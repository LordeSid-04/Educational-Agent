import { useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Workspace from '@/pages/Workspace';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Workspace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(10,10,15,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </div>
  );
}

export default App;
