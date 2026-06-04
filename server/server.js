/**
 * server.js — StepsBuilder API Server
 *
 * Entry point for the Node.js / Express backend.
 * Connects to MongoDB, registers all routes, and starts the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const goalRoutes     = require('./routes/goals');
const roadmapRoutes  = require('./routes/roadmap');
const taskRoutes     = require('./routes/tasks');
const journalRoutes  = require('./routes/journal');
const nudgeRoutes    = require('./routes/nudges');
const insightRoutes  = require('./routes/insights');
const paymentRoutes  = require('./routes/payments');

// ── Connect to MongoDB + Redis ───────────────────────────────────────────────
connectDB();
connectRedis();

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────

// CORS — in production, restrict to your Vercel frontend domain
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : '*',
    credentials: true,
  })
);

// Parse incoming JSON bodies (50kb limit — goal context paragraphs can be large)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// HTTP request logging (skip in test environments)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StepsBuilder API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/goals',    goalRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/journal',  journalRoutes);
app.use('/api/nudges',   nudgeRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/payments', paymentRoutes);

// Roadmap routes are nested under goals — /api/goals/:goalId/roadmap
// Note: mergeParams is enabled in roadmap.js to access :goalId
app.use('/api/goals/:goalId/roadmap', roadmapRoutes);

// ── 404 handler — catch unknown routes ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, errors });
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 StepsBuilder API running on port ${PORT} [${process.env.NODE_ENV}]`);

  // ── Midnight cron: run adaptation engine for ALL users ─────────────────────
  // "0 0 * * *" = midnight server time, every day
  cron.schedule('0 0 * * *', async () => {
    console.log('🗓️  Midnight cron: running adaptation engine for all users...');
    try {
      const User = require('./models/User');
      const { runAdaptationForUser } = require('./services/adaptationService');
      const users = await User.find({}).select('_id');
      for (const user of users) {
        await runAdaptationForUser(user._id);
      }
      console.log(`✅ Adaptation cron complete — processed ${users.length} users`);
    } catch (err) {
      console.error('❌ Adaptation cron error:', err.message);
    }
  });
});

module.exports = app; // Export for testing
