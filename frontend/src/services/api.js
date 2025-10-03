import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = (userId) => api.get(`/auth/profile/${userId}`);
export const enrollInCourse = (data) => api.post('/auth/enroll', data);
export const updateProgress = (data) => api.post('/auth/progress', data);

// Course APIs
export const getAllCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const getLesson = (courseId, moduleId, lessonId) => 
  api.get(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);

// Payment APIs
export const createOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify-payment', data);
export const getPaymentStatus = (orderId) => api.get(`/payment/status/${orderId}`);

// Admin APIs
export const getCoursesForAdmin = () => api.get('/admin/courses');
export const createCourse = (data) => api.post('/admin/courses', data);
export const updateCourse = (id, data) => api.put(`/admin/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/admin/courses/${id}`);
export const uploadDocument = (formData) => 
  api.post('/admin/upload-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
export const summarizeDocument = (data) => api.post('/admin/summarize-document', data);

// Analytics API
export const getAnalytics = () => api.get('/admin/analytics');
export const getStudentProgress = () => api.get('/admin/student-progress');

export default api;
