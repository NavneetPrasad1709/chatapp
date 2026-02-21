import { create } from 'zustand';
import { io } from 'socket.io-client';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api`;
let socket = null;

export const useChatStore = create((set, get) => ({
  socket: null,
  rooms: [],
  activeRoom: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  loading: false,
  messagesLoading: false,

  initSocket: (token) => {
    if (socket?.connected) return;
    socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ socket });
    });

    socket.on('message:new', (message) => {
      const { messages, rooms } = get();
      const roomId = message.room;
      set({
        messages: {
          ...messages,
          [roomId]: [...(messages[roomId] || []), message],
        },
        rooms: rooms.map(r =>
          r._id === roomId
            ? { ...r, lastMessage: { content: message.content, sender: message.sender.username, createdAt: message.createdAt } }
            : r
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      });
    });

    socket.on('message:edited', (message) => {
      const { messages } = get();
      const roomId = message.room;
      if (messages[roomId]) {
        set({
          messages: {
            ...messages,
            [roomId]: messages[roomId].map(m => m._id === message._id ? message : m),
          },
        });
      }
    });

    socket.on('message:deleted', ({ messageId, roomId }) => {
      const { messages } = get();
      if (messages[roomId]) {
        set({
          messages: {
            ...messages,
            [roomId]: messages[roomId].filter(m => m._id !== messageId),
          },
        });
      }
    });

    socket.on('typing:start', ({ roomId, user }) => {
      const { typingUsers } = get();
      set({
        typingUsers: {
          ...typingUsers,
          [roomId]: [...new Set([...(typingUsers[roomId] || []), user.username])],
        },
      });
    });

    socket.on('typing:stop', ({ roomId, userId }) => {
      const { typingUsers, rooms } = get();
      const room = rooms.find(r => r._id === roomId);
      const user = room?.members?.find(m => m._id === userId);
      if (user && typingUsers[roomId]) {
        set({
          typingUsers: {
            ...typingUsers,
            [roomId]: typingUsers[roomId].filter(u => u !== user.username),
          },
        });
      }
    });

    socket.on('users:online', (userIds) => set({ onlineUsers: userIds }));
    socket.on('user:online', (userId) => {
      const { onlineUsers } = get();
      if (!onlineUsers.includes(userId)) set({ onlineUsers: [...onlineUsers, userId] });
    });
    socket.on('user:offline', (userId) => {
      set({ onlineUsers: get().onlineUsers.filter(id => id !== userId) });
    });

    socket.on('disconnect', () => set({ socket: null }));
    set({ socket });
  },

  disconnectSocket: () => {
    if (socket) { socket.disconnect(); socket = null; }
    set({ socket: null, rooms: [], messages: {}, onlineUsers: [] });
  },

  fetchRooms: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${API}/rooms`);
      set({ rooms: data, loading: false });
    } catch { set({ loading: false }); }
  },

  setActiveRoom: async (room) => {
    set({ activeRoom: room, messagesLoading: true });
    if (socket) socket.emit('room:join', room._id);
    try {
      const { data } = await axios.get(`${API}/messages/${room._id}`);
      set(state => ({
        messages: { ...state.messages, [room._id]: data },
        messagesLoading: false,
      }));
      if (socket) socket.emit('messages:read', { roomId: room._id });
    } catch { set({ messagesLoading: false }); }
  },

  sendMessage: (roomId, content, replyTo = null) => {
    if (socket) socket.emit('message:send', { roomId, content, replyTo });
  },

  editMessage: (messageId, content) => {
    if (socket) socket.emit('message:edit', { messageId, content });
  },

  deleteMessage: (messageId, roomId) => {
    if (socket) socket.emit('message:delete', { messageId, roomId });
  },

  startTyping: (roomId) => {
    if (socket) socket.emit('typing:start', { roomId });
  },

  stopTyping: (roomId) => {
    if (socket) socket.emit('typing:stop', { roomId });
  },

  createRoom: async (name, description, isPrivate, memberIds) => {
    const { data } = await axios.post(`${API}/rooms`, { name, description, isPrivate, memberIds });
    set(state => ({ rooms: [data, ...state.rooms] }));
    if (socket) socket.emit('room:join', data._id);
    return data;
  },

  createDM: async (targetUserId) => {
    const { data } = await axios.post(`${API}/rooms/dm`, { targetUserId });
    set(state => ({
      rooms: state.rooms.find(r => r._id === data._id)
        ? state.rooms
        : [data, ...state.rooms],
    }));
    if (socket) socket.emit('room:join', data._id);
    return data;
  },

  searchUsers: async (q) => {
    const { data } = await axios.get(`${API}/users/search?q=${q}`);
    return data;
  },
}));
