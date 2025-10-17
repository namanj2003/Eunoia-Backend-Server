const JournalEntry = require('../models/JournalEntry');
const { validationResult } = require('express-validator');

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

    const { title, content, mood, tags, isPrivate, keystrokeData, mlAnalysis } = req.body;

    console.log('=== Creating Journal Entry ===');
    console.log('Title:', title);
    console.log('Content preview:', content?.substring(0, 50) + '...');
    console.log('Mood from frontend:', mood);
    console.log('Tags from frontend:', tags);
    console.log('ML Analysis from frontend:', mlAnalysis ? 'Present' : 'Not present');
    if (mlAnalysis) {
      console.log('ML Analysis structure:', JSON.stringify(mlAnalysis, null, 2));
      console.log('ML Analysis keys:', Object.keys(mlAnalysis));
      console.log('Primary emotion:', mlAnalysis.primary_emotion);
    }

    const entry = await JournalEntry.create({
      userId: req.user._id,
      title,
      content,
      mood, // Use mood from frontend
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      mlAnalysis, // Store ML analysis received from frontend
      keystrokeData // Store keystroke dynamics data
    });

    console.log('Entry saved to database:', {
      _id: entry._id,
      mood: entry.mood,
      hasMlAnalysis: !!entry.mlAnalysis,
      mlAnalysisKeys: entry.mlAnalysis ? Object.keys(entry.mlAnalysis) : []
    });

    res.status(201).json({
      success: true,
      data: entry
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
