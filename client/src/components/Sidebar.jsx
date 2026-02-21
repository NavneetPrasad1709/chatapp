import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import Avatar from './Avatar';
import NewRoomModal from './NewRoomModal';
import NewDMModal from './NewDMModal';

function SidebarItem({ room, isActive, onClick, user, onlineUsers }) {
  const [hovered, setHovered] = useState(false);
  const isDirect = room.isDirect;
  const other = isDirect ? room.members?.find(m => m._id !== user?._id) : null;
  const name = isDirect ? (other?.username || 'Unknown') : room.name;
  const isOtherOnline = other && onlineUsers.includes(other._id);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 12,
        background: isActive
          ? 'linear-gradient(135deg, rgba(125,211,252,0.09), rgba(192,132,252,0.07))'
          : hovered ? 'var(--surface)' : 'transparent',
        border: isActive
          ? '1px solid rgba(125,211,252,0.18)'
          : hovered ? '1px solid var(--border)' : '1px solid transparent',
        color: 'var(--t1)',
        transition: 'all 0.2s var(--ease-out)',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active bar */}
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2,
        borderRadius: 99,
        background: 'linear-gradient(180deg, var(--sky), var(--plum))',
        boxShadow: '0 0 8px var(--sky)',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.2s',
      }} />

      {/* Icon / avatar */}
      {isDirect && other ? (
        <Avatar user={other} size={36} showOnline onlineUsers={onlineUsers} />
      ) : (
        <div style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: isActive ? 'rgba(125,211,252,0.07)' : 'var(--surface)',
          border: `1px solid ${isActive ? 'rgba(125,211,252,0.2)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
          boxShadow: isActive ? '0 0 12px rgba(125,211,252,0.1)' : 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 600,
            color: isActive ? 'var(--sky)' : 'var(--t3)',
            transition: 'color 0.2s',
          }}>#</span>
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? 'var(--t1)' : 'var(--t2)',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>{name}</div>
        {room.lastMessage && (
          <div style={{
            fontSize: 11,
            color: 'var(--t3)',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            marginTop: 2,
            fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--sky)', opacity: 0.7 }}>{room.lastMessage.sender}: </span>
            {room.lastMessage.content?.slice(0, 26)}
            {room.lastMessage.content?.length > 26 ? '…' : ''}
          </div>
        )}
      </div>

      {/* Online indicator for DMs */}
      {isDirect && other && (
        <div style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: isOtherOnline ? 'var(--mint)' : 'transparent',
          border: `1.5px solid ${isOtherOnline ? 'transparent' : 'var(--t4)'}`,
          flexShrink: 0,
          boxShadow: isOtherOnline ? '0 0 6px var(--mint)' : 'none',
        }} />
      )}
    </button>
  );
}

function IconButton({ children, onClick, title, badge }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: hov ? 'var(--surface-hover)' : 'var(--surface)',
        border: '1px solid var(--border)',
        color: hov ? 'var(--sky)' : 'var(--t3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        position: 'relative',
      }}>
      {children}
      {badge && (
        <div style={{
          position: 'absolute', top: -3, right: -3,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--sky)', border: '2px solid var(--ink-2)',
        }} />
      )}
    </button>
  );
}

export default function Sidebar({ isMobile, sidebarOpen, onRoomSelect }) {
  const { user, logout } = useAuthStore();
  const { rooms, activeRoom, setActiveRoom, onlineUsers } = useChatStore();
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = rooms.filter(r => {
    const name = r.isDirect
      ? r.members?.find(m => m._id !== user?._id)?.username || ''
      : r.name;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    if (tab === 'dms') return r.isDirect && matchSearch;
    if (tab === 'channels') return !r.isDirect && matchSearch;
    return matchSearch;
  });

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    if (onRoomSelect) onRoomSelect();
  };

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minWidth: 'var(--sidebar-w)',
      height: '100vh',
      background: 'linear-gradient(180deg, var(--ink-2) 0%, var(--ink) 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: isMobile ? 'fixed' : 'relative',
      left: 0, top: 0, bottom: 0,
      zIndex: isMobile ? 200 : 1,
      transform: isMobile
        ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
        : 'none',
      transition: isMobile ? 'transform 0.35s var(--ease-out)' : 'none',
      boxShadow: isMobile && sidebarOpen ? '4px 0 40px rgba(0,0,0,0.6)' : 'none',
    }}>
      {/* Top ambient glow */}
      <div style={{
        position: 'absolute', top: -80, left: -40, width: 240, height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(125,211,252,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 14px 12px',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(125,211,252,0.15), rgba(192,132,252,0.15))',
            border: '1px solid rgba(125,211,252,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(125,211,252,0.12)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="url(#sbLogoG)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="sbLogoG" x1="3" y1="3" x2="21" y2="21">
                  <stop stopColor="#7dd3fc"/><stop offset="1" stopColor="#c084fc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              letterSpacing: '0.01em',
              color: 'var(--t1)',
              fontFamily: 'var(--font-display)',
            }}>Nexus</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 9, color: 'var(--mint)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.15em',
              marginTop: 1,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--mint)',
                animation: 'pulseDot 2s ease-in-out infinite',
                boxShadow: '0 0 6px var(--mint)',
              }} />
              LIVE
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton onClick={() => setShowNewDM(true)} title="New DM">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </IconButton>
          <IconButton onClick={() => setShowNewRoom(true)} title="New Channel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </IconButton>
          {isMobile && (
            <IconButton onClick={onRoomSelect} title="Close">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </IconButton>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{
        margin: '0 10px 8px',
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 10px',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={{
            flex: 1, background: 'transparent',
            color: 'var(--t1)', fontSize: 12,
            padding: '9px 0',
          }}
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            background: 'none', color: 'var(--t3)', fontSize: 13, lineHeight: 1,
          }}>×</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', margin: '0 10px 6px',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: 10, padding: 3, gap: 2,
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'channels', label: '# Channels' },
          { id: 'dms', label: '↗ DMs' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '7px 4px',
              borderRadius: 8, fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.02em',
              color: tab === t.id ? 'var(--sky)' : 'var(--t3)',
              background: tab === t.id ? 'rgba(125,211,252,0.08)' : 'transparent',
              border: tab === t.id ? '1px solid rgba(125,211,252,0.15)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '5px 14px 5px',
        fontSize: 9, letterSpacing: '0.14em',
        color: 'var(--t4)', fontFamily: 'var(--font-mono)',
      }}>
        <span>{tab === 'dms' ? 'DIRECT MESSAGES' : tab === 'channels' ? 'CHANNELS' : 'CONVERSATIONS'}</span>
        <span style={{ color: 'var(--sky)', fontWeight: 700 }}>{filtered.length}</span>
      </div>

      {/* Room list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '3px 8px', display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 10, padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, opacity: 0.35 }}>
              {search ? '🔍' : tab === 'dms' ? '💬' : '#'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              {search ? 'No results' : 'Nothing here yet'}
            </div>
            {!search && (
              <button
                onClick={() => tab === 'dms' ? setShowNewDM(true) : setShowNewRoom(true)}
                style={{
                  marginTop: 4, padding: '7px 14px',
                  borderRadius: 8, background: 'var(--surface)',
                  border: '1px solid var(--border)', color: 'var(--sky)', fontSize: 11, fontWeight: 600,
                }}>
                {tab === 'dms' ? '+ New DM' : '+ New Channel'}
              </button>
            )}
          </div>
        ) : (
          filtered.map(room => (
            <SidebarItem
              key={room._id}
              room={room}
              isActive={activeRoom?._id === room._id}
              onClick={() => handleRoomClick(room)}
              user={user}
              onlineUsers={onlineUsers}
            />
          ))
        )}
      </div>

      {/* Online count bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--mint)',
          animation: 'pulseDot 2s infinite',
          boxShadow: '0 0 8px var(--mint)',
        }} />
        <span style={{ fontSize: 10.5, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--mint)', fontWeight: 700 }}>{onlineUsers.length}</span> online
        </span>
      </div>

      {/* User profile footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <Avatar user={user} size={36} ring />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>{user?.username}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 9.5, color: 'var(--mint)',
            fontFamily: 'var(--font-mono)', marginTop: 2,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--mint)' }} />
            Active
          </div>
        </div>
        <button onClick={logout} title="Sign out" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 7, color: 'var(--t3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      {showNewRoom && <NewRoomModal onClose={() => setShowNewRoom(false)} />}
      {showNewDM && <NewDMModal onClose={() => setShowNewDM(false)} />}
    </aside>
  );
}
