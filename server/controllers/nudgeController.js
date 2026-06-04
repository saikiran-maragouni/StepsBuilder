/**
 * nudgeController.js
 *
 * Nudges are read-only from the client side.
 * They are ONLY created by the AI adaptation engine (Gemini Call 4).
 * Users can mark them as read or dismiss them.
 */

const Nudge = require('../models/Nudge');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/nudges
// @desc    Get all unread + undismissed nudges for the user
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getNudges = async (req, res) => {
  try {
    const { includeRead, includeAll } = req.query;

    const filter = {
      userId: req.user._id,
      isDismissed: false,
    };

    // By default: only unread. ?includeRead=true includes read. ?includeAll=true includes everything.
    if (!includeAll && !includeRead) {
      filter.isRead = false;
    }

    const nudges = await Nudge.find(filter)
      .sort({ createdAt: -1 })
      .populate('goalId', 'title category');

    res.status(200).json({ success: true, count: nudges.length, nudges });
  } catch (error) {
    console.error('getNudges error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching nudges.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/nudges/:id/read
// @desc    Mark a nudge as read
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const nudge = await Nudge.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!nudge) return res.status(404).json({ success: false, message: 'Nudge not found.' });

    res.status(200).json({ success: true, message: 'Nudge marked as read.', nudge });
  } catch (error) {
    console.error('markRead error:', error);
    res.status(500).json({ success: false, message: 'Server error marking nudge as read.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/nudges/:id/dismiss
// @desc    Dismiss a nudge (it will no longer appear in the default list)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const dismissNudge = async (req, res) => {
  try {
    const nudge = await Nudge.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isDismissed: true, dismissedAt: new Date(), isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!nudge) return res.status(404).json({ success: false, message: 'Nudge not found.' });

    res.status(200).json({ success: true, message: 'Nudge dismissed.', nudge });
  } catch (error) {
    console.error('dismissNudge error:', error);
    res.status(500).json({ success: false, message: 'Server error dismissing nudge.' });
  }
};

module.exports = { getNudges, markRead, dismissNudge };
