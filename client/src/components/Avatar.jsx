import React from 'react';

const PALETTES = [
  ['#7dd3fc', '#c084fc'],
  ['#f9a8d4', '#fb923c'],
  ['#6ee7b7', '#7dd3fc'],
  ['#c084fc', '#f9a8d4'],
  ['#fcd34d', '#f9a8d4'],
  ['#7dd3fc', '#6ee7b7'],
];

export default function Avatar({ user, size = 36, showOnline = false, onlineUsers = [], ring = false }) {
  if (!user) return null;
  const idx = (user.username?.charCodeAt(0) || 0) % PALETTES.length;
  const [c1, c2] = PALETTES[idx];
  const initials = (user.username || '??').slice(0, 2).toUpperCase();
  const isOnline = onlineUsers.includes(user._id) || (showOnline && user.isOnline);
  const fontSize = size < 32 ? size * 0.38 : size * 0.34;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Animated ring */}
      {ring && (
        <div style={{
          position: 'absolute', inset: -2, borderRadius: '50%',
          background: `conic-gradient(${c1}, ${c2}, ${c1})`,
          animation: 'spin 4s linear infinite',
          zIndex: 0,
        }} />
      )}

      {/* Avatar body */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${c1}28, ${c2}28)`,
        border: ring ? `2px solid var(--ink)` : `1px solid ${c1}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 700, color: c1,
        fontFamily: 'var(--font-mono)',
        boxShadow: `0 0 ${size * 0.35}px ${c1}1a`,
        backdropFilter: 'blur(8px)',
      }}>
        {initials}
      </div>

      {/* Online indicator */}
      {showOnline && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: Math.max(8, size * 0.24), height: Math.max(8, size * 0.24),
          borderRadius: '50%',
          background: isOnline ? 'var(--mint)' : 'var(--t4)',
          border: `2px solid var(--ink-2)`,
          zIndex: 2,
          boxShadow: isOnline ? '0 0 8px var(--mint)' : 'none',
          animation: isOnline ? 'pulseDot 2.5s ease-in-out infinite' : 'none',
          transition: 'background 0.3s',
        }} />
      )}
    </div>
  );
}
