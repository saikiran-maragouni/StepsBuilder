const mongoose = require('mongoose');

// A single goal mapping extracted from the journal text by Gemini
const goalMappingSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    goalTitle: {
      type: String, // Denormalized for quick display without populate
    },
    stepId: {
      type: String,
      default: null,
    },
    stepTitle: {
      type: String,
      default: null,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    activitiesMapped: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// A user correction to one specific goal mapping
const correctionSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
    },
    field: {
      type: String, // e.g. 'progressPercent', 'stepId', 'activitiesMapped'
    },
    aiValue: mongoose.Schema.Types.Mixed, // What AI returned
    correctedValue: mongoose.Schema.Types.Mixed, // What user changed it to
  },
  { _id: false }
);

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    rawText: {
      type: String,
      required: [true, 'Journal text is required'],
      trim: true,
      maxlength: [10000, 'Journal entry cannot exceed 10000 characters'],
    },
    aiInterpretation: {
      goalMappings: {
        type: [goalMappingSchema],
        default: [],
      },
      untrackedActivities: {
        type: [String],
        default: [],
      },
      productivityLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
    // User confirmed the AI interpretation is correct
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    // Stored corrections — fed back into future prompts for improvement
    corrections: {
      type: [correctionSchema],
      default: [],
    },
    hasCorrestions: {
      type: Boolean,
      default: false,
    },
    // Whether AI has processed this entry yet
    aiProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient per-user date-range queries (weekly insights, etc.)
journalEntrySchema.index({ userId: 1, date: -1 });
// One entry per user per day (unique constraint on date truncated to day)
// Enforced in application logic since MongoDB doesn't natively support day-level uniqueness

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
