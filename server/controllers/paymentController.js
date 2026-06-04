// paymentController.js — to be built last (Razorpay integration)
// Routes: POST create-order, POST verify, GET subscription, POST cancel

const createOrder = async (req, res) => {
  res.status(501).json({ success: false, message: 'Payment features coming soon.' });
};
const verifyPayment = async (req, res) => {
  res.status(501).json({ success: false, message: 'Payment features coming soon.' });
};
const getSubscription = async (req, res) => {
  res.status(501).json({ success: false, message: 'Payment features coming soon.' });
};
const cancelSubscription = async (req, res) => {
  res.status(501).json({ success: false, message: 'Payment features coming soon.' });
};

module.exports = { createOrder, verifyPayment, getSubscription, cancelSubscription };
