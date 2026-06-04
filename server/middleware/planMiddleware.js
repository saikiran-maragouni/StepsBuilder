const Goal = require('../models/Goal');

const FREE_PLAN_GOAL_LIMIT = 3;

/**
 * checkGoalLimit — middleware to enforce the free plan's 3-goal cap.
 *
 * Use this on POST /api/goals (before the controller).
 * Requires protect middleware to run first (req.user must be set).
 */
const checkGoalLimit = async (req, res, next) => {
  try {
    // Pro users have no limit
    if (req.user.plan === 'pro') {
      return next();
    }

    // Count active + paused goals (completed goals don't count against the limit)
    const goalCount = await Goal.countDocuments({
      userId: req.user._id,
      status: { $in: ['active', 'paused'] },
    });

    if (goalCount >= FREE_PLAN_GOAL_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `Free plan allows a maximum of ${FREE_PLAN_GOAL_LIMIT} active goals. Upgrade to Pro for unlimited goals.`,
        upgradeRequired: true,
        currentCount: goalCount,
        limit: FREE_PLAN_GOAL_LIMIT,
      });
    }

    next();
  } catch (error) {
    console.error('Plan middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking plan limits.',
    });
  }
};

/**
 * requirePro — middleware to restrict features to Pro plan only.
 *
 * Use on routes that are Pro-only (e.g., advanced insights).
 */
const requirePro = (req, res, next) => {
  if (req.user.plan !== 'pro') {
    return res.status(403).json({
      success: false,
      message: 'This feature is available on the Pro plan only.',
      upgradeRequired: true,
    });
  }
  next();
};

module.exports = { checkGoalLimit, requirePro };
