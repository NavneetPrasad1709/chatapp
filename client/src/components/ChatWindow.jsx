import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import { format, isToday, isYesterday } from 'date-fns';

let typingTimer = null;

function DateSeparator({ date }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      margin: '20px 0 12px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
      <div style={{
        padding: '4px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        fontSize: 10.5, color: 'var(--t3)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
        whiteSpace: 'nowrap',
      }}>{date}</div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
    </div>
  );
}

function TypingIndicator({ names }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 0',
      animation: 'fadeUp 0.3s var(--ease-out) both',
    }}>
      <div style={{
        display: 'flex', gap: 4, padding: '8px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14, borderBottomLeftRadius: 4,
        alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--sky)',
            animation: `waveTyping 1.4s ease-in-out ${i * 0.18}s infinite`,
            opacity: 0.7,
          }} />
        ))}
      </div>
      <span style={{
        fontSize: 11, color: 'var(--t3)',
        fontFamily: 'var(--font-mono)',
      }}>
        {names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing
      </span>
    </div>
  );
}

export default function ChatWindow({ isMobile, onMenuClick }) {
  const { activeRoom, messages, messagesLoading, sendMessage, startTyping, stopTyping, typingUsers, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  const roomId = activeRoom?._id;
  const roomMessages = messages[roomId] || [];
  const typing = (typingUsers[roomId] || []).filter(u => u !== user?.username);

  const isDM = activeRoom?.isDirect;
  const otherUser = isDM ? activeRoom.members?.find(m => m._id !== user?._id) : null;
  const roomName = isDM ? (otherUser?.username || 'Unknown') : activeRoom?.name;
  const otherOnline = otherUser && onlineUsers.includes(otherUser._id);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, typing.length]);

  useEffect(() => {
    setInput(''); setReplyTo(null); setAtBottom(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [roomId]);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const handleInput = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
    if (roomId) {
      startTyping(roomId);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => stopTyping(roomId), 1500);
    }
  };

  const handleSend = useCallback(() => {
    const content = input.trim();
    if (!content || !roomId) return;
    sendMessage(roomId, content, replyTo?._id || null);
    setInput('');
    setReplyTo(null);
    stopTyping(roomId);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    setAtBottom(true);
  }, [input, roomId, replyTo]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by date
  const groups = [];
  let lastDate = null;
  for (const msg of roomMessages) {
    const d = new Date(msg.createdAt);
    const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    if (label !== lastDate) { groups.push({ type: 'date', label }); lastDate = label; }
    const prev = groups[groups.length - 1];
    const grouped = prev?.type === 'message' && prev.message.sender?._id === msg.sender?._id &&
      new Date(msg.createdAt) - new Date(prev.message.createdAt) < 300000;
    groups.push({ type: 'message', message: msg, grouped });
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--ink-2) 0%, var(--ink) 100%)',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 64,
        background: 'rgba(10,10,15,0.85)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Subtle top glow */}
        <div style={{
          position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
          width: 240, height: 80,
          background: 'radial-gradient(ellipse, rgba(125,211,252,0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          {/* Mobile menu button */}
          {isMobile && (
            <button onClick={onMenuClick} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--t2)', marginRight: 4,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}

          {isDM && otherUser ? (
            <Avatar user={otherUser} size={38} showOnline onlineUsers={onlineUsers} ring />
          ) : (
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, rgba(125,211,252,0.08), rgba(192,132,252,0.08))',
              border: '1px solid rgba(125,211,252,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--sky)',
              }}>#</span>
            </div>
          )}

          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.01em' }}>
              {roomName}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'var(--t3)',
              fontFamily: 'var(--font-mono)', marginTop: 2,
            }}>
              {isDM ? (
                <>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: otherOnline ? 'var(--mint)' : 'var(--t4)',
                    boxShadow: otherOnline ? '0 0 6px var(--mint)' : 'none',
                    animation: otherOnline ? 'pulseDot 2s infinite' : 'none',
                  }} />
                  {otherOnline ? 'Online' : 'Offline'}
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--sky)' }}>{activeRoom?.members?.length}</span> members · live
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          {!isMobile && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky)', fontFamily: 'var(--font-mono)' }}>
                {roomMessages.length}
              </div>
              <div style={{ fontSize: 9, color: 'var(--t4)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                MESSAGES
              </div>
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px',
            background: 'rgba(110,231,183,0.07)',
            border: '1px solid rgba(110,231,183,0.2)',
            borderRadius: 99,
            fontSize: 9, fontWeight: 700,
            color: 'var(--mint)',
            letterSpacing: '0.15em',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--mint)',
              animation: 'pulseDot 1.5s infinite',
              boxShadow: '0 0 6px var(--mint)',
            }} />
            LIVE
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto',
          position: 'relative',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Top fade */}
        <div style={{
          position: 'sticky', top: 0, left: 0, right: 0, height: 32,
          background: 'linear-gradient(var(--ink-2), transparent)',
          zIndex: 5, pointerEvents: 'none',
        }} />

        {messagesLoading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', gap: 16,
          }}>
            <div style={{
              width: 32, height: 32,
              border: '2px solid rgba(125,211,252,0.15)',
              borderTopColor: 'var(--sky)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              boxShadow: '0 0 20px rgba(125,211,252,0.1)',
            }} />
            <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
              Loading messages...
            </span>
          </div>
        ) : roomMessages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '70%', padding: '40px 24px',
            textAlign: 'center', gap: 16,
          }}>
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.04), transparent 70%)', pointerEvents: 'none' }} />
            {isDM && otherUser ? (
              <Avatar user={otherUser} size={72} ring />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(125,211,252,0.07), rgba(192,132,252,0.07))',
                border: '1px solid rgba(125,211,252,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 800, color: 'var(--sky)',
              }}>#</div>
            )}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                {isDM ? `Start chatting with ${roomName}` : `Welcome to #${roomName}`}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.75, maxWidth: 300 }}>
                {isDM ? 'Send a message to kick off the conversation.' : `This is the very beginning of #${roomName}. Say hello!`}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 20px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {groups.map((item, i) =>
              item.type === 'date' ? (
                <DateSeparator key={`d-${i}`} date={item.label} />
              ) : (
                <MessageBubble
                  key={item.message._id}
                  message={item.message}
                  isOwn={item.message.sender?._id === user?._id}
                  grouped={item.grouped}
                  onReply={() => setReplyTo(item.message)}
                />
              )
            )}
            {typing.length > 0 && <TypingIndicator names={typing} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!atBottom && (
        <button
          onClick={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setAtBottom(true); }}
          style={{
            position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'rgba(10,10,20,0.95)',
            border: '1px solid rgba(125,211,252,0.25)',
            borderRadius: 99, color: 'var(--sky)', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.3s var(--ease-spring) both',
            zIndex: 10,
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}/>
          </svg>
          New messages
        </button>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
          background: 'rgba(125,211,252,0.03)',
          borderTop: '1px solid rgba(125,211,252,0.1)',
          flexShrink: 0,
          animation: 'fadeUp 0.25s var(--ease-spring) both',
        }}>
          <div style={{
            width: 2.5, height: 34,
            background: 'linear-gradient(180deg, var(--sky), var(--plum))',
            borderRadius: 99, flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>
              Replying to <span style={{ color: 'var(--sky)' }}>{replyTo.sender?.username}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {replyTo.content?.slice(0, 80)}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', color: 'var(--t3)', padding: 4, borderRadius: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: `${isMobile ? '10px' : '12px'} ${isMobile ? '12px' : '20px'} ${isMobile ? '16px' : '18px'}`,
        background: 'rgba(8,8,16,0.85)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'rgba(255,255,255,0.025)',
          border: `1px solid ${inputFocused ? 'rgba(125,211,252,0.3)' : 'var(--border)'}`,
          borderRadius: 16, padding: '8px 8px 8px 12px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: inputFocused ? '0 0 0 3px rgba(125,211,252,0.07)' : 'none',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Input glow */}
          {inputFocused && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(125,211,252,0.02), transparent)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Avatar */}
          <div style={{ flexShrink: 0, paddingBottom: 2 }}>
            <Avatar user={user} size={28} />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            style={{
              flex: 1, background: 'transparent',
              color: 'var(--t1)', fontSize: 14, lineHeight: 1.6,
              resize: 'none', padding: '6px 4px',
              maxHeight: 140, fontWeight: 400,
              fontFamily: 'var(--font-sans)',
            }}
            placeholder={`Message ${isDM ? roomName : '#' + roomName}…`}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            rows={1}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              background: input.trim() ? 'transparent' : 'rgba(255,255,255,0.04)',
              border: input.trim() ? 'none' : '1px solid var(--border)',
              color: input.trim() ? '#fff' : 'var(--t3)',
              transition: 'all 0.2s var(--ease-spring)',
              transform: input.trim() ? 'scale(1.05)' : 'scale(1)',
              boxShadow: input.trim() ? '0 4px 16px rgba(125,211,252,0.3)' : 'none',
              flexShrink: 0,
            }}>
            {input.trim() && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #7dd3fc, #c084fc)',
              }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Input footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 7, padding: '0 4px',
        }}>
          <span style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            ↵ send · ⇧↵ newline
          </span>
          {typing.length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--sky)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
              {typing[0]} is typing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
