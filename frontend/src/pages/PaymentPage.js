import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrder, verifyPayment, getCourseById } from '../services/api';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    courseId: courseId || '68dd46a07f865f13c0fbda24' // Get from URL or fallback
  });
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setCourseLoading(true);
        const response = await getCourseById(courseId || '68dd46a07f865f13c0fbda24');
        setCourse(response.data.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details');
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.userName || !formData.userEmail) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await createOrder(formData);
      const orderData = orderResponse.data.data;

      // Check if test mode
      if (orderResponse.data.testMode) {
        // Test mode - simulate payment success
        alert('🎉 Test Mode: Payment Successful!\\n\\nYou will now be redirected to the course.');
        
        // Verify payment in test mode
        await verifyPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: 'test_payment_' + Date.now(),
          razorpay_signature: 'test_signature'
        });

        // Redirect to LMS
        setTimeout(() => {
          navigate('/lms');
        }, 1000);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Configure Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Imarticus Learning',
        description: course?.title || 'Course Enrollment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            alert('Payment Successful! Redirecting to course...');
            navigate('/lms');
          } catch (error) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: formData.userName,
          email: formData.userEmail
        },
        theme: {
          color: '#0d6157'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="payment-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading course...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="payment-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <h3>Course not found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/courses')}>
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const coursePrice = course.price || 500;
  const totalModules = course.modules?.length || 0;
  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="payment-card">
              <div className="row">
                {/* Course Info */}
                <div className="col-md-6 course-info-section">
                  <h2 className="mb-4">Course Details</h2>
                  <div className="course-info">
                    <img 
                      src={course.thumbnail 
                        ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${course.thumbnail}` 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&size=400&background=0d6157&color=fff&bold=true&format=png`
                      }
                      alt={course.title} 
                      className="course-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&size=400&background=0d6157&color=fff&bold=true&format=png`;
                      }}
                    />
                    <h4 className="mt-4">{course.title}</h4>
                    <p className="text-muted">
                      {course.description}
                    </p>
                    
                    <div className="course-features mt-4">
                      <div className="feature">
                        <span className="icon">📚</span>
                        <span>{totalModules} Modules • {totalLessons} Lessons</span>
                      </div>
                      <div className="feature">
                        <span className="icon">🎓</span>
                        <span>Certificate on Completion</span>
                      </div>
                      <div className="feature">
                        <span className="icon">🤖</span>
                        <span>AI-Powered Learning Tools</span>
                      </div>
                      <div className="feature">
                        <span className="icon">⏱️</span>
                        <span>Lifetime Access</span>
                      </div>
                    </div>

                    <div className="price-section mt-4">
                      <div className="price-label">Course Fee</div>
                      <div className="price">₹{coursePrice}</div>
                      <div className="price-note">One-time payment</div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="col-md-6 payment-form-section">
                  <h2 className="mb-4">Complete Your Enrollment</h2>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handlePayment}>
                    <div className="mb-3">
                      <label htmlFor="userName" className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="userEmail" className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        id="userEmail"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="payment-summary mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Course Fee</span>
                        <span>₹{coursePrice}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Taxes</span>
                        <span>₹0</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total Amount</span>
                        <span className="text-success">₹{coursePrice}</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>Proceed to Payment</>
                      )}
                    </button>

                    <div className="payment-note mt-3 text-center">
                      <small className="text-muted">
                        🔒 Secure payment powered by Razorpay
                      </small>
                    </div>
                  </form>

                  <div className="back-link mt-4 text-center">
                    <button 
                      className="btn btn-link" 
                      onClick={() => navigate('/courses')}
                    >
                      ← Back to Courses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
