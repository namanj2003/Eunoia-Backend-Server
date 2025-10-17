const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const wellnessCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  analysis: {
    type: String,
    required: true,
    set: (value) => encrypt(value), // Encrypt before saving
    get: (value) => decrypt(value)  // Decrypt when retrieving
  },
  answers: {
    type: Map,
    of: String
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Enable getters for JSON serialization
  toObject: { getters: true } // Enable getters for object conversion
});

// Index for efficient queries
wellnessCheckSchema.index({ userId: 1, completedAt: -1 });

// Encrypt answers Map before saving
wellnessCheckSchema.pre('save', function(next) {
  if (this.answers && this.answers.size > 0) {
    const encryptedAnswers = new Map();
    for (const [key, value] of this.answers.entries()) {
      encryptedAnswers.set(key, encrypt(value));
    }
    this.answers = encryptedAnswers;
  }
  next();
});

// Decrypt answers Map after retrieving
wellnessCheckSchema.post('find', function(docs) {
  docs.forEach(doc => {
    if (doc.answers && doc.answers.size > 0) {
      const decryptedAnswers = new Map();
      for (const [key, value] of doc.answers.entries()) {
        try {
          decryptedAnswers.set(key, decrypt(value));
        } catch (error) {
          console.error('Error decrypting answer:', error);
          decryptedAnswers.set(key, value); // Keep encrypted if decryption fails
        }
      }
      doc.answers = decryptedAnswers;
    }
  });
});

wellnessCheckSchema.post('findOne', function(doc) {
  if (doc && doc.answers && doc.answers.size > 0) {
    const decryptedAnswers = new Map();
    for (const [key, value] of doc.answers.entries()) {
      try {
        decryptedAnswers.set(key, decrypt(value));
      } catch (error) {
        console.error('Error decrypting answer:', error);
        decryptedAnswers.set(key, value);
      }
    }
    doc.answers = decryptedAnswers;
  }
});

// Get today's wellness check for a user
wellnessCheckSchema.statics.getTodayCheck = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findOne({
    userId,
    completedAt: { $gte: today, $lt: tomorrow }
  });
};

// Get wellness streak
wellnessCheckSchema.statics.getStreak = async function(userId) {
  const checks = await this.find({ userId })
    .sort({ completedAt: -1 })
    .select('completedAt')
    .lean();
  
  if (checks.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  for (const check of checks) {
    const completedDate = new Date(check.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((checkDate - completedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (daysDiff === 1) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('WellnessCheck', wellnessCheckSchema);
