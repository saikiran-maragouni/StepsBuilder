const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { checkGoalLimit } = require('../middleware/planMiddleware');
const {
  getGoals,
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
} = require('../controllers/goalController');

const router = express.Router();

// All goal routes require authentication
router.use(protect);

router.route('/')
  .get(getGoals)
  .post(checkGoalLimit, createGoal);  // checkGoalLimit enforces 3-goal free tier cap

router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

router.patch('/:id/status', updateGoalStatus);

module.exports = router;
