/**
 * journalController.js
 *
 * Handles the daily reflection/journal flow:
 * 1. User submits free-form text
 * 2. Gemini interprets and maps activities to goals/steps (Call 3)
 * 3. User confirms or corrects the interpretation
 * 4. On confirmation, roadmap step progress is applied
 * 5. Corrections are stored for future prompt improvement
 */

const JournalEntry = require('../models/JournalEntry');
const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const { interpretJournal } = require('../services/geminiService');
const { cacheDel } = require('../config/redis');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: apply AI-interpreted progress to roadmap steps
// Called when user confirms the interpretation
// ─────────────────────────────────────────────────────────────────────────────
const applyProgressToRoadmap = async (goalMappings, userId) => {
  for (const mapping of goalMappings) {
    if (!mapping.goalId || !mapping.stepId || mapping.progressPercent <= 0) continue;

    try {
      // Verify the goal belongs to this user
      const goal = await Goal.findOne({ _id: mapping.goalId, userId });
      if (!goal) continue;

      const roadmap = await Roadmap.findOne({ goalId: mapping.goalId });
      if (!roadmap) continue;

      // Find the step
      for (const phase of roadmap.phases) {
        const step = phase.steps.id(mapping.stepId);
        if (!step) continue;

        // Progress rules:
        // - If step is not-started and progress > 0 → move to in-progress
        // - If progressPercent >= 100 → mark completed
        // - Never move backwards (completed → in-progress)
        if (step.status !== 'completed') {
          if (mapping.progressPercent >= 100) {
            step.status = 'completed';
            step.completedAt = new Date();
            if (!step.startedAt) step.startedAt = new Date();
          } else if (step.status === 'not-started' && mapping.progressPercent > 0) {
            step.status = 'in-progress';
            step.startedAt = new Date();
          }
          // Note: We don't store a numeric progressPercent on steps —
          // progress is implicit from status. The journal's progressPercent
          // is informational, used by Gemini to decide status transitions.
        }
        break;
      }

      await roadmap.save();
      await cacheDel(`roadmap:${mapping.goalId}`);

      // Update goal momentum score
      const completedSteps = roadmap.phases.reduce(
        (acc, p) => acc + p.steps.filter((s) => s.status === 'completed').length, 0
      );
      const totalSteps = roadmap.phases.reduce((acc, p) => acc + p.steps.length, 0);
      if (totalSteps > 0) {
        const momentumScore = Math.min(100, Math.round((completedSteps / totalSteps) * 80) + 10);
        await Goal.findByIdAndUpdate(mapping.goalId, { momentumScore });
      }
    } catch (err) {
      console.error(`applyProgressToRoadmap error for goal ${mapping.goalId}:`, err.message);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/journal
// @desc    Get all journal entries for the logged-in user (most recent first)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getEntries = async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const entries = await JournalEntry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-corrections'); // Don't expose corrections in list view

    const total = await JournalEntry.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: parseInt(page),
      entries,
    });
  } catch (error) {
    console.error('getEntries error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching journal entries.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/journal
// @desc    Submit a journal entry → AI interprets and maps to goals (Gemini Call 3)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createEntry = async (req, res) => {
  try {
    const { rawText, date } = req.body;

    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry must be at least 10 characters long.',
      });
    }

    // 1. Check for duplicate entry on the same day
    const entryDate = date ? new Date(date) : new Date();
    const dayStart = new Date(entryDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(entryDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingEntry = await JournalEntry.findOne({
      userId: req.user._id,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: 'You already have a journal entry for today. Update it instead.',
        existingEntryId: existingEntry._id,
      });
    }

    // 2. Create the entry first (before calling Gemini — so we never lose the user's text)
    const entry = await JournalEntry.create({
      userId: req.user._id,
      date: entryDate,
      rawText: rawText.trim(),
      aiProcessed: false,
    });

    // 3. Gather active goals with current step info for Gemini context
    const activeGoals = await Goal.find({ userId: req.user._id, status: 'active' });
    const goalContexts = [];

    for (const goal of activeGoals) {
      const roadmap = await Roadmap.findOne({ goalId: goal._id });
      let currentStep = null;

      if (roadmap) {
        for (const phase of roadmap.phases) {
          const inProgress = phase.steps.find((s) => s.status === 'in-progress');
          const notStarted = phase.steps.find((s) => s.status === 'not-started');
          currentStep = inProgress || notStarted;
          if (currentStep) break;
        }
      }

      goalContexts.push({
        goalId: goal._id.toString(),
        title: goal.title,
        category: goal.category,
        currentStep: currentStep
          ? { id: currentStep._id.toString(), title: currentStep.title }
          : null,
      });
    }

    // 4. Call Gemini to interpret the journal entry
    let aiInterpretation = null;
    let geminiError = null;

    try {
      const result = await interpretJournal({
        rawText: rawText.trim(),
        activeGoals: goalContexts,
      });

      // Remap goalId strings back to ObjectIds for storage
      aiInterpretation = {
        goalMappings: (result.goalMappings || []).map((m) => {
          const matchedGoal = activeGoals.find((g) => g._id.toString() === m.goalId);
          return {
            goalId: m.goalId,
            goalTitle: matchedGoal?.title || '',
            stepId: m.stepId || null,
            stepTitle: null,
            progressPercent: Math.min(100, Math.max(0, m.progressPercent || 0)),
            activitiesMapped: m.activitiesMapped || [],
          };
        }),
        untrackedActivities: result.untrackedActivities || [],
        productivityLevel: result.productivityLevel || 'medium',
      };

      // Update entry with AI interpretation
      entry.aiInterpretation = aiInterpretation;
      entry.aiProcessed = true;
      await entry.save();
    } catch (err) {
      console.error('Gemini journal interpretation failed:', err.message);
      geminiError = 'AI interpretation failed. You can still confirm or correct manually.';
    }

    res.status(201).json({
      success: true,
      message: 'Journal entry saved. Review the AI interpretation below.',
      entry,
      ...(geminiError && { warning: geminiError }),
    });
  } catch (error) {
    console.error('createEntry error:', error);
    res.status(500).json({ success: false, message: 'Server error saving journal entry.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/journal/:id
// @desc    Get a single journal entry with full AI interpretation
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }

    res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error('getEntry error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching journal entry.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/journal/:id/confirm
// @desc    User confirms AI interpretation → applies progress to roadmap
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const confirmEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }
    if (entry.isConfirmed) {
      // Already confirmed — idempotent, return success instead of erroring
      return res.status(200).json({
        success: true,
        message: 'Entry was already confirmed.',
        entry,
      });
    }

    // Apply progress to roadmap steps (only when AI produced mappings)
    let progressApplied = false;
    if (entry.aiProcessed && entry.aiInterpretation?.goalMappings?.length > 0) {
      await applyProgressToRoadmap(entry.aiInterpretation.goalMappings, req.user._id);
      progressApplied = true;
    }

    entry.isConfirmed = true;
    entry.confirmedAt = new Date();
    await entry.save();

    const message = progressApplied
      ? 'Interpretation confirmed. Roadmap progress updated! 🚀'
      : 'Journal entry confirmed. Keep working on your goals!';

    res.status(200).json({ success: true, message, entry });
  } catch (error) {
    console.error('confirmEntry error:', error);
    res.status(500).json({ success: false, message: 'Server error confirming entry.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/journal/:id/correct
// @desc    User corrects AI interpretation — stored to improve future prompts
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const correctEntry = async (req, res) => {
  try {
    const { corrections, updatedGoalMappings } = req.body;
    // corrections: [{ goalId, field, aiValue, correctedValue }]
    // updatedGoalMappings: the corrected version of aiInterpretation.goalMappings

    if (!corrections && !updatedGoalMappings) {
      return res.status(400).json({
        success: false,
        message: 'Provide corrections or updatedGoalMappings.',
      });
    }

    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }
    if (entry.isConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot correct a confirmed entry.',
      });
    }

    // Store the specific corrections for prompt improvement
    if (corrections && corrections.length > 0) {
      entry.corrections.push(...corrections);
      entry.hasCorrestions = true;
    }

    // Replace the AI mappings with user's corrected version
    if (updatedGoalMappings) {
      entry.aiInterpretation.goalMappings = updatedGoalMappings;
    }

    await entry.save();

    res.status(200).json({
      success: true,
      message: 'Corrections saved. Please confirm when ready.',
      entry,
    });
  } catch (error) {
    console.error('correctEntry error:', error);
    res.status(500).json({ success: false, message: 'Server error saving corrections.' });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/journal/:id
// @desc    Edit a journal entry — only allowed on the same calendar day it was created
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateEntry = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry must be at least 10 characters long.',
      });
    }

    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }

    // ── Day-lock enforcement ─────────────────────────────────────────────────
    // Compare entry date to today in UTC. Once the UTC day rolls over, editing
    // is blocked. This gives a consistent cutoff regardless of the user's timezone.
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const entryDate = new Date(entry.date);
    if (entryDate < todayStart || entryDate > todayEnd) {
      return res.status(403).json({
        success: false,
        message: 'This entry can no longer be edited. Journal entries are locked after the day ends.',
      });
    }

    // ── Update text and reset AI state ───────────────────────────────────────
    entry.rawText = rawText.trim();
    entry.aiProcessed = false;
    entry.isConfirmed = false;
    entry.confirmedAt = null;
    entry.aiInterpretation = {
      goalMappings: [],
      untrackedActivities: [],
      productivityLevel: 'medium',
    };
    await entry.save();

    // ── Re-run Gemini interpretation on the updated text ─────────────────────
    let geminiError = null;
    try {
      const activeGoals = await Goal.find({ userId: req.user._id, status: 'active' });
      const goalContexts = [];

      for (const goal of activeGoals) {
        const roadmap = await Roadmap.findOne({ goalId: goal._id });
        let currentStep = null;
        if (roadmap) {
          for (const phase of roadmap.phases) {
            const inProgress = phase.steps.find((s) => s.status === 'in-progress');
            const notStarted = phase.steps.find((s) => s.status === 'not-started');
            currentStep = inProgress || notStarted;
            if (currentStep) break;
          }
        }
        goalContexts.push({
          goalId: goal._id.toString(),
          title: goal.title,
          category: goal.category,
          currentStep: currentStep
            ? { id: currentStep._id.toString(), title: currentStep.title }
            : null,
        });
      }

      const result = await interpretJournal({ rawText: rawText.trim(), activeGoals: goalContexts });

      entry.aiInterpretation = {
        goalMappings: (result.goalMappings || []).map((m) => {
          const matchedGoal = activeGoals.find((g) => g._id.toString() === m.goalId);
          return {
            goalId: m.goalId,
            goalTitle: matchedGoal?.title || '',
            stepId: m.stepId || null,
            stepTitle: null,
            progressPercent: Math.min(100, Math.max(0, m.progressPercent || 0)),
            activitiesMapped: m.activitiesMapped || [],
          };
        }),
        untrackedActivities: result.untrackedActivities || [],
        productivityLevel: result.productivityLevel || 'medium',
      };
      entry.aiProcessed = true;
      await entry.save();
    } catch (err) {
      console.error('Gemini re-interpretation failed on edit:', err.message);
      geminiError = 'AI re-interpretation failed, but your text was saved.';
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry updated and re-interpreted by AI.',
      entry,
      ...(geminiError && { warning: geminiError }),
    });
  } catch (error) {
    console.error('updateEntry error:', error);
    res.status(500).json({ success: false, message: 'Server error updating journal entry.' });
  }
};

module.exports = { getEntries, createEntry, getEntry, updateEntry, confirmEntry, correctEntry };

