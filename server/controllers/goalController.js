/**
 * goalController.js
 *
 * All goal-related endpoint logic.
 * Creating a goal automatically triggers Gemini roadmap generation.
 */

const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const Task = require('../models/Task');
const { generateRoadmap } = require('../services/geminiService');
const { cacheDel } = require('../config/redis');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/goals
// @desc    Get all goals for the logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGoals = async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error('getGoals error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching goals.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/goals
// @desc    Create a new goal AND trigger AI roadmap generation
// @access  Private  (planMiddleware.checkGoalLimit runs before this)
// ─────────────────────────────────────────────────────────────────────────────
const createGoal = async (req, res) => {
  try {
    const { title, category, timeframe, deadline, description, userContext, hoursPerDay, experienceLevel } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required.',
      });
    }

    // 1. Create the goal document
    const goal = await Goal.create({
      userId: req.user._id,
      title,
      category,
      timeframe,
      deadline: deadline || null,
      description,
      userContext,
      hoursPerDay: hoursPerDay || req.user.hoursPerDay || 1,
      experienceLevel: experienceLevel || 'beginner',
    });

    // 2. Call Gemini to generate the roadmap
    let roadmap = null;
    let geminiError = null;

    try {
      const geminiPayload = {
        title,
        description: description || userContext || '',
        category,
        timeframe,
        userContext: userContext || `Experience level: ${experienceLevel || 'beginner'}`,
        hoursPerDay: hoursPerDay || req.user.hoursPerDay || 1,
      };

      const aiResult = await generateRoadmap(geminiPayload);

      // 3. Persist the AI-generated roadmap
      roadmap = await Roadmap.create({
        goalId: goal._id,
        visualType: aiResult.visualType,
        visualTypeReason: aiResult.reason,
        phases: aiResult.phases.map((phase, phaseIndex) => ({
          title: phase.title,
          order: phaseIndex,
          steps: phase.steps.map((step, stepIndex) => ({
            title: step.title,
            description: step.description,
            estimatedDays: step.estimatedDays || 7,
            status: 'not-started',
            order: stepIndex,
          })),
        })),
      });
    } catch (err) {
      // Gemini failure is non-fatal — goal is still created
      // Frontend can call /regenerate later
      console.error('Gemini roadmap generation failed:', err.message);
      geminiError = 'Roadmap generation failed. You can regenerate it from the goal page.';
    }

    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      goal,
      roadmap,
      ...(geminiError && { warning: geminiError }),
    });
  } catch (error) {
    console.error('createGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error creating goal.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/goals/:id
// @desc    Get a single goal with its roadmap
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // Fetch associated roadmap
    const roadmap = await Roadmap.findOne({ goalId: goal._id });

    res.status(200).json({
      success: true,
      goal,
      roadmap: roadmap || null,
    });
  } catch (error) {
    console.error('getGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching goal.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/goals/:id
// @desc    Update a goal's metadata (title, timeframe, etc.)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateGoal = async (req, res) => {
  try {
    // Whitelist what can be updated — status must go through PATCH /status
    const allowedFields = [
      'title', 'category', 'timeframe', 'deadline',
      'description', 'userContext', 'hoursPerDay', 'experienceLevel',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    res.status(200).json({ success: true, message: 'Goal updated.', goal });
  } catch (error) {
    console.error('updateGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error updating goal.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/goals/:id
// @desc    Delete a goal and its entire associated data
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // Cascade delete — remove roadmap and tasks linked to this goal
    await Promise.all([
      Roadmap.deleteOne({ goalId: goal._id }),
      Task.deleteMany({ goalId: goal._id }),
      goal.deleteOne(),
    ]);

    // Bust cache for this goal's roadmap
    await cacheDel(`roadmap:${goal._id}`);

    res.status(200).json({
      success: true,
      message: 'Goal and all associated data deleted.',
    });
  } catch (error) {
    console.error('deleteGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting goal.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/goals/:id/status
// @desc    Pause, reactivate, or complete a goal
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateGoalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['active', 'paused', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const statusMessages = {
      active: 'Goal reactivated.',
      paused: 'Goal paused.',
      completed: 'Goal marked as completed. Great work! 🎉',
    };

    res.status(200).json({
      success: true,
      message: statusMessages[status],
      goal,
    });
  } catch (error) {
    console.error('updateGoalStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating goal status.' });
  }
};

module.exports = { getGoals, createGoal, getGoal, updateGoal, deleteGoal, updateGoalStatus };
