const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// Validation rules
const journalEntryValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes are protected
router.use(protect);

// Search route (must be before /:id route)
router.get('/search', searchJournalEntries);

// CRUD routes
router.route('/')
  .get(getJournalEntries)
  .post(journalEntryValidation, createJournalEntry);

router.route('/:id')
  .get(getJournalEntry)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

module.exports = router;
