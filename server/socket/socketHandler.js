const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Mark user online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('user:online', userId);
    io.emit('users:online', Array.from(onlineUsers.keys()));

    console.log(`🟢 ${socket.user.username} connected`);

    // Join user's rooms
    const user = await User.findById(userId).populate('rooms');
    if (user?.rooms) {
      user.rooms.forEach(room => socket.join(room._id.toString()));
    }

    // Join a specific room
    socket.on('room:join', async (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user:joined', { roomId, user: socket.user });
    });

    // Leave a room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user:left', { roomId, userId });
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { roomId, content, replyTo } = data;
        const room = await Room.findById(roomId);
        if (!room || !room.members.map(m => m.toString()).includes(userId)) return;

        const message = await Message.create({
          room: roomId,
          sender: userId,
          content: content.trim(),
          replyTo: replyTo || null,
          readBy: [userId],
        });
        await message.populate('sender', '-password');
        if (replyTo) await message.populate('replyTo');

        // Update room last message
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: { content, sender: socket.user.username, createdAt: new Date() },
        });

        io.to(roomId).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', { roomId, user: socket.user });
    });
    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { roomId, userId });
    });

    // Mark messages as read
    socket.on('messages:read', async ({ roomId }) => {
      await Message.updateMany(
        { room: roomId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      io.to(roomId).emit('messages:read', { roomId, userId });
    });

    // Edit message
    socket.on('message:edit', async ({ messageId, content }) => {
      try {
        const message = await Message.findOneAndUpdate(
          { _id: messageId, sender: userId },
          { content, edited: true, editedAt: new Date() },
          { new: true }
        ).populate('sender', '-password');
        if (message) io.to(message.room.toString()).emit('message:edited', message);
      } catch (err) {}
    });

    // Delete message
    socket.on('message:delete', async ({ messageId, roomId }) => {
      try {
        await Message.findOneAndDelete({ _id: messageId, sender: userId });
        io.to(roomId).emit('message:deleted', { messageId, roomId });
      } catch (err) {}
    });

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:offline', userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`🔴 ${socket.user.username} disconnected`);
    });
  });
};

module.exports = { socketHandler };
