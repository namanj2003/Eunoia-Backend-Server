const express = require('express');
const router = express.Router();
const WellnessCheck = require('../models/WellnessCheck');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { mood, analysis, answers } = req.body;

    if (!mood || !analysis) {
      return res.status(400).json({
        success: false,
        message: 'Mood and analysis are required'
      });
    }

    // Check if already completed today
    const todayCheck = await WellnessCheck.getTodayCheck(req.user._id);
    if (todayCheck) {
      return res.status(400).json({
        success: false,
        message: 'Wellness check already completed today',
        data: todayCheck
      });
    }

    const wellnessCheck = await WellnessCheck.create({
      userId: req.user._id,
      mood,
      analysis,
      answers: answers || {}
    });

    res.status(201).json({
      success: true,
      message: 'Wellness check saved successfully',
      data: wellnessCheck
    });
  } catch (error) {
    console.error('Error creating wellness check:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/today', protect, async (req, res) => {
  try {
    const todayCheck = await WellnessCheck.getTodayCheck(req.user._id);
    
    res.json({
      success: true,
      data: todayCheck
    });
  } catch (error) {
    console.error('Error fetching today\'s wellness check:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/streak', protect, async (req, res) => {
  try {
    const streak = await WellnessCheck.getStreak(req.user._id);
    
    res.json({
      success: true,
      data: { streak }
    });
  } catch (error) {
    console.error('Error fetching wellness streak:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const { limit = 30, skip = 0 } = req.query;
    
    const checks = await WellnessCheck.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    console.error('Error fetching wellness history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
