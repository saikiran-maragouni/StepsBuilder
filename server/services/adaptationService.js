/**
 * adaptationService.js
 *
 * The heartbeat of StepsBuilder — the AI adaptation engine.
 * Called after every login and by the midnight cron job.
 *
 * For each active goal, it:
 * 1. Checks how long the user has been stuck on the current step
 * 2. Looks at momentum trend (improving / stable / declining)
 * 3. Reads recent journal summaries for context
 * 4. Calls Gemini (Call 4) to decide if a nudge is warranted
 * 5. Saves the nudge to the DB if Gemini says yes
 */

const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const JournalEntry = require('../models/JournalEntry');
const Nudge = require('../models/Nudge');
const { generateNudge } = require('./geminiService');

// ─────────────────────────────────────────────────────────────────────────────
// Analyze a single goal and create a nudge if warranted
// ─────────────────────────────────────────────────────────────────────────────
const analyzeGoal = async (goal) => {
  try {
    const roadmap = await Roadmap.findOne({ goalId: goal._id });
    if (!roadmap) return;

    // Find the current step (first in-progress, then first not-started)
    let currentStep = null;
    let currentPhaseTitle = '';
    for (const phase of roadmap.phases) {
      const inProgress = phase.steps.find((s) => s.status === 'in-progress');
      const notStarted = phase.steps.find((s) => s.status === 'not-started');
      currentStep = inProgress || notStarted;
      if (currentStep) {
        currentPhaseTitle = phase.title;
        break;
      }
    }

    // Goal is fully complete — no nudge needed
    if (!currentStep) return;

    // Days on current step
    const stepStartDate = currentStep.startedAt || goal.createdAt;
    const daysOnStep = Math.floor((Date.now() - new Date(stepStartDate)) / (1000 * 60 * 60 * 24));

    // Days since last nudge for this goal
    const lastNudge = await Nudge.findOne({ userId: goal.userId, goalId: goal._id })
      .sort({ createdAt: -1 })
      .select('createdAt');
    const daysSinceNudge = lastNudge
      ? Math.floor((Date.now() - new Date(lastNudge.createdAt)) / (1000 * 60 * 60 * 24))
      : 999; // Never nudged = treat as very overdue

    // Skip if nudged very recently (Gemini rule: don't nudge if < 3 days)
    if (daysSinceNudge < 3) return;

    // Weekly journal summaries for context
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentJournals = await JournalEntry.find({
      userId: goal.userId,
      date: { $gte: weekAgo },
    }).select('rawText aiInterpretation.productivityLevel');

    const journalSummary = recentJournals.length > 0
      ? recentJournals
          .slice(0, 3)
          .map((j) => j.rawText.substring(0, 200))
          .join(' | ')
      : null;

    // Momentum trend: compare current score vs a week ago
    // Since we don't store historical scores, approximate from step progress
    const completedSteps = roadmap.phases.reduce(
      (acc, p) => acc + p.steps.filter((s) => s.status === 'completed').length, 0
    );
    const totalSteps = roadmap.phases.reduce((acc, p) => acc + p.steps.length, 0);
    const currentMomentum = goal.momentumScore;

    let momentumTrend = 'stable';
    if (daysOnStep > (currentStep.estimatedDays || 7) * 1.5) momentumTrend = 'declining';
    if (completedSteps > 0 && daysOnStep <= (currentStep.estimatedDays || 7)) momentumTrend = 'improving';

    // Call Gemini to decide
    const nudgeDecision = await generateNudge({
      goalTitle: goal.title,
      currentStep: currentStep.title,
      daysOnStep,
      estimatedDays: currentStep.estimatedDays || 7,
      journalSummary,
      momentumScore: currentMomentum,
      momentumTrend,
      daysSinceNudge,
    });

    // Save nudge to DB only if Gemini says yes
    if (nudgeDecision.shouldNudge && nudgeDecision.message) {
      await Nudge.create({
        userId: goal.userId,
        goalId: goal._id,
        type: nudgeDecision.type || 'suggestion',
        message: nudgeDecision.message,
        suggestBreakdown: nudgeDecision.suggestBreakdown || false,
        newSteps: nudgeDecision.newSteps || [],
        isRead: false,
        isDismissed: false,
      });

      console.log(`💡 Nudge created for goal "${goal.title}": [${nudgeDecision.type}]`);
    }
  } catch (err) {
    // Errors are non-fatal — adaptation engine never crashes the login flow
    console.error(`adaptationService error for goal "${goal.title}":`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point — run for a single user
// Called by: authController on login (background) + midnight cron
// ─────────────────────────────────────────────────────────────────────────────
const runAdaptationForUser = async (userId) => {
  try {
    const activeGoals = await Goal.find({ userId, status: 'active' });
    if (activeGoals.length === 0) return;

    console.log(`🔄 Running adaptation engine for user ${userId} (${activeGoals.length} active goals)`);

    // Process goals sequentially to avoid hammering the Gemini API
    for (const goal of activeGoals) {
      await analyzeGoal(goal);
    }
  } catch (err) {
    console.error('runAdaptationForUser error:', err.message);
  }
};

module.exports = { runAdaptationForUser };
