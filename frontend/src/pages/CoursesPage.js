import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllCourses } from '../services/api';
import './CoursesPage.css';

const CoursesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const selectedInterest = location.state?.interest || 'all';

  // Smart URL handler for images
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) {
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
    }
    // If it's already a full URL (like Unsplash), use it directly
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
      return thumbnail;
    }
    // Otherwise, prepend the server URL
    const serverURL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${serverURL}${thumbnail}`;
  };

  useEffect(() => {
    fetchCourses();
    if (selectedInterest !== 'all') {
      setFilter(selectedInterest);
    }
  }, [selectedInterest]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/auth', { state: { from: `/payment/${courseId}` } });
    } else {
      navigate(`/payment/${courseId}`);
    }
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => 
        course.category?.toLowerCase() === filter.toLowerCase() ||
        course.title.toLowerCase().includes(filter.toLowerCase())
      );

  if (loading) {
    return (
      <div className="courses-page">
        <div className="container text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          <button className="navbar-brand btn btn-link text-decoration-none" onClick={() => navigate('/')}>
            <span style={{fontWeight: 'bold', fontSize: '24px', color: '#0d6157'}}>
              IMARTICUS LEARNING
            </span>
          </button>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate('/')}>Home</button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-success ms-2" onClick={() => navigate('/auth')}>Login</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="courses-hero py-5 bg-light">
        <div className="container">
          <h1 className="text-center mb-4">Explore Our Courses</h1>
          <p className="text-center text-muted mb-5">
            Choose from our wide range of industry-leading programs
          </p>

          {/* Filter Buttons */}
          <div className="filter-section d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button 
              className={`btn ${filter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('all')}
            >
              All Courses
            </button>
            <button 
              className={`btn ${filter === 'finance' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('finance')}
            >
              Finance
            </button>
            <button 
              className={`btn ${filter === 'technology' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('technology')}
            >
              Technology
            </button>
            <button 
              className={`btn ${filter === 'analytics' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`btn ${filter === 'marketing' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('marketing')}
            >
              Marketing
            </button>
            <button 
              className={`btn ${filter === 'management' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('management')}
            >
              Management
            </button>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="courses-grid py-5">
        <div className="container">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-5">
              <h4>No courses found</h4>
              <p className="text-muted">Try selecting a different category</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredCourses.map((course) => (
                <div key={course._id} className="col-md-6 col-lg-4">
                  <div className="course-card h-100">
                    <div className="course-card-img">
                      <img 
                        src={getThumbnailUrl(course.thumbnail)} 
                        alt={course.title}
                        className="img-fluid"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
                        }}
                      />
                      {course.duration && (
                        <span className="course-duration">{course.duration}</span>
                      )}
                    </div>
                    <div className="course-card-body">
                      {course.category && (
                        <span className="course-category">{course.category}</span>
                      )}
                      <h4 className="course-title">{course.title}</h4>
                      <p className="course-description">{course.description}</p>
                      
                      <div className="course-meta mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">
                            <i className="bi bi-book"></i> {course.modules?.length || 0} Modules
                          </span>
                          <span className="text-muted">
                            <i className="bi bi-person"></i> {course.instructor}
                          </span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="course-price">
                            <span className="price-amount">₹{course.price || 500}</span>
                          </div>
                          <button 
                            className="btn btn-success"
                            onClick={() => handleEnroll(course._id)}
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; 2024 Imarticus Learning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CoursesPage;
