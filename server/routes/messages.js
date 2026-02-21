const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const router = express.Router();

// Get messages for a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.members.includes(req.user._id)) return res.status(403).json({ message: 'Not a member' });

    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', '-password')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// React to a message
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const reactionIdx = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIdx > -1) {
      const userIdx = message.reactions[reactionIdx].users.indexOf(req.user._id);
      if (userIdx > -1) {
        message.reactions[reactionIdx].users.splice(userIdx, 1);
        if (message.reactions[reactionIdx].users.length === 0)
          message.reactions.splice(reactionIdx, 1);
      } else {
        message.reactions[reactionIdx].users.push(req.user._id);
      }
    } else {
      message.reactions.push({ emoji, users: [req.user._id] });
    }
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
