const { ChatMessage, ChatSession } = require('../models/Chat');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Generate unique session ID
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// @desc    Get all chat sessions for logged in user
// @route   GET /api/chat/sessions
// @access  Private
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user._id,
      isActive: true
    })
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single chat session with messages
// @route   GET /api/chat/sessions/:sessionId
// @access  Private
const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const messages = await ChatMessage.find({
      sessionId,
      userId: req.user._id
    }).sort({ timestamp: 1 });

    res.json({
      success: true,
      data: {
        session,
        messages
      }
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new chat session
// @route   POST /api/chat/sessions
// @access  Private
const createChatSession = async (req, res) => {
  try {
    const { title } = req.body;
    const sessionId = generateSessionId();

    const session = await ChatSession.create({
      userId: req.user._id,
      sessionId,
      title: title || 'New Chat'
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add message to chat session
// @route   POST /api/chat/sessions/:sessionId/messages
// @access  Private
const addChatMessage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { role, content } = req.body;

    // Verify session exists and belongs to user
    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Create message
    const message = await ChatMessage.create({
      userId: req.user._id,
      sessionId,
      role,
      content
    });

    // Update session's last message time
    session.lastMessageAt = Date.now();
    await session.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Add chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update chat session title
// @route   PUT /api/chat/sessions/:sessionId
// @access  Private
const updateChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = await ChatSession.findOneAndUpdate(
      {
        sessionId,
        userId: req.user._id
      },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete chat session
// @route   DELETE /api/chat/sessions/:sessionId
// @access  Private
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Soft delete - mark as inactive
    session.isActive = false;
    await session.save();

    // Optionally, you can also delete all messages
    // await ChatMessage.deleteMany({ sessionId, userId: req.user._id });

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages for a session
// @route   GET /api/chat/sessions/:sessionId/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    let query = {
      sessionId,
      userId: req.user._id
    };

    // For pagination - get messages before a certain timestamp
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getChatSessions,
  getChatSession,
  createChatSession,
  addChatMessage,
  updateChatSession,
  deleteChatSession,
  getChatMessages
};
