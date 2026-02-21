import React, { useState } from 'react';
import Avatar from './Avatar';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { format, isToday, isYesterday } from 'date-fns';

function formatTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '💯'];

function ToolbarBtn({ children, onClick, title, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: 7,
        background: hov ? (danger ? 'rgba(249,168,212,0.1)' : 'var(--surface-hover)') : 'transparent',
        color: hov ? (danger ? 'var(--coral)' : 'var(--sky)') : 'var(--t3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
      {children}
    </button>
  );
}

export default function MessageBubble({ message, isOwn, grouped, onReply }) {
  const { deleteMessage, editMessage, activeRoom } = useChatStore();
  const { user } = useAuthStore();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content)
      editMessage(message._id, editContent.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?'))
      deleteMessage(message._id, activeRoom._id);
  };

  return (
    <div
      className={isOwn ? 'anim-msg-own' : 'anim-msg-other'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowReactions(false); }}
      style={{
        display: 'flex',
        gap: 10,
        padding: grouped ? '2px 0' : '6px 0',
        borderRadius: 12,
        position: 'relative',
        paddingRight: 8,
        background: hovered ? 'rgba(255,255,255,0.015)' : 'transparent',
        transition: 'background 0.15s',
        marginTop: grouped ? -2 : 0,
      }}
    >
      {/* Avatar / time slot */}
      <div style={{ flexShrink: 0, width: 36, paddingTop: 2 }}>
        {!grouped ? (
          <Avatar user={message.sender} size={32} />
        ) : (
          <div style={{
            width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {hovered && (
              <span style={{
                fontSize: 9, color: 'var(--t4)',
                fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
              }}>
                {format(new Date(message.createdAt), 'HH:mm')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header */}
        {!grouped && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              {message.sender?.username}
            </span>
            <span style={{
              fontSize: 10, color: 'var(--t3)',
              fontFamily: 'var(--font-mono)',
            }}>
              {formatTime(message.createdAt)}
            </span>
            {message.edited && (
              <span style={{
                fontSize: 9, color: 'var(--t4)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                padding: '1px 5px',
                background: 'var(--surface)', borderRadius: 4,
              }}>edited</span>
            )}
          </div>
        )}

        {/* Reply reference */}
        {message.replyTo && (
          <div style={{
            display: 'flex', gap: 8, padding: '6px 10px 6px 6px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 9, marginBottom: 2,
            overflow: 'hidden', maxWidth: 480,
          }}>
            <div style={{
              width: 2.5, borderRadius: 99,
              background: 'linear-gradient(180deg, var(--sky), var(--plum))',
              flexShrink: 0,
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky)' }}>
                {message.replyTo.sender?.username}
              </span>
              <span style={{
                fontSize: 12, color: 'var(--t3)',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {message.replyTo.content?.slice(0, 80)}
              </span>
            </div>
          </div>
        )}

        {/* Message text or edit input */}
        {editing ? (
          <div style={{
            position: 'relative', maxWidth: 520,
            background: 'rgba(125,211,252,0.04)',
            border: '1px solid rgba(125,211,252,0.22)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5,
              background: 'linear-gradient(180deg, var(--sky), var(--plum))',
            }} />
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                if (e.key === 'Escape') setEditing(false);
              }}
              style={{
                width: '100%', background: 'transparent',
                color: 'var(--t1)', fontSize: 14,
                padding: '10px 12px 4px 16px',
                resize: 'none', lineHeight: 1.6,
                fontFamily: 'var(--font-sans)',
              }}
              autoFocus rows={2}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 12px 8px',
            }}>
              <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
                ↵ Save · Esc Cancel
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(false)} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'transparent', color: 'var(--t3)',
                  fontSize: 12, border: '1px solid var(--border)',
                }}>Cancel</button>
                <button onClick={handleEdit} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(125,211,252,0.12)',
                  color: 'var(--sky)', fontSize: 12,
                  border: '1px solid rgba(125,211,252,0.25)',
                }}>Save</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'inline-block',
            padding: '9px 13px',
            borderRadius: 14,
            borderBottomLeftRadius: !grouped && !isOwn ? 4 : 14,
            borderBottomRightRadius: !grouped && isOwn ? 4 : 14,
            maxWidth: '90%',
            position: 'relative',
            overflow: 'hidden',
            background: isOwn
              ? 'linear-gradient(135deg, rgba(125,211,252,0.11), rgba(192,132,252,0.13))'
              : 'rgba(255,255,255,0.04)',
            border: isOwn
              ? '1px solid rgba(125,211,252,0.2)'
              : '1px solid var(--border)',
            transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s',
            transform: hovered && isOwn ? 'translateY(-1px)' : 'none',
            boxShadow: hovered && isOwn ? '0 4px 16px rgba(125,211,252,0.1)' : 'none',
          }}>
            {isOwn && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(125,211,252,0.03), transparent)',
                pointerEvents: 'none',
              }} />
            )}
            <span style={{
              fontSize: 14, lineHeight: 1.65, color: 'var(--t1)',
              wordBreak: 'break-word', whiteSpace: 'pre-wrap',
              position: 'relative', zIndex: 1,
            }}>
              {message.content}
            </span>
          </div>
        )}
      </div>

      {/* Hover action toolbar */}
      {hovered && !editing && (
        <div style={{
          position: 'absolute', top: -4, right: 8,
          display: 'flex', gap: 2,
          background: 'rgba(8,8,20,0.96)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: 3,
          boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
          animation: 'fadeUp 0.2s var(--ease-spring) both',
        }}>
          {/* Reactions */}
          <div style={{ position: 'relative' }}>
            <ToolbarBtn title="React" onClick={() => setShowReactions(v => !v)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </ToolbarBtn>
            {showReactions && (
              <div style={{
                position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 4, padding: '8px 10px',
                background: 'rgba(8,8,20,0.98)',
                border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)', zIndex: 20,
                animation: 'fadeUp 0.2s var(--ease-spring) both',
              }}>
                {QUICK_REACTIONS.map(emoji => (
                  <button key={emoji} onClick={() => setShowReactions(false)} style={{
                    background: 'none', fontSize: 18, padding: '2px 3px', borderRadius: 6,
                    transition: 'transform 0.15s var(--ease-spring)',
                  }}>{emoji}</button>
                ))}
              </div>
            )}
          </div>

          <ToolbarBtn title="Reply" onClick={onReply}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
          </ToolbarBtn>

          {isOwn && (
            <>
              <ToolbarBtn title="Edit" onClick={() => setEditing(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </ToolbarBtn>
              <ToolbarBtn title="Delete" onClick={handleDelete} danger>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </ToolbarBtn>
            </>
          )}
        </div>
      )}
    </div>
  );
}
