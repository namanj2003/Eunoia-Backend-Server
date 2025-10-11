const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getChatSessions,
  getChatSession,
  createChatSession,
  addChatMessage,
  updateChatSession,
  deleteChatSession,
  getChatMessages
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Validation rules
const chatMessageValidation = [
  body('role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be user, assistant, or system'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes are protected
router.use(protect);

// Session routes
router.route('/sessions')
  .get(getChatSessions)
  .post(createChatSession);

router.route('/sessions/:sessionId')
  .get(getChatSession)
  .put(updateChatSession)
  .delete(deleteChatSession);

// Message routes
router.route('/sessions/:sessionId/messages')
  .get(getChatMessages)
  .post(chatMessageValidation, addChatMessage);

module.exports = router;
