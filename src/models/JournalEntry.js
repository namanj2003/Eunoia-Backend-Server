const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    set: encrypt, // Encrypt on save
    get: decrypt  // Decrypt on read
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    set: encrypt, // Encrypt on save
    get: decrypt  // Decrypt on read
  },
  mood: {
    type: String,
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  mlAnalysis: {
    primary_emotion: String,
    emotion_confidence: Number,
    detected_emotions: [{
      emotion: String,
      score: Number
    }],
    emotional_state_summary: String,
    tags: [String],
    timestamp: String
  },
  keystrokeData: {
    total_keystrokes: Number,
    typing_duration: Number,
    avg_wpm: Number,
    pause_count: Number,
    error_rate: Number,
    mental_state: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Enable getters when converting to JSON
  toObject: { getters: true } // Enable getters when converting to object
});

// Index for faster queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
