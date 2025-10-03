import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses, getProfile } from '../services/api';
import './StudentDashboard.css';
import logo from '../assests/logo.svg';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, myGroups, explore
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Data Science');
  const [courseFilter, setCourseFilter] = useState('Free');

  useEffect(() => {
    // Get logged-in user
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch user's enrolled courses with progress
      fetchUserProfile(parsedUser.id);
    }
    
    fetchCourses();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for userId:', userId);
      const response = await getProfile(userId);
      console.log('Profile response:', response.data);
      
      if (response.data.success) {
        const userProfile = response.data.user;
        // Extract enrolled courses with their details
        const enrolled = userProfile.enrolledCourses || [];
        console.log('Enrolled courses from API:', enrolled);
        setEnrolledCourses(enrolled);
        console.log('Enrolled courses loaded:', enrolled.length);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      const allCourses = response.data.data || [];
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) {
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
    }
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
      return thumbnail;
    }
    return `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${thumbnail}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleCourseClick = (courseId) => {
    navigate(`/lms/${courseId}`);
  };

  // Dashboard View
  const DashboardView = () => (
    <div className="dashboard-content">
      <h2 className="section-title">Recent Activity</h2>
      
      {enrolledCourses.length > 0 ? (
        <div className="activity-section">
          {enrolledCourses.map((enrollment) => {
            const course = enrollment.courseId;
            const completionPercentage = enrollment.completionPercentage || 0;
            
            return (
              <div key={course._id} className="activity-card">
                <div className="activity-image-placeholder">
                  <img 
                    src={getThumbnailUrl(course.thumbnail)} 
                    alt={course.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
                    }}
                  />
                </div>
                <div className="activity-info">
                  <h3>{course.title}</h3>
                  <p className="batch-info">
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {completionPercentage}% {completionPercentage === 100 ? '✓' : ''}
                    </span>
                  </div>
                </div>
                <button 
                  className="continue-btn"
                  onClick={() => handleCourseClick(course._id)}
                >
                  {completionPercentage === 0 ? 'Start' : 'Continue'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-courses-message">
          <p>You haven't enrolled in any courses yet.</p>
          <button 
            className="explore-courses-btn"
            onClick={() => setActiveView('explore')}
          >
            Explore Courses
          </button>
        </div>
      )}
    </div>
  );

  // My Groups View (Shows Enrolled Courses)
  const MyGroupsView = () => (
    <div className="dashboard-content">
      {!selectedGroup ? (
        <>
          <h2 className="section-title">MY GROUPS</h2>
          {enrolledCourses.length > 0 ? (
            <div className="groups-list">
              {enrolledCourses.map((enrollment) => {
                const course = enrollment.courseId;
                return (
                  <div 
                    key={course._id} 
                    className="group-item"
                    onClick={() => setSelectedGroup(enrollment)}
                  >
                    <span className="group-name">{course.title}</span>
                    <span className="group-progress">{enrollment.completionPercentage || 0}% Complete</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-courses-message">
              <p>You haven't enrolled in any courses yet.</p>
              <button 
                className="explore-courses-btn"
                onClick={() => setActiveView('explore')}
              >
                Explore Courses
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="group-detail">
          <button className="back-btn" onClick={() => setSelectedGroup(null)}>
            ← Back
          </button>
          
          <div className="group-header">
            <img 
              src={getThumbnailUrl(selectedGroup.courseId.thumbnail)} 
              alt={selectedGroup.courseId.title}
              className="group-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
              }}
            />
            <div className="group-header-text">
              <h2>{selectedGroup.courseId.title}</h2>
              <p className="group-code">
                Enrolled: {new Date(selectedGroup.enrolledAt).toLocaleDateString()}
              </p>
              <p className="group-progress-detail">
                Progress: {selectedGroup.completionPercentage || 0}% Complete
              </p>
            </div>
          </div>

          <div className="group-permission">
            <span>Your Course</span>
          </div>

          <div className="group-sections">
            <div 
              className="group-section-card"
              onClick={() => handleCourseClick(selectedGroup.courseId._id)}
            >
              <div className="section-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                </svg>
              </div>
              <span>Courses</span>
              <span className="arrow">›</span>
            </div>

            <div className="group-section-card">
              <div className="section-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" stroke="currentColor" fill="none"/>
                </svg>
              </div>
              <span>Discussion</span>
              <span className="arrow">›</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Explore View
  const ExploreView = () => {
    const categories = ['Data Science', 'Finance', 'AI & ML'];
    const filteredCourses = courses.filter(course => {
      if (selectedCategory === 'Data Science') return course.category?.toLowerCase() === 'technology';
      if (selectedCategory === 'Finance') return course.category?.toLowerCase() === 'finance';
      if (selectedCategory === 'AI & ML') return course.category?.toLowerCase() === 'analytics';
      return true;
    });

    return (
      <div className="dashboard-content">
        <h2 className="section-title">Find Your Next Big Opportunity to Grow</h2>
        
        <div className="filter-buttons mb-3">
          <button 
            className={`filter-btn ${courseFilter === 'Free' ? 'active' : ''}`}
            onClick={() => setCourseFilter('Free')}
          >
            Free
          </button>
          <button 
            className={`filter-btn ${courseFilter === 'Paid' ? 'active' : ''}`}
            onClick={() => setCourseFilter('Paid')}
          >
            Paid
          </button>
        </div>

        <div className="category-pills mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="category-icon">
                {cat === 'Data Science' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3v2H5v2H3V3h6zm0 4v2H3V7h6zm8 0v2h-6V7h6zm0 4v2h-6v-2h6zm0 4v2h-6v-2h6zm-8 0v2H3v-2h6z"/>
                  </svg>
                ) : cat === 'Finance' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 2c-1.25 0-2.42.37-3.43 1H4v16h6.07c1.01.63 2.18 1 3.43 1 3.59 0 6.5-2.91 6.5-6.5S17.09 2 13.5 2zM7 18H6V4h4c-.64.81-1 1.8-1 3 0 1.2.36 2.19 1 3H7v8zm6.5 0c-2.49 0-4.5-2.01-4.5-4.5S10.51 9 13 9s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
                    <circle cx="13.5" cy="13.5" r="1.5"/>
                  </svg>
                )}
              </span>
              {cat}
            </button>
          ))}
        </div>

        <h3 className="section-subtitle">Our Top Free Courses</h3>

        <div className="explore-courses-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="explore-course-card">
              <img 
                src={getThumbnailUrl(course.thumbnail)} 
                alt={course.title}
                className="explore-course-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
                }}
              />
              <div className="explore-course-content">
                <span className="course-badge">{course.category?.toUpperCase()}</span>
                <span className="course-rating">
                  4.5
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#FFD700" style={{marginLeft: '4px', display: 'inline-block'}}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </span>
                <h4>{course.title}</h4>
                <span className="course-level">
                  {course.price > 2000 ? 'Advanced' : course.price > 1500 ? 'Intermediate' : 'Beginner'}
                </span>
                <div className="course-meta">
                  <span>✓ {course.duration}</span>
                  <span>3.6K+ Learners</span>
                </div>
                <div className="course-actions">
                  <button 
                    className="view-course-btn"
                    onClick={() => navigate(`/courses`)}
                  >
                    View Course
                  </button>
                  <button 
                    className="start-learning-btn"
                    onClick={() => handleCourseClick(course._id)}
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Imarticus Learning" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <span>Dashboard</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'myGroups' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('myGroups');
              setSelectedGroup(null);
            }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </span>
            <span>My Groups</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveView('explore')}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Explore</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="help-section">
            <p>Facing problems?</p>
            <button className="help-btn">Get help</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <h1 className="page-title">
            {activeView === 'dashboard' ? 'Dashboard' : 
             activeView === 'myGroups' && selectedGroup ? selectedGroup.title :
             activeView === 'myGroups' ? 'Dashboard' : 
             'Dashboard'}
          </h1>

          <div className="topbar-actions">
            <button className="notification-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="user-menu">
              <button className="user-avatar">
                {user?.name?.charAt(0) || 'V'}
              </button>
              <div className="user-dropdown">
                <span className="user-name">{user?.name || 'Vinay Jain'}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView />}
              {activeView === 'myGroups' && <MyGroupsView />}
              {activeView === 'explore' && <ExploreView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
