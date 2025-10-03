import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../services/api';
import './AuthPage.css';
import logo from '../assests/logo.svg';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      if (response.data.success) {
        // Store user data AND JWT token in localStorage
        const user = response.data.user;
        const token = response.data.token;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        console.log('✅ Login successful! User:', user.name, 'Role:', user.role);
        console.log('✅ JWT Token stored in localStorage');
        
        // Redirect based on user role
        if (user.role === 'admin') {
          // Admin goes directly to admin dashboard
          navigate('/admin-upload');
        } else {
          // Students go to Student Dashboard
          const from = location.state?.from || '/dashboard';
          navigate(from);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Image */}
        <div className="auth-left">
          <div className="auth-image-wrapper">
            <img 
              src="https://media.istockphoto.com/id/932822684/photo/college-students.jpg?s=612x612&w=0&k=20&c=SJfUDXioFHFGBn72EXX46-MDxKSQVdU7qqfLc42jEUQ=" 
              alt="Student with thumbs up" 
              className="auth-student-image"
            />
            <div className="auth-wings-bg"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            {/* Logo */}
            <div className="auth-logo mb-4">
              <img src={logo} alt="Imarticus Learning" style={{height: '60px'}} />
            </div>

            <h2 className="auth-heading mb-4">{isLogin ? 'Log In' : 'Sign Up'}</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control auth-input"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Enter your Full Name"
                  />
                </div>
              )}

              <div className="mb-3">
                <input
                  type="email"
                  className="form-control auth-input"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your Email here"
                />
              </div>

              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className="form-control auth-input"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password here"
                  minLength="6"
                />
                <span className="password-toggle">
                  <i className="bi bi-eye"></i>
                </span>
              </div>

              {isLogin && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <a href="#" className="auth-link text-success">Login With OTP</a>
                  <a href="#" className="auth-link text-success">Forgot Password ?</a>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success auth-submit-btn w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>{isLogin ? 'Log In' : 'Sign Up'}</>
                )}
              </button>

              <div className="auth-divider my-4">
                <span>Or</span>
              </div>

              <button type="button" className="btn btn-outline-secondary auth-alt-btn w-100 mb-3">
                <i className="bi bi-phone me-2"></i>
                Log in with Mobile Number
              </button>

              <button type="button" className="btn btn-outline-secondary auth-alt-btn w-100 mb-3">
                <i className="bi bi-person me-2"></i>
                Log in with Username
              </button>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <button type="button" className="btn btn-outline-secondary auth-social-btn w-100">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="me-2" style={{width: '20px'}} />
                    Google
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-outline-primary auth-social-btn w-100">
                    <i className="bi bi-facebook me-2"></i>
                    Facebook
                  </button>
                </div>
              </div>

              <div className="text-center">
                <span className="text-muted">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-success"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setFormData({ name: '', email: '', password: '' });
                    }}
                  >
                    {isLogin ? 'Sign up for free' : 'Log In'}
                  </button>
                </span>
              </div>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-muted"
                  onClick={() => navigate('/')}
                >
                  ← Back to Home
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
