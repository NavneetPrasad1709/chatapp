const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all rooms the user is part of
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', '-password')
      .populate('createdBy', '-password')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate, memberIds } = req.body;
    const members = [...new Set([req.user._id.toString(), ...(memberIds || [])])];
    const room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members,
      admins: [req.user._id],
    });

    // Update users' rooms array
    await User.updateMany({ _id: { $in: members } }, { $addToSet: { rooms: room._id } });
    await room.populate('members', '-password');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create DM room
router.post('/dm', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    // Check if DM already exists
    const existing = await Room.findOne({
      isDirect: true,
      members: { $all: [req.user._id, targetUserId], $size: 2 },
    }).populate('members', '-password');
    if (existing) return res.json(existing);

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const room = await Room.create({
      name: `${req.user.username}-${targetUser.username}`,
      isDirect: true,
      isPrivate: true,
      createdBy: req.user._id,
      members: [req.user._id, targetUserId],
      admins: [req.user._id],
    });

    await User.updateMany(
      { _id: { $in: [req.user._id, targetUserId] } },
      { $addToSet: { rooms: room._id } }
    );
    await room.populate('members', '-password');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join room
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.isPrivate) return res.status(403).json({ message: 'Room is private' });
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { rooms: room._id } });
    }
    await room.populate('members', '-password');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get public rooms
router.get('/public/list', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false, isDirect: false })
      .populate('members', '-password')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', '-password')
      .populate('createdBy', '-password');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
