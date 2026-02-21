import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';

export default function NewRoomModal({ onClose }) {
  const [form, setForm] = useState({ name: '', description: '', isPrivate: false });
  const [loading, setLoading] = useState(false);
  const { createRoom, setActiveRoom } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const room = await createRoom(form.name.trim(), form.description, form.isPrivate, []);
      setActiveRoom(room);
      onClose();
    } catch { alert('Failed to create channel'); }
    finally { setLoading(false); }
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
        borderRadius: 22, padding: '28px 28px 24px',
        width: '100%', maxWidth: 420,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
        animation: 'fadeUp 0.3s var(--ease-spring) both',
      }}>
        {/* Top glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(125,211,252,0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 26 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'rgba(125,211,252,0.08)',
            border: '1px solid rgba(125,211,252,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--sky)',
          }}>#</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Create Channel</h2>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>Bring your team together in a shared space</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name field */}
          <div>
            <label style={{
              display: 'block', fontSize: 10,
              fontFamily: 'var(--font-mono)', color: 'var(--t3)',
              letterSpacing: '0.12em', marginBottom: 8,
            }}>CHANNEL NAME</label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid var(--border)',
              borderRadius: 11, overflow: 'hidden',
            }}>
              <span style={{
                padding: '0 12px', color: 'var(--sky)',
                fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
              }}>#</span>
              <input
                style={{
                  flex: 1, background: 'transparent', color: 'var(--t1)',
                  padding: '12px 12px 12px 0', fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                }}
                placeholder="e.g. design-feedback"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                required autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block', fontSize: 10,
              fontFamily: 'var(--font-mono)', color: 'var(--t3)',
              letterSpacing: '0.12em', marginBottom: 8,
            }}>DESCRIPTION <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <textarea
              style={{
                width: '100%', background: 'rgba(0,0,0,0.35)',
                color: 'var(--t1)', padding: '12px 14px', fontSize: 14,
                border: '1px solid var(--border)', borderRadius: 11,
                resize: 'none', lineHeight: 1.6, fontFamily: 'var(--font-sans)',
              }}
              placeholder="What's this channel about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Privacy toggle */}
          <div
            onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s',
              userSelect: 'none',
            }}>
            <span style={{ fontSize: 18 }}>{form.isPrivate ? '🔒' : '🌐'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {form.isPrivate ? 'Private Channel' : 'Public Channel'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                {form.isPrivate ? 'Only invited members can join' : 'Anyone in the workspace can join'}
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 42, height: 23, borderRadius: 12,
              background: form.isPrivate ? 'rgba(125,211,252,0.28)' : 'rgba(255,255,255,0.07)',
              border: form.isPrivate ? '1px solid rgba(125,211,252,0.3)' : '1px solid var(--border)',
              position: 'relative', flexShrink: 0,
              transition: 'all 0.25s var(--ease-out)',
              boxShadow: form.isPrivate ? '0 0 10px rgba(125,211,252,0.15)' : 'none',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.isPrivate ? 21 : 3,
                width: 15, height: 15, borderRadius: '50%',
                background: form.isPrivate ? 'var(--sky)' : 'var(--t3)',
                transition: 'all 0.25s var(--ease-spring)',
                boxShadow: form.isPrivate ? '0 0 6px var(--sky)' : 'none',
              }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: '11px 18px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--t2)', fontSize: 13, fontWeight: 500,
              transition: 'background 0.2s',
            }}>Cancel</button>
            <button type="submit" disabled={loading || !form.name.trim()} style={{
              padding: '11px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, color: '#fff',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(125,211,252,0.2)',
              opacity: loading || !form.name.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(125,211,252,0.75), rgba(192,132,252,0.85))',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading ? 'Creating...' : '+ Create Channel'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
