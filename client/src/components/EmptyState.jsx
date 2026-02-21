import React from 'react';
import { useChatStore } from '../store/chatStore';

export default function EmptyState({ isMobile, onMenuClick }) {
  const { onlineUsers } = useChatStore();

  const features = [
    { label: 'Real-time', detail: 'WebSocket <10ms latency', icon: '⚡', color: '#7dd3fc' },
    { label: 'Channels', detail: 'Public & private groups', icon: '#', color: '#c084fc' },
    { label: 'Direct Messages', detail: 'Private conversations', icon: '→', color: '#f9a8d4' },
    { label: 'Live Presence', detail: 'See who\'s online now', icon: '●', color: '#6ee7b7' },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, var(--ink-2) 0%, var(--ink) 50%, var(--ink-3) 100%)',
    }}>
      {/* Mobile menu button */}
      {isMobile && (
        <button onClick={onMenuClick} style={{
          position: 'absolute', top: 20, left: 20,
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--t2)', zIndex: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', width: 450, height: 450, borderRadius: '50%',
        top: '-20%', right: '-10%',
        background: 'radial-gradient(circle, rgba(125,211,252,0.05), transparent 65%)',
        animation: 'orbDrift 20s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        bottom: '-10%', left: '-8%',
        background: 'radial-gradient(circle, rgba(192,132,252,0.05), transparent 65%)',
        animation: 'orbDrift 16s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(125,211,252,0.07) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 70% at center, black 20%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Center content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: isMobile ? 24 : 32,
        maxWidth: 560, padding: '0 24px', textAlign: 'center',
      }}>
        {/* Logo mark */}
        <div style={{
          position: 'relative',
          width: 88, height: 88,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeUp 0.5s var(--ease-out) both',
        }}>
          {/* Rotating rings */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(125,211,252,0.15)',
            animation: 'spin 12s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 12, borderRadius: '50%',
            border: '1px solid rgba(192,132,252,0.1)',
            animation: 'spin 8s linear infinite reverse',
          }} />

          {/* Core */}
          <div style={{
            width: 58, height: 58, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(125,211,252,0.08), rgba(192,132,252,0.08))',
            border: '1px solid rgba(125,211,252,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(125,211,252,0.1)',
            animation: 'breathe 4s ease-in-out infinite',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="url(#emptyG)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="emptyG" x1="3" y1="3" x2="21" y2="21">
                  <stop stopColor="#7dd3fc"/><stop offset="1" stopColor="#c084fc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div style={{ animation: 'fadeUp 0.5s 0.1s var(--ease-out) both' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em',
            color: 'var(--sky)', marginBottom: 12, opacity: 0.7,
          }}>WELCOME TO</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 32 : 42,
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1,
            background: 'linear-gradient(135deg, var(--t1) 0%, var(--t2) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>Nexus Chat</h1>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 20 : 26,
            fontWeight: 300, letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, var(--sky), var(--plum))',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
            marginBottom: 14,
          }}>Real-time Chat Application </div>
          <p style={{
            fontSize: isMobile ? 13 : 14, color: 'var(--t3)', lineHeight: 1.8,
            maxWidth: 380, margin: '0 auto', fontWeight: 300,
          }}>
            Select a conversation from the sidebar to start chatting, or create a new channel to bring your team together.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
          gap: 10, width: '100%',
          animation: 'fadeUp 0.5s 0.2s var(--ease-out) both',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14, textAlign: 'left',
              transition: 'border-color 0.2s, background 0.2s',
              animation: `fadeUp 0.4s ${0.2 + i * 0.07}s var(--ease-out) both`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `${f.color}12`, border: `1px solid ${f.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: f.color,
                fontFamily: 'var(--font-mono)',
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: f.color, letterSpacing: '0.01em' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 2, lineHeight: 1.4 }}>
                  {f.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Online pill */}
        <div style={{ animation: 'fadeUp 0.5s 0.38s var(--ease-out) both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px',
            background: 'rgba(110,231,183,0.06)',
            border: '1px solid rgba(110,231,183,0.18)',
            borderRadius: 99, fontSize: 12.5,
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--mint)', animation: 'pulseDot 2s infinite',
              boxShadow: '0 0 8px var(--mint)',
            }} />
            <span style={{ color: 'var(--mint)', fontWeight: 700 }}>{onlineUsers.length}</span>
            <span style={{ color: 'var(--t3)' }}>users online right now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
