import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

function Loader() {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--void)',gap:20 }}>
      <div style={{ width:48,height:48,border:'2px solid rgba(110,231,255,0.1)',borderTopColor:'var(--neon)',borderRadius:'50%',animation:'spin 0.8s linear infinite',boxShadow:'0 0 30px rgba(110,231,255,0.15)' }} />
      <span style={{ fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.2em',color:'var(--text-3)' }}>NEXUS PROTOCOL</span>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/auth" replace />;
  if (!user) return <Loader />;
  return children;
}

export default function App() {
  const { init } = useAuthStore();
  const [ready, setReady] = useState(false);
  useEffect(() => { init().finally(() => setReady(true)); }, []);
  if (!ready) return <Loader />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
