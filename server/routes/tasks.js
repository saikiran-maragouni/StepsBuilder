const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  getTodayTasks,
  generateTasks,
  updateTask,
  completeTask,
  skipTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/today', getTodayTasks);
router.post('/generate', generateTasks);

router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

router.patch('/:id/complete', completeTask);
router.patch('/:id/skip', skipTask);

module.exports = router;
