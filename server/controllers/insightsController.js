/**
 * insightsController.js
 *
 * Provides weekly AI-generated summaries and per-goal momentum data.
 * Uses Gemini Call 5 for weekly insights.
 */

const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const Task = require('../models/Task');
const JournalEntry = require('../models/JournalEntry');
const { generateWeeklyInsights } = require('../services/geminiService');
const { cacheGet, cacheSet } = require('../config/redis');

// Weekly insights cache TTL: 1 hour (Gemini call is expensive ~5-15s)
const WEEKLY_INSIGHTS_TTL = 3600;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get start/end of the current week (Monday–Sunday)
// ─────────────────────────────────────────────────────────────────────────────
const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: calculate streak (consecutive days with at least 1 completed task)
// ─────────────────────────────────────────────────────────────────────────────
const calcStreak = (completedTaskDates) => {
  if (!completedTaskDates.length) return 0;

  // Get unique day strings, sorted descending
  const days = [
    ...new Set(completedTaskDates.map((d) => new Date(d).toISOString().split('T')[0])),
  ].sort().reverse();

  let streak = 0;
  let expected = new Date();
  expected.setUTCHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    const diff = Math.round((expected - d) / (1000 * 60 * 60 * 24));
    if (diff === 0 || diff === 1) {
      streak++;
      expected = d;
    } else {
      break;
    }
  }
  return streak;
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/insights/weekly
// @desc    AI-generated weekly summary across all goals (Gemini Call 5)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getWeeklySummary = async (req, res) => {
  try {
    const { start, end } = getWeekRange();
    const userId = req.user._id;

    // ── Check cache first (saves 5–15s Gemini call on repeat visits) ──────────────
    const cacheKey = `insights:weekly:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.log(`⚡ Weekly insights served from cache for user ${userId}`);
      return res.status(200).json({ success: true, fromCache: true, ...cached });
    }

    // 1. Gather all active (and recently completed) goals
    const goals = await Goal.find({
      userId,
      status: { $in: ['active', 'paused', 'completed'] },
    });

    if (goals.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No goals yet. Create your first goal to see insights.',
        insights: null,
      });
    }

    // 2. Per-goal: count completed tasks this week
    const completedTasksPerGoal = await Promise.all(
      goals.map(async (goal) => {
        const count = await Task.countDocuments({
          userId,
          goalId: goal._id,
          status: 'completed',
          completedAt: { $gte: start, $lte: end },
        });
        return { goalId: goal._id.toString(), goalTitle: goal.title, taskCount: count };
      })
    );

    // 3. Journal entries this week
    const journalEntries = await JournalEntry.find({
      userId,
      date: { $gte: start, $lte: end },
    }).select('date aiInterpretation.productivityLevel');

    // 4. Momentum changes
    const momentumChanges = goals.map((g) => ({
      goalId: g._id.toString(),
      goalTitle: g.title,
      startScore: 50,
      endScore: g.momentumScore,
    }));

    // 5. Goals with zero activity this week
    const inactiveGoals = completedTasksPerGoal
      .filter((g) => g.taskCount === 0)
      .map((g) => ({ goalId: g.goalId, goalTitle: g.goalTitle }));

    // 6. Call Gemini for narrative summary (the slow part — result will be cached)
    const aiInsights = await generateWeeklyInsights({
      completedTasksPerGoal,
      journalEntries: journalEntries.map((e) => ({
        date: e.date,
        productivityLevel: e.aiInterpretation?.productivityLevel || 'medium',
      })),
      momentumChanges,
      inactiveGoals,
    });

    // 7. Compute streak for each goal
    const goalStreaks = await Promise.all(
      goals.map(async (goal) => {
        const tasks = await Task.find({
          userId,
          goalId: goal._id,
          status: 'completed',
        }).select('completedAt');
        const streak = calcStreak(tasks.map((t) => t.completedAt));
        return { goalId: goal._id.toString(), streak };
      })
    );

    const payload = {
      week: { start, end },
      insights: {
        ...aiInsights,
        totalTasksCompleted: completedTasksPerGoal.reduce((a, g) => a + g.taskCount, 0),
        journalEntriesCount: journalEntries.length,
        streaks: goalStreaks,
        goals: goals.map((g) => ({
          _id: g._id,
          title: g.title,
          momentumScore: g.momentumScore,
          status: g.status,
        })),
      },
    };

    // ── Cache result for 1 hour ─────────────────────────────────────────────
    await cacheSet(cacheKey, payload, WEEKLY_INSIGHTS_TTL);

    res.status(200).json({ success: true, fromCache: false, ...payload });
  } catch (error) {
    console.error('getWeeklySummary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating weekly insights.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/insights/goal/:id
// @desc    Per-goal momentum, streak, progress breakdown
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGoalInsights = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const roadmap = await Roadmap.findOne({ goalId: goal._id });

    // Task stats
    const [totalTasks, completedTasks, skippedTasks] = await Promise.all([
      Task.countDocuments({ userId: req.user._id, goalId: goal._id }),
      Task.countDocuments({ userId: req.user._id, goalId: goal._id, status: 'completed' }),
      Task.countDocuments({ userId: req.user._id, goalId: goal._id, status: 'skipped' }),
    ]);

    // Streak calculation
    const allCompletedTasks = await Task.find({
      userId: req.user._id,
      goalId: goal._id,
      status: 'completed',
    }).select('completedAt');
    const streak = calcStreak(allCompletedTasks.map((t) => t.completedAt));

    // Roadmap progress
    let totalSteps = 0, completedSteps = 0, inProgressSteps = 0;
    if (roadmap) {
      roadmap.phases.forEach((phase) => {
        phase.steps.forEach((step) => {
          totalSteps++;
          if (step.status === 'completed') completedSteps++;
          if (step.status === 'in-progress') inProgressSteps++;
        });
      });
    }

    // Last 7 days task activity (for trend sparkline)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTasks = await Task.find({
      userId: req.user._id,
      goalId: goal._id,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo },
    }).select('completedAt');

    // Group by day
    const dailyActivity = {};
    recentTasks.forEach((t) => {
      const day = new Date(t.completedAt).toISOString().split('T')[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      goal: {
        _id: goal._id,
        title: goal.title,
        category: goal.category,
        status: goal.status,
        momentumScore: goal.momentumScore,
        timeframe: goal.timeframe,
        deadline: goal.deadline,
      },
      progress: {
        totalSteps,
        completedSteps,
        inProgressSteps,
        progressPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      },
      tasks: { totalTasks, completedTasks, skippedTasks },
      streak,
      dailyActivity,
      roadmap: roadmap
        ? {
            visualType: roadmap.visualType,
            phases: roadmap.phases.map((p) => ({
              title: p.title,
              total: p.steps.length,
              completed: p.steps.filter((s) => s.status === 'completed').length,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error('getGoalInsights error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching goal insights.' });
  }
};

module.exports = { getWeeklySummary, getGoalInsights };
