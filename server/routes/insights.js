const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getWeeklySummary, getGoalInsights } = require('../controllers/insightsController');

const router = express.Router();

router.use(protect);

router.get('/weekly', getWeeklySummary);
router.get('/goal/:id', getGoalInsights);

module.exports = router;
