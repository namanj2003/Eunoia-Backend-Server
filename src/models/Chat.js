const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    set: encrypt, // Encrypt on save
    get: decrypt  // Decrypt on read
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Enable getters when converting to JSON
  toObject: { getters: true } // Enable getters when converting to object
});

// Compound index for efficient querying
chatMessageSchema.index({ userId: 1, sessionId: 1, timestamp: 1 });

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat',
    set: encrypt, // Encrypt on save
    get: decrypt  // Decrypt on read
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Enable getters when converting to JSON
  toObject: { getters: true } // Enable getters when converting to object
});

// Index for faster queries
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = { ChatMessage, ChatSession };
