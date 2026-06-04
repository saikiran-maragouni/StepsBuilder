const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getEntries,
  createEntry,
  getEntry,
  updateEntry,
  confirmEntry,
  correctEntry,
} = require('../controllers/journalController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEntries)
  .post(createEntry);

router.route('/:id')
  .get(getEntry)
  .put(updateEntry);          // ← Edit today's entry (day-locked)

router.patch('/:id/confirm', confirmEntry);
router.patch('/:id/correct', correctEntry);

module.exports = router;
