const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Goal title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['career', 'fitness', 'business', 'learning', 'personal'],
        message: 'Category must be one of: career, fitness, business, learning, personal',
      },
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    timeframe: {
      type: String,
      trim: true,
      // e.g. "3 months", "6 weeks"
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused', 'completed'],
        message: 'Status must be one of: active, paused, completed',
      },
      default: 'active',
    },
    momentumScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Context the user provides when creating the goal — sent to Gemini for roadmap
    userContext: {
      type: String,
      trim: true,
      maxlength: [3000, 'Context cannot exceed 3000 characters'],
    },
    hoursPerDay: {
      type: Number,
      min: 0.5,
      max: 24,
      default: 1,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to efficiently fetch all goals for a user
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);
