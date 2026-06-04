const mongoose = require('mongoose');

// A single step inside a phase
const stepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    estimatedDays: {
      type: Number,
      min: 1,
      default: 7,
    },
    // Track when status changes — useful for momentum calculation
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Gemini-assigned order position within the phase
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true } // Keep _id on each step so tasks can reference stepId
);

// A phase groups related steps (e.g. "Foundation", "Advanced Topics")
const phaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'Goal ID is required'],
      unique: true, // One roadmap per goal
      index: true,
    },
    visualType: {
      type: String,
      enum: {
        values: ['flowchart', 'timeline', 'kanban'],
        message: 'Visual type must be one of: flowchart, timeline, kanban',
      },
      required: [true, 'Visual type is required'],
    },
    // Gemini's reasoning for the chosen visual type — stored for transparency
    visualTypeReason: {
      type: String,
      trim: true,
    },
    phases: {
      type: [phaseSchema],
      default: [],
    },
    // Track how many times the roadmap was AI-regenerated
    regenerationCount: {
      type: Number,
      default: 0,
    },
    lastRegeneratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to compute overall roadmap progress percentage
roadmapSchema.virtual('progressPercent').get(function () {
  let total = 0;
  let completed = 0;

  this.phases.forEach((phase) => {
    phase.steps.forEach((step) => {
      total++;
      if (step.status === 'completed') completed++;
    });
  });

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
});

roadmapSchema.set('toJSON', { virtuals: true });
roadmapSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
