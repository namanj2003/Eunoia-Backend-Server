const JournalEntry = require('../models/JournalEntry');
const { validationResult } = require('express-validator');
const { analyzeJournalEntry, batchAnalyzeEntries } = require('../services/mlService');

// @desc    Get all journal entries for logged in user
// @route   GET /api/journal
// @access  Private
const getJournalEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const entries = await JournalEntry.find({ userId: req.user._id })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await JournalEntry.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: entries,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
// @access  Private
const getJournalEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, content, mood, tags, isPrivate, keystrokeData } = req.body;

    console.log('=== Creating Journal Entry ===');
    console.log('Title:', title);
    console.log('Content preview:', content?.substring(0, 50) + '...');
    console.log('Mood from frontend:', mood);
    console.log('Tags from frontend:', tags);

    // Perform ML analysis on the journal entry (optional, non-blocking)
    let mlAnalysis = null;
    let detectedEmotion = mood; // Use mood from frontend as fallback
    
    try {
      console.log('Calling ML service...');
      const analysisResult = await analyzeJournalEntry(title, content);
      console.log('ML service response:', analysisResult);
      
      if (analysisResult.success) {
        mlAnalysis = analysisResult.analysis;
        detectedEmotion = mlAnalysis.primary_emotion; // Use ML-detected emotion
        console.log('✅ ML Analysis completed successfully!');
        console.log('   Primary emotion:', mlAnalysis.primary_emotion);
        console.log('   Confidence:', mlAnalysis.emotion_confidence);
        console.log('   Generated tags:', mlAnalysis.tags);
      } else {
        console.log('❌ ML analysis returned success=false');
      }
    } catch (mlError) {
      // Log ML error but don't fail the journal creation
      console.warn('❌ ML analysis failed with exception:', mlError.message);
      console.warn('   Stack:', mlError.stack);
    }

    console.log('Final mood being saved:', detectedEmotion);
    console.log('Final tags being saved:', mlAnalysis ? mlAnalysis.tags : tags);

    const entry = await JournalEntry.create({
      userId: req.user._id,
      title,
      content,
      mood: detectedEmotion, // Use ML-detected emotion or fallback
      tags: mlAnalysis ? mlAnalysis.tags : (tags || []), // Use ML-generated tags if available
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      mlAnalysis, // Store complete ML analysis result
      keystrokeData // Store keystroke dynamics data
    });

    res.status(201).json({
      success: true,
      data: entry,
      mlAnalysis // Return ML analysis to frontend for immediate display
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Private
const updateJournalEntry = async (req, res) => {
  try {
    let entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    const { title, content, mood, tags, isPrivate } = req.body;

    entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      {
        title: title || entry.title,
        content: content || entry.content,
        mood: mood || entry.mood,
        tags: tags !== undefined ? tags : entry.tags,
        isPrivate: isPrivate !== undefined ? isPrivate : entry.isPrivate,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
const deleteJournalEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search journal entries
// @route   GET /api/journal/search
// @access  Private
const searchJournalEntries = async (req, res) => {
  try {
    const { query, mood, startDate, endDate } = req.query;

    let searchQuery = { userId: req.user._id };

    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by mood
    if (mood) {
      searchQuery.mood = mood;
    }

    // Filter by date range
    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    const entries = await JournalEntry.find(searchQuery)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: entries,
      count: entries.length
    });
  } catch (error) {
    console.error('Search journal entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries
};
