import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import EmptyState from '../components/EmptyState';

export default function ChatPage() {
  const { token } = useAuthStore();
  const { initSocket, fetchRooms, activeRoom, disconnectSocket } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (token) { initSocket(token); fetchRooms(); }
    return () => disconnectSocket();
  }, [token]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleRoomSelect = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100dvh',
      overflow: 'hidden',
      background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 30%, #1e3a6e 65%, #0f2744 100%)',
      position: 'relative',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Background mesh — matches auth page dark panel */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 50% at 0% 0%, rgba(125,211,252,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 100% 100%, rgba(192,132,252,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* Dot grid — matches auth page */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }} />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10,
            background: 'rgba(10, 8, 40, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onRoomSelect={handleRoomSelect}
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        minWidth: 0,
        transition: 'margin-left 0.35s ease',
      }}>
        {activeRoom
          ? <ChatWindow isMobile={isMobile} onMenuClick={() => setSidebarOpen(true)} />
          : <EmptyState isMobile={isMobile} onMenuClick={() => setSidebarOpen(true)} />
        }
      </div>
    </div>
  );
}