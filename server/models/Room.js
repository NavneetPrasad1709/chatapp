const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 500 },
  isPrivate: { type: Boolean, default: false },
  isDirect: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: {
    content: String,
    sender: String,
    createdAt: Date,
  },
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
