/**
 * roadmapController.js
 *
 * Handles roadmap reads, step status updates, and AI regeneration.
 * Roadmap responses are cached in Redis for 1 hour to avoid repeat Gemini calls.
 */

const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/geminiService');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

// Cache TTL: 1 hour (roadmaps rarely change, expensive to regenerate)
const ROADMAP_CACHE_TTL = 3600;

// Build the Redis key for a goal's roadmap
const roadmapCacheKey = (goalId) => `roadmap:${goalId}`;

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/goals/:goalId/roadmap
// @desc    Get the full roadmap for a goal (Redis-cached)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getRoadmap = async (req, res) => {
  try {
    const { goalId } = req.params;

    // 1. Verify the goal belongs to this user
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // 2. Try Redis cache first
    const cacheKey = roadmapCacheKey(goalId);
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        roadmap: cached,
      });
    }

    // 3. Cache miss — fetch from MongoDB
    const roadmap = await Roadmap.findOne({ goalId });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found. Try regenerating it from the goal page.',
      });
    }

    // 4. Store in cache for next request
    await cacheSet(cacheKey, roadmap.toObject(), ROADMAP_CACHE_TTL);

    res.status(200).json({
      success: true,
      fromCache: false,
      roadmap,
    });
  } catch (error) {
    console.error('getRoadmap error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching roadmap.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/goals/:goalId/roadmap/steps/:stepId
// @desc    Update a single step's status (not-started → in-progress → completed)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateStep = async (req, res) => {
  try {
    const { goalId, stepId } = req.params;
    const { status } = req.body;

    const validStatuses = ['not-started', 'in-progress', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // 1. Verify goal ownership
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // 2. Find the roadmap and the specific step
    const roadmap = await Roadmap.findOne({ goalId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    // 3. Locate the step across all phases
    let targetStep = null;
    let targetPhase = null;

    for (const phase of roadmap.phases) {
      const step = phase.steps.id(stepId);
      if (step) {
        targetStep = step;
        targetPhase = phase;
        break;
      }
    }

    if (!targetStep) {
      return res.status(404).json({ success: false, message: 'Step not found in roadmap.' });
    }

    // 4. Update step status and timestamps
    const previousStatus = targetStep.status;
    targetStep.status = status;

    if (status === 'in-progress' && previousStatus === 'not-started') {
      targetStep.startedAt = new Date();
    }
    if (status === 'completed') {
      targetStep.completedAt = new Date();
      if (!targetStep.startedAt) targetStep.startedAt = new Date();
    }
    if (status === 'not-started') {
      targetStep.startedAt = null;
      targetStep.completedAt = null;
    }

    // 5. Update goal momentum score based on progress
    const updatedMomentum = recalculateMomentum(roadmap);
    await Goal.findByIdAndUpdate(goalId, { momentumScore: updatedMomentum });

    await roadmap.save();

    // 6. Bust Redis cache — data changed
    await cacheDel(roadmapCacheKey(goalId));

    res.status(200).json({
      success: true,
      message: `Step marked as "${status}".`,
      step: targetStep,
      phase: targetPhase.title,
      progressPercent: roadmap.progressPercent,
      momentumScore: updatedMomentum,
    });
  } catch (error) {
    console.error('updateStep error:', error);
    res.status(500).json({ success: false, message: 'Server error updating step.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/goals/:goalId/roadmap/regenerate
// @desc    Ask Gemini to regenerate the roadmap from scratch
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const regenerateRoadmap = async (req, res) => {
  try {
    const { goalId } = req.params;

    // 1. Verify goal ownership
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // 2. Call Gemini with the original goal data
    const geminiPayload = {
      title: goal.title,
      description: goal.description || goal.userContext || '',
      category: goal.category,
      timeframe: goal.timeframe,
      userContext: goal.userContext || `Experience level: ${goal.experienceLevel}`,
      hoursPerDay: goal.hoursPerDay,
    };

    const aiResult = await generateRoadmap(geminiPayload);

    // 3. Replace the existing roadmap (upsert)
    const existingRoadmap = await Roadmap.findOne({ goalId });

    const newPhases = aiResult.phases.map((phase, phaseIndex) => ({
      title: phase.title,
      order: phaseIndex,
      steps: phase.steps.map((step, stepIndex) => ({
        title: step.title,
        description: step.description,
        estimatedDays: step.estimatedDays || 7,
        status: 'not-started',
        order: stepIndex,
      })),
    }));

    let roadmap;
    if (existingRoadmap) {
      existingRoadmap.visualType = aiResult.visualType;
      existingRoadmap.visualTypeReason = aiResult.reason;
      existingRoadmap.phases = newPhases;
      existingRoadmap.regenerationCount += 1;
      existingRoadmap.lastRegeneratedAt = new Date();
      roadmap = await existingRoadmap.save();
    } else {
      roadmap = await Roadmap.create({
        goalId,
        visualType: aiResult.visualType,
        visualTypeReason: aiResult.reason,
        phases: newPhases,
        regenerationCount: 1,
        lastRegeneratedAt: new Date(),
      });
    }

    // 4. Reset momentum score on regeneration
    await Goal.findByIdAndUpdate(goalId, { momentumScore: 0 });

    // 5. Bust Redis cache — roadmap has completely changed
    await cacheDel(roadmapCacheKey(goalId));

    res.status(200).json({
      success: true,
      message: 'Roadmap regenerated successfully.',
      roadmap,
    });
  } catch (error) {
    console.error('regenerateRoadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Roadmap regeneration failed. Please try again.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Recalculate momentum score from roadmap progress
//
// Logic:
//   - Base score: proportional to % of steps completed (0–80 range)
//   - Bonus +20 if recently made progress (steps with completedAt in last 3 days)
//   - Score clamped to 0–100
// ─────────────────────────────────────────────────────────────────────────────
const recalculateMomentum = (roadmap) => {
  let total = 0;
  let completed = 0;
  let recentlyCompleted = 0;
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  roadmap.phases.forEach((phase) => {
    phase.steps.forEach((step) => {
      total++;
      if (step.status === 'completed') {
        completed++;
        if (step.completedAt && step.completedAt > threeDaysAgo) {
          recentlyCompleted++;
        }
      }
    });
  });

  if (total === 0) return 50;

  const progressScore = Math.round((completed / total) * 80);
  const recentBonus = Math.min(recentlyCompleted * 5, 20);

  return Math.min(100, Math.max(0, progressScore + recentBonus));
};

module.exports = { getRoadmap, updateStep, regenerateRoadmap };
