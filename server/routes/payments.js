const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getSubscription,
  cancelSubscription,
} = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/subscription', getSubscription);
router.post('/cancel', cancelSubscription);

module.exports = router;
