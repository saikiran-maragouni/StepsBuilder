/**
 * taskController.js
 *
 * Handles all task operations:
 * - Manual task CRUD
 * - AI daily task generation (Gemini Call 2)
 * - Complete/Skip with automatic roadmap step progress check
 */

const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const { generateDailyTasks } = require('../services/geminiService');
const { cacheDel } = require('../config/redis');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build start/end of today in UTC for date-range queries
// ─────────────────────────────────────────────────────────────────────────────
const getTodayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: after a task is completed, check if its parent roadmap step
// should be automatically advanced to 'completed'.
// Rule: if ALL tasks linked to a step are completed → mark step completed.
// ─────────────────────────────────────────────────────────────────────────────
const checkAndAdvanceStep = async (task) => {
  if (!task.stepId || !task.goalId) return;

  try {
    // Count pending tasks still linked to this step
    const pendingCount = await Task.countDocuments({
      userId: task.userId,
      goalId: task.goalId,
      stepId: task.stepId,
      status: 'pending',
    });

    // Count all tasks linked to this step (excluding skipped)
    const totalCount = await Task.countDocuments({
      userId: task.userId,
      goalId: task.goalId,
      stepId: task.stepId,
      status: { $ne: 'skipped' },
    });

    // Only auto-advance if there are tasks for this step and none pending
    if (totalCount > 0 && pendingCount === 0) {
      const roadmap = await Roadmap.findOne({ goalId: task.goalId });
      if (!roadmap) return;

      for (const phase of roadmap.phases) {
        const step = phase.steps.id(task.stepId);
        if (step && step.status !== 'completed') {
          step.status = 'completed';
          step.completedAt = new Date();
          if (!step.startedAt) step.startedAt = new Date();
          await roadmap.save();

          // Bust roadmap cache
          await cacheDel(`roadmap:${task.goalId}`);

          // Update goal momentum score
          const completedSteps = roadmap.phases.reduce(
            (acc, p) => acc + p.steps.filter((s) => s.status === 'completed').length,
            0
          );
          const totalSteps = roadmap.phases.reduce((acc, p) => acc + p.steps.length, 0);
          const progressScore = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 80) : 0;
          const recentBonus = Math.min(5, 20); // 1 step recently = +5 bonus
          await Goal.findByIdAndUpdate(task.goalId, {
            momentumScore: Math.min(100, progressScore + recentBonus),
          });

          console.log(`🎯 Step "${step.title}" auto-advanced to completed`);
          break;
        }
      }
    }
  } catch (err) {
    // Non-fatal — don't let this break the task completion response
    console.error('checkAndAdvanceStep error:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/tasks
// @desc    Get all tasks with optional filters: ?date=today&goalId=xxx&status=pending
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { goalId, status, date } = req.query;
    const filter = { userId: req.user._id };

    if (goalId) filter.goalId = goalId;
    if (status) filter.status = status;
    if (date === 'today') {
      const { start, end } = getTodayRange();
      filter.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter)
      .sort({ priority: 1, createdAt: -1 }) // high → medium → low
      .populate('goalId', 'title category');

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/tasks/today
// @desc    Get today's tasks across all goals, sorted by priority
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getTodayTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const tasks = await Task.find({
      userId: req.user._id,
      dueDate: { $gte: start, $lte: end },
    })
      .sort({ priority: 1, createdAt: 1 })
      .populate('goalId', 'title category momentumScore');

    // Group by goal for easier frontend rendering
    const grouped = {};
    tasks.forEach((task) => {
      const gId = task.goalId?._id?.toString() || 'unlinked';
      if (!grouped[gId]) {
        grouped[gId] = {
          goal: task.goalId,
          tasks: [],
        };
      }
      grouped[gId].tasks.push(task);
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      grouped: Object.values(grouped),
    });
  } catch (error) {
    console.error('getTodayTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching today\'s tasks.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/tasks/generate
// @desc    AI generates today's tasks from active goal roadmaps (Gemini Call 2)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const generateTasks = async (req, res) => {
  try {
    const { hoursAvailable } = req.body;
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

    // 1. Gather all active goals with their current roadmap step
    const activeGoals = await Goal.find({ userId: req.user._id, status: 'active' });
    if (activeGoals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active goals found. Create a goal first.',
      });
    }

    // 2. For each goal, find the first in-progress or not-started step
    const goalPayloads = [];
    for (const goal of activeGoals) {
      const roadmap = await Roadmap.findOne({ goalId: goal._id });
      if (!roadmap) continue;

      let currentStep = null;
      for (const phase of roadmap.phases) {
        const inProgress = phase.steps.find((s) => s.status === 'in-progress');
        const notStarted = phase.steps.find((s) => s.status === 'not-started');
        currentStep = inProgress || notStarted;
        if (currentStep) break;
      }

      goalPayloads.push({
        goalId: goal._id.toString(),
        title: goal.title,
        category: goal.category,
        momentumScore: goal.momentumScore,
        currentStep: currentStep
          ? { id: currentStep._id.toString(), title: currentStep.title, description: currentStep.description }
          : null,
      });
    }

    // 3. Get yesterday's completed tasks for context
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);

    const yesterdayTasks = await Task.find({
      userId: req.user._id,
      status: 'completed',
      completedAt: { $gte: yesterday, $lte: yesterdayEnd },
    }).select('title goalId');

    // 4. Call Gemini
    const aiTasks = await generateDailyTasks({
      activeGoals: goalPayloads,
      hoursAvailable: hoursAvailable || req.user.hoursPerDay || 2,
      dayOfWeek,
      yesterdayTasks: yesterdayTasks.map((t) => ({ title: t.title })),
    });

    // 5. Save generated tasks to DB (mark dueDate as today)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const savedTasks = await Task.insertMany(
      aiTasks.map((t) => ({
        userId: req.user._id,
        goalId: t.goalId,
        stepId: t.stepId || null,
        title: t.title,
        priority: t.priority || 'medium',
        estimatedMinutes: t.estimatedMinutes || null,
        dueDate: todayStart,
        isAiGenerated: true,
        status: 'pending',
      }))
    );

    res.status(201).json({
      success: true,
      message: `${savedTasks.length} tasks generated for today.`,
      count: savedTasks.length,
      tasks: savedTasks,
    });
  } catch (error) {
    console.error('generateTasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Task generation failed.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/tasks
// @desc    Manually create a task
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { goalId, stepId, title, priority, dueDate, estimatedMinutes, notes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }
    if (!goalId) {
      return res.status(400).json({ success: false, message: 'Goal ID is required for every task.' });
    }

    // Verify goal belongs to user
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const task = await Task.create({
      userId: req.user._id,
      goalId,
      stepId: stepId || null,
      title,
      priority: priority || 'medium',
      dueDate: dueDate || new Date(),
      estimatedMinutes: estimatedMinutes || null,
      notes: notes || null,
      isAiGenerated: false,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/tasks/:id
// @desc    Update a task's title, priority, notes, or dueDate
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const allowed = ['title', 'priority', 'dueDate', 'notes', 'estimatedMinutes'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/tasks/:id/complete
// @desc    Mark task complete → triggers roadmap step progress check
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Task is already completed.' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    // Check if parent roadmap step should be auto-advanced
    await checkAndAdvanceStep(task);

    res.status(200).json({
      success: true,
      message: 'Task completed! 🎉',
      task,
    });
  } catch (error) {
    console.error('completeTask error:', error);
    res.status(500).json({ success: false, message: 'Server error completing task.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/tasks/:id/skip
// @desc    Mark task as skipped
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const skipTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot skip a task that is already "${task.status}".`,
      });
    }

    task.status = 'skipped';
    task.skippedAt = new Date();
    await task.save();

    res.status(200).json({ success: true, message: 'Task skipped.', task });
  } catch (error) {
    console.error('skipTask error:', error);
    res.status(500).json({ success: false, message: 'Server error skipping task.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task.' });
  }
};

module.exports = {
  getTasks,
  getTodayTasks,
  generateTasks,
  createTask,
  updateTask,
  completeTask,
  skipTask,
  deleteTask,
};
