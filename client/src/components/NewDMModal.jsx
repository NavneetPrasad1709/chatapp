import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import Avatar from './Avatar';

export default function NewDMModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers, createDM, setActiveRoom } = useChatStore();
  const timer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      const users = await searchUsers(query);
      setResults(users);
      setLoading(false);
    }, 280);
    return () => clearTimeout(timer.current);
  }, [query]);

  const handleSelect = async (user) => {
    const room = await createDM(user._id);
    setActiveRoom(room);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.2s ease both',
      padding: '20px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'rgba(12,12,22,0.98)',
        border: '1px solid var(--border)',
        borderRadius: 22, padding: '28px',
        width: '100%', maxWidth: 420,
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', gap: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
        animation: 'fadeUp 0.3s var(--ease-spring) both',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -50, left: -50, width: 180, height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.07), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'rgba(192,132,252,0.08)',
            border: '1px solid rgba(192,132,252,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--plum)',
          }}>⟡</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)' }}>New Direct Message</h2>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>Start a private conversation</p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(192,132,252,0.2)',
          borderRadius: 12, padding: '0 14px',
          boxShadow: '0 0 0 3px rgba(192,132,252,0.04)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: query ? 'var(--plum)' : 'var(--t3)', flexShrink: 0, transition: 'color 0.2s' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            style={{
              flex: 1, background: 'transparent', color: 'var(--t1)',
              padding: '12px 0', fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}
            placeholder="Search by username or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && (
            <div style={{
              width: 14, height: 14, border: '2px solid rgba(192,132,252,0.2)',
              borderTopColor: 'var(--plum)', borderRadius: '50%',
              animation: 'spin 0.6s linear infinite', flexShrink: 0,
            }} />
          )}
          {query && !loading && (
            <button onClick={() => setQuery('')} style={{ background: 'none', color: 'var(--t3)', fontSize: 14 }}>×</button>
          )}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 80 }}>
          {!query && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: '28px 0', color: 'var(--t3)', fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}>
              <div style={{ fontSize: 26, opacity: 0.35 }}>🔍</div>
              Type to search for users
            </div>
          )}
          {query.length === 1 && (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
              Type at least 2 characters...
            </div>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: '24px 0', fontSize: 12, color: 'var(--t3)',
            }}>
              <div style={{ fontSize: 24, opacity: 0.35 }}>😶</div>
              No users found for "<span style={{ color: 'var(--sky)' }}>{query}</span>"
            </div>
          )}
          {results.map((user, i) => {
            const [hov, setHov] = useState(false);
            return (
              <button key={user._id}
                onClick={() => handleSelect(user)}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 13px', borderRadius: 13,
                  background: hov ? 'rgba(192,132,252,0.07)' : 'var(--surface)',
                  border: hov ? '1px solid rgba(192,132,252,0.2)' : '1px solid var(--border)',
                  color: 'var(--t1)', textAlign: 'left',
                  transition: 'all 0.2s var(--ease-out)',
                  transform: hov ? 'translateX(3px)' : 'none',
                  animation: `fadeUp 0.3s ${i * 0.04}s var(--ease-out) both`,
                }}>
                <Avatar user={user} size={40} ring={hov} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: hov ? 'var(--sky)' : 'var(--t1)', transition: 'color 0.2s' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {user.email}
                  </div>
                </div>
                <div style={{
                  opacity: hov ? 1 : 0,
                  transform: hov ? 'translateX(0)' : 'translateX(-6px)',
                  color: 'var(--sky)',
                  transition: 'all 0.2s var(--ease-out)',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
