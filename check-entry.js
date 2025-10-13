// Quick script to check latest journal entry in database
require('dotenv').config();
const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: String,
  content: String,
  mood: String,
  tags: [String],
  mlAnalysis: {
    primary_emotion: String,
    emotion_confidence: Number,
    detected_emotions: [{ emotion: String, score: Number }],
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
  isPrivate: Boolean,
  createdAt: Date
}, { timestamps: true });

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

async function checkLatestEntry() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const latestEntry = await JournalEntry.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestEntry) {
      console.log('❌ No journal entries found');
      process.exit(0);
    }

    console.log('📝 LATEST JOURNAL ENTRY:');
    console.log('========================');
    console.log('Title:', latestEntry.title);
    console.log('Content:', latestEntry.content?.substring(0, 100) + '...');
    console.log('Mood:', latestEntry.mood);
    console.log('Tags:', latestEntry.tags);
    console.log('Created:', latestEntry.createdAt);
    console.log('\n🤖 ML ANALYSIS:');
    console.log('================');
    
    if (latestEntry.mlAnalysis) {
      console.log('✅ ML Analysis EXISTS!');
      console.log('   Primary Emotion:', latestEntry.mlAnalysis.primary_emotion);
      console.log('   Confidence:', latestEntry.mlAnalysis.emotion_confidence);
      console.log('   ML Tags:', latestEntry.mlAnalysis.tags);
      console.log('   Detected Emotions:', latestEntry.mlAnalysis.detected_emotions?.length || 0);
    } else {
      console.log('❌ ML Analysis is NULL');
      console.log('   This means ML service was not called or failed');
    }

    console.log('\n⌨️ KEYSTROKE DATA:');
    console.log('==================');
    
    if (latestEntry.keystrokeData) {
      console.log('✅ Keystroke Data EXISTS!');
      console.log('   Total Keystrokes:', latestEntry.keystrokeData.total_keystrokes);
      console.log('   WPM:', latestEntry.keystrokeData.avg_wpm);
      console.log('   Pauses:', latestEntry.keystrokeData.pause_count);
      console.log('   Error Rate:', latestEntry.keystrokeData.error_rate + '%');
    } else {
      console.log('❌ Keystroke Data is NULL');
      console.log('   This means frontend is not sending keystroke data');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLatestEntry();
