const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// Initialize Razorpay (will work when keys are provided)
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const { courseId, userEmail, userName } = req.body;

    if (!courseId || !userEmail || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // If Razorpay is not configured, return test mode response
    if (!razorpayInstance) {
      const testOrder = {
        razorpayOrderId: 'test_order_' + Date.now(),
        amount: 50000, // 500 INR in paise
        currency: 'INR',
        courseId,
        userEmail,
        userName
      };

      const payment = new Payment(testOrder);
      await payment.save();

      return res.json({
        success: true,
        testMode: true,
        message: 'Test mode - Razorpay keys not configured',
        data: {
          orderId: testOrder.razorpayOrderId,
          amount: testOrder.amount,
          currency: testOrder.currency,
          key: 'test_key'
        }
      });
    }

    // Create Razorpay order
    const options = {
      amount: 50000, // 500 INR in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Save payment record
    const payment = new Payment({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseId,
      userEmail,
      userName
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Test mode - auto verify
    if (razorpay_order_id.startsWith('test_order_')) {
      payment.status = 'completed';
      payment.razorpayPaymentId = razorpay_payment_id || 'test_payment_' + Date.now();
      await payment.save();

      return res.json({
        success: true,
        testMode: true,
        message: 'Payment verified (test mode)',
        data: payment
      });
    }

    // Verify signature
    if (!razorpayInstance) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay not configured'
      });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'completed';
      await payment.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// Check payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      razorpayOrderId: req.params.orderId 
    }).populate('courseId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status',
      error: error.message
    });
  }
});

module.exports = router;
