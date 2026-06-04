const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'Goal ID is required'],
    },
    // String reference to a step's _id within the roadmap phases array
    stepId: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [500, 'Task title cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['high', 'medium', 'low'],
        message: 'Priority must be one of: high, medium, low',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'skipped'],
        message: 'Status must be one of: pending, completed, skipped',
      },
      default: 'pending',
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    // Gemini's estimated time in minutes — helps user plan their day
    estimatedMinutes: {
      type: Number,
      min: 5,
      max: 480, // Max 8 hours for a single task
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    skippedAt: {
      type: Date,
      default: null,
    },
    // User notes on a task (optional)
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
taskSchema.index({ userId: 1, dueDate: 1 }); // Today's tasks
taskSchema.index({ userId: 1, goalId: 1, status: 1 }); // Tasks per goal
taskSchema.index({ userId: 1, status: 1, createdAt: -1 }); // Recent tasks by status

module.exports = mongoose.model('Task', taskSchema);
