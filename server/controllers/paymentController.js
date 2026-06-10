/**
 * paymentController.js — Razorpay Payment Integration
 *
 * Flow:
 * 1. POST /create-order  → Create a Razorpay order (backend)
 * 2. Frontend opens Razorpay checkout → user pays
 * 3. POST /verify        → Verify HMAC signature → upgrade user to Pro
 * 4. GET  /subscription  → Return current plan info
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Pro plan price — ₹499 (in paise: 1 INR = 100 paise)
const PRO_PRICE_PAISE = 49900;

// Initialise Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for the Pro plan
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    // Already on Pro — no need to pay again
    if (req.user.plan === 'pro') {
      return res.status(400).json({ success: false, message: 'You are already on the Pro plan.' });
    }

    const options = {
      amount: PRO_PRICE_PAISE,
      currency: 'INR',
      receipt: `sb_${Date.now()}`.slice(0, 40),
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        plan: 'pro',
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,       // paise
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Could not create payment order. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature → upgrade user to Pro
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    // Verify HMAC-SHA256 signature
    // Razorpay signs: order_id + "|" + payment_id with your key_secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
    }

    // Signature is valid — upgrade user to Pro
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan: 'pro',
        razorpaySubscriptionId: razorpay_payment_id,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "You're now on Pro! Welcome to the good side. 🎉",
      user: updatedUser.toPublicJSON(),
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed. Contact support.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/payments/subscription
// @desc    Get current user's plan info
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getSubscription = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      plan: req.user.plan,
      isPro: req.user.plan === 'pro',
      paymentId: req.user.razorpaySubscriptionId || null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch plan info.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/payments/cancel
// @desc    Downgrade user back to Free (manual — no refunds handled here)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const cancelSubscription = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { plan: 'free', razorpaySubscriptionId: null },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Downgraded to Free plan.',
      user: updatedUser.toPublicJSON(),
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, message: 'Could not cancel plan.' });
  }
};

module.exports = { createOrder, verifyPayment, getSubscription, cancelSubscription };
