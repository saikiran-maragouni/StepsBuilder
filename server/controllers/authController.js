const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { runAdaptationForUser } = require('../services/adaptationService');

// ─── Helper: generate signed JWT ──────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: format validation errors into a flat array ───────────────────────
const getValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((e) => e.msg);
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    // 1. Validate request body fields
    const errors = getValidationErrors(req);
    if (errors) {
      return res.status(400).json({ success: false, errors });
    }

    const { name, email, password } = req.body;

    // 2. Check if email is already in use
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Create new user (password gets hashed in the pre-save hook)
    const user = await User.create({ name, email, password });

    // 4. Issue JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Log in with email and password, receive JWT
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    // 1. Validate request body
    const errors = getValidationErrors(req);
    if (errors) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = req.body;

    // 2. Find user (explicitly select password back — it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Use a generic message to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Issue JWT
    const token = generateToken(user._id);

    // 5. Fire adaptation engine in the background — non-blocking
    //    Don't await it — the login response goes out immediately
    setImmediate(() => runAdaptationForUser(user._id));

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently authenticated user's profile
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware.protect — always fresh from DB
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/me
// @desc    Update the currently authenticated user's profile
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    // Whitelist allowed update fields — never allow password/plan via this route
    const allowedFields = [
      'name',
      'checkInPreference',
      'hoursPerDay',
      'primaryGoalContext',
      'onboardingCompleted',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser.toPublicJSON(),
    });
  } catch (error) {
    console.error('UpdateMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
    });
  }
};

module.exports = { register, login, getMe, updateMe };
