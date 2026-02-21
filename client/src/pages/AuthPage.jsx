import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const WORDS = ['connect.', 'collaborate.', 'communicate.'];

function Blob({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />;
}

function FormCard({ isMobile, mode, setMode, form, setForm, focused, setFocused,
  showPass, setShowPass, error, loading, handleSubmit, fields }) {
  return (
    <div style={{
      width: isMobile ? '100%' : 420,
      minWidth: isMobile ? 'unset' : 380,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: isMobile ? '36px 28px 32px' : '52px 44px',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: isMobile ? 24 : 0,
      boxShadow: isMobile ? '0 24px 60px rgba(100,80,200,0.15), 0 0 0 1px rgba(200,200,255,0.25)' : 'none',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #6366f1, #a855f7, #f9a8d4)',
      }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.09), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -50, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.08), transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
          border: '1px solid rgba(125,100,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(100,80,200,0.12)',
        }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="url(#cardG)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="cardG" x1="3" y1="3" x2="21" y2="21">
                <stop stopColor="#6366f1"/><stop offset="1" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800,
            letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Nexus</div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#a5b4fc', letterSpacing: '0.14em', marginTop: 0.5 }}>
            by Navneet Prasad
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: 3,
        background: '#f1f5f9', borderRadius: 14, padding: 4,
        marginBottom: 26, position: 'relative', zIndex: 1,
      }}>
        {[{ id: 'login', label: 'Sign In' }, { id: 'register', label: 'Create Account' }].map(t => (
          <button key={t.id}
            onClick={() => setMode(t.id)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 11,
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', border: 'none',
              background: mode === t.id ? '#ffffff' : 'transparent',
              color: mode === t.id ? '#1e293b' : '#94a3b8',
              boxShadow: mode === t.id ? '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              transition: 'all 0.22s ease',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: 22, position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
          letterSpacing: '-0.02em', color: '#0f172a', marginBottom: 5,
        }}>
          {mode === 'login' ? 'Welcome back 👋' : 'Join Nexus ✨'}
        </h2>
        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
          {mode === 'login' ? 'Sign in to continue your conversations' : 'Create your account and start connecting'}
        </p>
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13, position: 'relative', zIndex: 1 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <label style={{
              display: 'block', fontSize: 10.5, fontWeight: 600,
              fontFamily: 'var(--font-mono)', color: '#64748b',
              letterSpacing: '0.09em', marginBottom: 6, textTransform: 'uppercase',
            }}>{f.label}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused('')}
                required
                style={{
                  width: '100%',
                  padding: f.isPass ? '12px 44px 12px 14px' : '12px 14px',
                  borderRadius: 11,
                  border: focused === f.key ? '1.5px solid #818cf8' : '1.5px solid #e2e8f0',
                  background: focused === f.key ? '#fafaff' : '#f8fafc',
                  color: '#0f172a', fontSize: 14,
                  fontFamily: 'var(--font-sans)', outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  boxShadow: focused === f.key ? '0 0 0 3px rgba(129,140,248,0.16)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              />
              {f.isPass && (
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                    display: 'flex', padding: 2,
                  }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 13px',
            background: 'linear-gradient(135deg, #fff1f5, #fff8fa)',
            border: '1px solid #fecdd3', borderRadius: 10,
            fontSize: 12.5, color: '#e11d48',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e11d48', flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '14px',
          borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 700, color: '#fff',
          fontFamily: 'var(--font-sans)',
          position: 'relative', overflow: 'hidden',
          marginTop: 4,
          boxShadow: '0 8px 24px rgba(99,102,241,0.3), 0 2px 6px rgba(0,0,0,0.08)',
          transform: loading ? 'scale(0.98)' : 'scale(1)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          opacity: loading ? 0.88 : 1,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #a855f7 100%)' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
          }} />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />Connecting...</>
            ) : (
              <>{mode === 'login' ? 'Sign In to Nexus' : 'Create My Account'}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
            )}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 13px', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        <span style={{ fontSize: 9, color: '#cbd5e1', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em' }}>NEXUS PROTOCOL</span>
        <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
      </div>

      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
        By continuing, you agree to our terms of service.<br />Your data is encrypted in transit.
      </p>

      <div style={{ marginTop: 18, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: '#cbd5e1', letterSpacing: '0.08em' }}>
          Crafted with 💓 by{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}>Navneet Prasad</span>
        </span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { login, register, loading, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { if (token) navigate('/'); }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % WORDS.length);
        setWordVisible(true);
      }, 380);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      if (!form.username.trim()) return setError('Username is required');
      result = await register(form.username, form.email, form.password);
    }
    if (result.success) navigate('/');
    else setError(result.error);
  };

  const fields = mode === 'register'
    ? [
        { key: 'username', label: 'Username', type: 'text', placeholder: 'your_handle' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'you@domain.com' },
        { key: 'password', label: 'Password', type: showPass ? 'text' : 'password', placeholder: '••••••••', isPass: true },
      ]
    : [
        { key: 'email', label: 'Email', type: 'email', placeholder: 'you@domain.com' },
        { key: 'password', label: 'Password', type: showPass ? 'text' : 'password', placeholder: '••••••••', isPass: true },
      ];

  const cardProps = {
    isMobile, mode, setMode, form, setForm, focused, setFocused,
    showPass, setShowPass, error, loading, handleSubmit, fields,
  };

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100dvh', width: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 30%, #1e3a6e 65%, #0f2744 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '20px 16px',
        fontFamily: 'var(--font-sans)',
      }}>
        <Blob style={{ width: 400, height: 400, top: '-15%', left: '-20%', background: 'rgba(99,102,241,0.12)', animation: 'orbDrift 22s ease-in-out infinite' }} />
        <Blob style={{ width: 350, height: 350, bottom: '-10%', right: '-15%', background: 'rgba(168,85,247,0.1)', animation: 'orbDrift 18s ease-in-out infinite reverse' }} />
        <Blob style={{ width: 200, height: 200, top: '40%', right: '5%', background: 'rgba(249,168,212,0.15)', animation: 'orbDrift 14s ease-in-out infinite 2s' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{
          width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <FormCard {...cardProps} />
        </div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #fdf4ff 70%, #fff1f5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      <Blob style={{ width: 600, height: 600, top: '-20%', left: '-12%', background: 'rgba(99,102,241,0.1)', animation: 'orbDrift 22s ease-in-out infinite' }} />
      <Blob style={{ width: 500, height: 500, bottom: '-15%', right: '-10%', background: 'rgba(168,85,247,0.1)', animation: 'orbDrift 18s ease-in-out infinite reverse' }} />
      <Blob style={{ width: 300, height: 300, top: '55%', left: '42%', transform: 'translate(-50%,-50%)', background: 'rgba(249,168,212,0.12)', animation: 'orbDrift 14s ease-in-out infinite 3s' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{
        display: 'flex', width: '100%', height: '100%',
        minHeight: 600, overflow: 'hidden',
        boxShadow: '0 32px 100px rgba(80,60,180,0.14), 0 0 0 1px rgba(200,200,255,0.3)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        position: 'relative', zIndex: 1,
      }}>
        {/* LEFT panel */}
        <div style={{
          flex: 1, minWidth: 0,
          background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 30%, #1e3a6e 65%, #0f2744 100%)',
          padding: '52px 44px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', width: 350, height: 350, top: '-10%', right: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 280, height: 280, bottom: '5%', left: '-8%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.1), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(125,211,252,0.2), rgba(192,132,252,0.2))',
                border: '1px solid rgba(125,211,252,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 32px rgba(125,211,252,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}>
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="url(#leftG)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="leftG" x1="3" y1="3" x2="21" y2="21">
                      <stop stopColor="#7dd3fc"/><stop offset="1" stopColor="#c084fc"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(135deg, #bfdbfe, #e9d5ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Nexus</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(125,211,252,0.65)', letterSpacing: '0.16em', marginTop: 1 }}>
                  by Navneet Prasad
                </div>
              </div>
            </div>

            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(125,211,252,0.6)', letterSpacing: '0.2em', marginBottom: 16 }}>
              THE FUTURE OF MESSAGING
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.12,
              letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.95)',
              fontSize: 'clamp(28px, 2.8vw, 44px)', marginBottom: 6,
            }}>A better way to</h1>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.12,
              letterSpacing: '-0.03em',
              fontSize: 'clamp(28px, 2.8vw, 44px)',
              background: 'linear-gradient(135deg, #7dd3fc 0%, #c084fc 55%, #f9a8d4 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
              opacity: wordVisible ? 1 : 0,
              transform: wordVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
              marginBottom: 22, minHeight: '1.2em',
            }}>{WORDS[wordIdx]}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, fontWeight: 300, maxWidth: 310, marginBottom: 36 }}>
              Real-time channels, direct messages, and live presence — all in a beautifully minimal interface.
            </p>

            {[
              { icon: '⚡', text: 'Sub-10ms WebSocket latency', c: '#7dd3fc' },
              { icon: '🔐', text: 'JWT auth & encrypted transit', c: '#c084fc' },
              { icon: '👥', text: 'Live presence & typing indicators', c: '#6ee7b7' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `${f.c}14`, border: `1px solid ${f.c}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{f.icon}</div>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', gap: 14,
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ display: 'flex' }}>
              {['#7dd3fc', '#c084fc', '#f9a8d4', '#6ee7b7'].map((c, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${c}20`, border: '2px solid rgba(255,255,255,0.07)',
                  outline: `1.5px solid ${c}30`, marginLeft: i > 0 ? -8 : 0,
                }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ color: '#7dd3fc' }}>2,400+</span> users chatting
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>Join the conversation today</div>
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <FormCard {...cardProps} />
      </div>
    </div>
  );
}
