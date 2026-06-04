const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getNudges, markRead, dismissNudge } = require('../controllers/nudgeController');

const router = express.Router();

router.use(protect);

router.get('/', getNudges);
router.patch('/:id/read', markRead);
router.patch('/:id/dismiss', dismissNudge);

module.exports = router;
