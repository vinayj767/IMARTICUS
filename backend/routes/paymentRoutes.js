const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');

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
    const { courseId, userEmail, userName, userId, amount } = req.body;

    if (!courseId || !userEmail || !userName || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, userEmail, userName, userId'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user already enrolled
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadyEnrolled = user.enrolledCourses.some(
      ec => ec.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const orderAmount = amount || course.price || 50000; // Use provided amount or course price

    // If Razorpay is not configured, return test mode response
    if (!razorpayInstance) {
      const testOrder = {
        razorpayOrderId: 'test_order_' + Date.now(),
        amount: orderAmount,
        currency: 'INR',
        courseId,
        userEmail,
        userName,
        userId
      };

      const payment = await Payment.create(testOrder);

      return res.json({
        success: true,
        testMode: true,
        message: 'Test mode - Razorpay keys not configured',
        data: {
          orderId: testOrder.razorpayOrderId,
          amount: testOrder.amount,
          currency: testOrder.currency,
          key: 'test_key',
          paymentId: payment._id
        }
      });
    }

    // Create Razorpay order
    const options = {
      amount: orderAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Save payment record
    const payment = await Payment.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseId,
      userEmail,
      userName,
      userId
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
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

// Verify payment and enroll user
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id }).populate('courseId');

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

      // Enroll user in course
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already enrolled
      const alreadyEnrolled = user.enrolledCourses.some(
        ec => ec.courseId.toString() === payment.courseId._id.toString()
      );

      if (!alreadyEnrolled) {
        user.enrolledCourses.push({
          courseId: payment.courseId._id,
          enrolledAt: new Date(),
          paymentId: payment._id,
          progress: [],
          completionPercentage: 0
        });
        await user.save();
      }

      return res.json({
        success: true,
        testMode: true,
        message: 'Payment verified and user enrolled successfully (test mode)',
        data: {
          payment,
          enrolled: true
        }
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

      // Enroll user in course
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already enrolled
      const alreadyEnrolled = user.enrolledCourses.some(
        ec => ec.courseId.toString() === payment.courseId._id.toString()
      );

      if (!alreadyEnrolled) {
        user.enrolledCourses.push({
          courseId: payment.courseId._id,
          enrolledAt: new Date(),
          paymentId: payment._id,
          progress: [],
          completionPercentage: 0
        });
        await user.save();
      }

      res.json({
        success: true,
        message: 'Payment verified and user enrolled successfully',
        data: {
          payment,
          enrolled: true
        }
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Invalid signature - Payment verification failed'
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
