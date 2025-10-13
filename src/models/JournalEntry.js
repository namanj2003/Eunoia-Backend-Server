const mongoose = require('mongoose');

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
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  mood: {
    type: String,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'anxious', 'calm', 'stressed'],
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
    timestamp: Date
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
  timestamps: true
});

// Index for faster queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
