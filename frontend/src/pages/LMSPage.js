import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { getCourseById, getAllCourses, summarizeDocument, updateProgress } from '../services/api';
import './LMSPage.css';

const LMSPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showCourseList, setShowCourseList] = useState(!courseId);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentCompletion, setCurrentCompletion] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [hasFetchedProgress, setHasFetchedProgress] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Get logged-in user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load course after user is set
      if (courseId) {
        fetchCourse(parsedUser);
      } else {
        fetchAllCourses();
        setCheckingEnrollment(false);
      }
    } else {
      // No user logged in
      if (courseId) {
        fetchCourse(null);
      } else {
        fetchAllCourses();
        setCheckingEnrollment(false);
      }
    }
    
    // Cleanup function to reset state when course changes
    return () => {
      setHasFetchedProgress(false);
    };
  }, [courseId]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = useCallback(async (userParam) => {
    // Prevent duplicate calls
    if (hasFetchedProgress) {
      console.log('⚠️ Progress already fetched, skipping...');
      return;
    }
    
    try {
      setCheckingEnrollment(true);
      
      if (!userParam) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        setHasFetchedProgress(true);
        return;
      }
      
      // If admin, skip enrollment check
      if (userParam.role === 'admin') {
        setIsEnrolled(true);
        setCheckingEnrollment(false);
        setHasFetchedProgress(true);
        console.log('✅ Admin access granted');
        return;
      }
      
      // For students, fetch latest profile (only once)
      console.log('🔍 Fetching enrollment status for student...');
      const { getProfile } = await import('../services/api');
      const response = await getProfile(userParam.id);
      
      if (response.data.success) {
        const userProfile = response.data.user;
        const enrollment = userProfile.enrolledCourses?.find(
          ec => ec.courseId?._id === courseId || ec.courseId === courseId
        );
        
        if (enrollment) {
          setIsEnrolled(true);
          setCurrentCompletion(enrollment.completionPercentage || 0);
          // Mark completed lessons
          const completed = new Set();
          enrollment.progress?.forEach(p => {
            completed.add(`${p.moduleId}-${p.lessonId}`);
          });
          setCompletedLessons(completed);
          console.log('✅ Loaded existing progress:', enrollment.completionPercentage + '%');
        } else {
          setIsEnrolled(false);
          console.log('❌ User not enrolled in this course');
        }
      }
      
      setHasFetchedProgress(true);
    } catch (error) {
      console.error('Error loading user progress:', error);
      setIsEnrolled(false);
      setHasFetchedProgress(true);
    } finally {
      setCheckingEnrollment(false);
    }
  }, [courseId, hasFetchedProgress]);

  const fetchCourse = useCallback(async (userParam = null) => {
    try {
      setLoading(true);
      const response = await getCourseById(courseId);
      const courseData = response.data.data;
      setCourse(courseData);
      setShowCourseList(false);
      
      // Load user's existing progress
      const currentUser = userParam || user;
      if (currentUser) {
        await loadUserProgress(currentUser);
      } else {
        setCheckingEnrollment(false);
        setIsEnrolled(false);
      }
      
      // Select first lesson by default
      if (courseData.modules && courseData.modules.length > 0) {
        const firstModule = courseData.modules[0];
        setActiveModule(firstModule._id);
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          setSelectedLesson({
            ...firstModule.lessons[0],
            moduleId: firstModule._id,
            moduleTitle: firstModule.title
          });
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setCheckingEnrollment(false);
    } finally {
      setLoading(false);
    }
  }, [courseId, user, loadUserProgress]);

  const handleLessonClick = async (lesson, moduleId, moduleTitle) => {
    setSelectedLesson({
      ...lesson,
      moduleId,
      moduleTitle
    });
    setShowSummary(false);
    setSummary('');
    
    // Mark lesson as complete when clicked
    await markLessonComplete(moduleId, lesson._id);
  };

  const markLessonComplete = async (moduleId, lessonId) => {
    if (!user || !courseId) {
      console.log('User or courseId not available');
      return;
    }

    // Check if already completed
    const lessonKey = `${moduleId}-${lessonId}`;
    if (completedLessons.has(lessonKey)) {
      console.log('Lesson already marked as complete');
      return;
    }

    try {
      console.log('Marking lesson complete:', { courseId, moduleId, lessonId });
      const response = await updateProgress({
        userId: user.id,
        courseId: courseId,
        moduleId: moduleId,
        lessonId: lessonId
      });

      if (response.data.success) {
        console.log('Progress updated:', response.data);
        setCompletedLessons(prev => new Set([...prev, lessonKey]));
        setCurrentCompletion(response.data.data.completionPercentage);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'progress-notification';
        notification.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          Lesson completed! Progress: ${response.data.data.completionPercentage}%
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already completed')) {
        setCompletedLessons(prev => new Set([...prev, lessonKey]));
      }
    }
  };

  const handleSummarize = async () => {
    if (!selectedLesson || !selectedLesson.document) {
      alert('No document available for this lesson');
      return;
    }

    setSummarizing(true);
    try {
      const response = await summarizeDocument({
        courseId: course._id,
        moduleId: selectedLesson.moduleId,
        lessonId: selectedLesson._id
      });

      if (response.data.success) {
        setSummary(response.data.data.summary);
        setShowSummary(true);
      } else if (response.data.testMode) {
        setSummary(response.data.summary);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format 1: /d/FILE_ID/view
      const match1 = url.match(/\/d\/(.*?)\//);
      if (match1) fileId = match1[1];
      
      // Format 2: /file/d/FILE_ID
      const match2 = url.match(/\/file\/d\/(.*?)(\/|$)/);
      if (match2) fileId = match2[1];
      
      // Format 3: id=FILE_ID
      const match3 = url.match(/[?&]id=([^&]+)/);
      if (match3) fileId = match3[1];
      
      if (fileId) {
        // Return preview URL for iframe embed
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url; // ReactPlayer handles YouTube URLs
    }
    
    // Handle direct video files (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return url;
    }
    
    // Return as-is for other formats
    return url;
  };

  if (loading) {
    return (
      <div className="lms-page">
        <div className="container text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  // Show course list if no course is selected
  if (showCourseList) {
    return (
      <div className="lms-page">
        {/* Top Navigation */}
        <nav className="lms-navbar">
          <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button className="btn btn-link text-white me-3" onClick={() => navigate('/')}>
                  ← Home
                </button>
                <h5 className="mb-0 text-white">My Learning Dashboard</h5>
              </div>
              <div className="d-flex align-items-center">
                {user && (
                  <span className="text-white me-3">Welcome, {user.name}</span>
                )}
                {user?.role === 'admin' && (
                  <button className="btn btn-outline-light btn-sm me-2" onClick={() => navigate('/admin-upload')}>
                    Admin Panel
                  </button>
                )}
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-5">
          <h2 className="mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <div className="alert alert-info">
              <h4>No courses available yet</h4>
              <p>Please check back later or contact support.</p>
              <button className="btn btn-success" onClick={() => navigate('/')}>
                Go to Home
              </button>
            </div>
          ) : (
            <div className="row">
              {courses.map((course) => (
                <div key={course._id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm hover-card">
                    <img 
                      src={course.thumbnail 
                        ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${course.thumbnail}` 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&size=400&background=0d6157&color=fff&bold=true&format=png`
                      } 
                      className="card-img-top" 
                      alt={course.title}
                      style={{height: '200px', objectFit: 'cover', backgroundColor: '#0d6157'}}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&size=400&background=0d6157&color=fff&bold=true&format=png`;
                      }}
                    />
                    <div className="card-body">
                      <span className="badge bg-success mb-2">{course.category}</span>
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text text-muted">{course.description}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="text-success fw-bold">₹{course.price}</span>
                        <button 
                          className="btn btn-success"
                          onClick={() => navigate(`/lms/${course._id}`)}
                        >
                          Start Learning →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="lms-page">
        <div className="container text-center py-5">
          <h3>Course not found</h3>
          <button className="btn btn-success mt-3" onClick={() => navigate('/lms')}>
            View All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lms-page">
      {/* Top Navigation */}
      <nav className="lms-navbar">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-link text-white me-3" 
                onClick={() => {
                  setCourse(null);
                  setShowCourseList(true);
                  navigate('/lms');
                }}
              >
                ← All Courses
              </button>
              <h5 className="mb-0 text-white">{course.title}</h5>
            </div>
            <div className="d-flex align-items-center">
              {user && (
                <span className="text-white me-3">Welcome, {user.name}</span>
              )}
              {user?.role === 'admin' && (
                <button className="btn btn-outline-light btn-sm me-2" onClick={() => navigate('/admin-upload')}>
                  Admin Panel
                </button>
              )}
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="lms-container">
        {/* Course Header with Tabs */}
        <div className="course-header-section">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="course-main-title mb-2">{course.title}</h2>
                <p className="course-subtitle mb-0">{course.description}</p>
              </div>
              {currentCompletion > 0 && (
                <div className="course-progress-badge">
                  <div className="progress" style={{width: '150px', height: '30px'}}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                      role="progressbar" 
                      style={{width: `${currentCompletion}%`}}
                    >
                      {currentCompletion}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Tabs */}
            <ul className="nav nav-tabs lms-tabs mt-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'curriculum' ? 'active' : ''}`}
                  onClick={() => setActiveTab('curriculum')}
                >
                  Curriculum
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'instructors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('instructors')}
                >
                  Instructors
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faq')}
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-section">
          {activeTab === 'description' && (
            <div className="container-fluid py-4">
              <div className="row">
                <div className="col-lg-8">
                  <div className="description-content">
                    <h3>About This Course</h3>
                    <p className="lead">{course.description}</p>
                    
                    <h4 className="mt-4">What You'll Learn</h4>
                    <ul className="learning-outcomes">
                      <li>Master fundamental concepts and algorithms in Machine Learning</li>
                      <li>Understand supervised and unsupervised learning techniques</li>
                      <li>Work with real-world datasets and practical applications</li>
                      <li>Build and evaluate machine learning models</li>
                      <li>Apply ML techniques to solve business problems</li>
                    </ul>

                    <h4 className="mt-4">Requirements</h4>
                    <ul>
                      <li>Basic understanding of Python programming</li>
                      <li>Fundamental knowledge of mathematics and statistics</li>
                      <li>Passion for learning and problem-solving</li>
                    </ul>

                    <h4 className="mt-4">Course Features</h4>
                    <div className="row mt-3">
                      <div className="col-md-6 mb-3">
                        <div className="feature-card">
                          <span className="feature-icon">📚</span>
                          <div>
                            <h6>Comprehensive Content</h6>
                            <p className="text-muted mb-0">{course.modules.length} modules covering all essential topics</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="feature-card">
                          <span className="feature-icon">🎥</span>
                          <div>
                            <h6>Video Lectures</h6>
                            <p className="text-muted mb-0">High-quality video content for each lesson</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="feature-card">
                          <span className="feature-icon">🤖</span>
                          <div>
                            <h6>AI-Powered Learning</h6>
                            <p className="text-muted mb-0">Get instant AI summaries of course materials</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="feature-card">
                          <span className="feature-icon">📄</span>
                          <div>
                            <h6>Study Materials</h6>
                            <p className="text-muted mb-0">Downloadable documents and resources</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="course-info-card sticky-top">
                    <h5>Course Information</h5>
                    <div className="info-item">
                      <strong>Duration:</strong> Self-paced
                    </div>
                    <div className="info-item">
                      <strong>Level:</strong> Beginner to Intermediate
                    </div>
                    <div className="info-item">
                      <strong>Modules:</strong> {course.modules.length}
                    </div>
                    <div className="info-item">
                      <strong>Lessons:</strong> {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                    </div>
                    <div className="info-item">
                      <strong>Certificate:</strong> Yes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <>
              {checkingEnrollment ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Verifying...</span>
                  </div>
                  <p className="mt-2 mb-0 text-muted small">Verifying enrollment...</p>
                </div>
              ) : !isEnrolled && user?.role !== 'admin' ? (
                <div className="container-fluid py-5">
                  <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                      <div className="card text-center border-warning shadow">
                        <div className="card-body p-5">
                          <div className="mb-4">
                            <i className="bi bi-lock-fill text-warning" style={{fontSize: '4rem'}}></i>
                          </div>
                          <h3 className="card-title mb-3">Course Locked</h3>
                          <p className="card-text text-muted mb-4">
                            You need to enroll in this course to access the content. 
                            Get lifetime access to all course materials, video lectures, and certificates.
                          </p>
                          <div className="mb-4">
                            <h4 className="text-success">
                              ₹{(course.price / 100).toLocaleString('en-IN')}
                            </h4>
                            <small className="text-muted">One-time payment</small>
                          </div>
                          <button 
                            className="btn btn-success btn-lg px-5"
                            onClick={() => navigate(`/payment/${courseId}`)}
                          >
                            <i className="bi bi-cart-check me-2"></i>
                            Enroll Now
                          </button>
                          <div className="mt-4">
                            <button 
                              className="btn btn-link text-muted"
                              onClick={() => setActiveTab('description')}
                            >
                              View Course Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
            <div className="row g-0">
              {/* Sidebar - Course Content */}
              <div className="col-lg-4 sidebar">
                <div className="sidebar-header">
                  <h5>Course Content</h5>
                  <p className="text-muted mb-0">
                    {course.modules.length} Modules • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                  </p>
                </div>

                <div className="modules-list">
                  {course.modules.map((module) => (
                    <div key={module._id} className="module-item">
                      <div 
                        className={`module-header ${activeModule === module._id ? 'active' : ''}`}
                        onClick={() => setActiveModule(activeModule === module._id ? null : module._id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="module-title">{module.title}</span>
                          <span className="module-icon">
                            {activeModule === module._id ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>

                      {activeModule === module._id && (
                        <div className="lessons-list">
                          {module.lessons.map((lesson) => {
                            const lessonKey = `${module._id}-${lesson._id}`;
                            const isCompleted = completedLessons.has(lessonKey);
                            return (
                              <div
                                key={lesson._id}
                                className={`lesson-item ${selectedLesson?._id === lesson._id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => handleLessonClick(lesson, module._id, module.title)}
                              >
                                <div className="lesson-icon">{isCompleted ? '✓' : '▶'}</div>
                                <div className="lesson-info">
                                  <div className="lesson-title">{lesson.title}</div>
                                  {lesson.duration && (
                                    <div className="lesson-duration">{lesson.duration}</div>
                                  )}
                                  {lesson.document && (
                                    <div className="lesson-has-doc">📄 Document Available</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content - Video Player */}
              <div className="col-lg-8 main-content">
                {selectedLesson ? (
                  <>
                    <div className="video-container">
                      {selectedLesson.videoUrl.includes('drive.google.com') ? (
                        // Use iframe for Google Drive videos
                        <iframe
                          src={getEmbedUrl(selectedLesson.videoUrl)}
                          width="100%"
                          height="100%"
                          allow="autoplay"
                          style={{ border: 'none' }}
                          title={selectedLesson.title}
                        ></iframe>
                      ) : (
                        // Use ReactPlayer for other video sources
                        <ReactPlayer
                          url={getEmbedUrl(selectedLesson.videoUrl)}
                          controls
                          width="100%"
                          height="100%"
                          config={{
                            file: {
                              attributes: {
                                controlsList: 'nodownload'
                              }
                            }
                          }}
                        />
                      )}
                    </div>

                    <div className="lesson-details">
                      <div className="breadcrumb">
                        <span className="text-muted">{selectedLesson.moduleTitle}</span>
                      </div>
                      <h3 className="lesson-title">{selectedLesson.title}</h3>
                      {selectedLesson.description && (
                        <p className="lesson-description">{selectedLesson.description}</p>
                      )}

                      {/* Document Section */}
                      {selectedLesson.document && (
                        <div className="document-section mt-4">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <span className="document-icon me-3">📄</span>
                                  <div>
                                    <h6 className="mb-1">Lesson Document</h6>
                                    <small className="text-muted">{selectedLesson.document.filename}</small>
                                  </div>
                                </div>
                                <button 
                                  className="btn btn-success" 
                                  onClick={handleSummarize}
                                  disabled={summarizing}
                                >
                                  {summarizing ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Summarizing...
                                    </>
                                  ) : (
                                    <>🤖 Summarise with AI</>
                                  )}
                                </button>
                              </div>

                              {showSummary && summary && (
                                <div className="summary-box mt-3">
                                  <h6 className="mb-3">
                                    <span className="badge bg-success me-2">AI Summary</span>
                                  </h6>
                                  <div className="summary-content">
                                    {summary}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-lesson-selected">
                    <div className="text-center">
                      <h4>Welcome to {course.title}</h4>
                      <p className="text-muted">Select a lesson from the sidebar to begin</p>
                      <div className="mt-4">
                        <img 
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400" 
                          alt="Learning" 
                          className="img-fluid rounded"
                          style={{maxWidth: '400px'}}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
              )}
            </>
          )}

          {activeTab === 'instructors' && (
            <div className="container-fluid py-4">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <h3 className="mb-4">About the Instructors</h3>
                  
                  <div className="instructor-card mb-4">
                    <div className="row">
                      <div className="col-md-3">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" 
                          alt="Instructor" 
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="col-md-9">
                        <h4>Dr. Rajesh Kumar</h4>
                        <p className="text-muted mb-3">Lead ML Engineer | PhD in Computer Science</p>
                        <p>
                          Dr. Rajesh Kumar is a renowned expert in Machine Learning with over 15 years of experience 
                          in both academia and industry. He has published numerous research papers and has worked 
                          with leading tech companies on cutting-edge ML projects.
                        </p>
                        <div className="instructor-stats mt-3">
                          <span className="badge bg-light text-dark me-2">⭐ 4.8 Rating</span>
                          <span className="badge bg-light text-dark me-2">👥 50,000+ Students</span>
                          <span className="badge bg-light text-dark">📚 12 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="instructor-card">
                    <div className="row">
                      <div className="col-md-3">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300" 
                          alt="Instructor" 
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="col-md-9">
                        <h4>Priya Sharma</h4>
                        <p className="text-muted mb-3">Senior Data Scientist | AI Specialist</p>
                        <p>
                          Priya Sharma is a passionate educator and data scientist with expertise in practical 
                          applications of Machine Learning. She has mentored hundreds of students and helped them 
                          transition into successful ML careers.
                        </p>
                        <div className="instructor-stats mt-3">
                          <span className="badge bg-light text-dark me-2">⭐ 4.9 Rating</span>
                          <span className="badge bg-light text-dark me-2">👥 35,000+ Students</span>
                          <span className="badge bg-light text-dark">📚 8 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="container-fluid py-4">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <h3 className="mb-4">Frequently Asked Questions</h3>
                  
                  <div className="accordion" id="faqAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                          What are the prerequisites for this course?
                        </button>
                      </h2>
                      <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Basic knowledge of Python programming and fundamental mathematics is recommended. 
                          However, we cover all essential concepts from scratch, making it suitable for beginners.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                          How long do I have access to the course?
                        </button>
                      </h2>
                      <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          You get lifetime access to all course materials, including future updates and additions.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                          Will I receive a certificate upon completion?
                        </button>
                      </h2>
                      <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Yes, you will receive a verified certificate of completion that you can share on LinkedIn 
                          and add to your resume.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                          What is the AI summarization feature?
                        </button>
                      </h2>
                      <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Our AI-powered tool uses Azure OpenAI to automatically generate concise summaries of 
                          lesson documents, helping you quickly grasp key concepts and review materials efficiently.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                          Can I download the course materials?
                        </button>
                      </h2>
                      <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Yes, all lesson documents and materials are available for download. However, video 
                          content is available for streaming only.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                          Is there any support available if I get stuck?
                        </button>
                      </h2>
                      <div id="faq6" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Yes, we provide discussion forums and email support. Our instructors and teaching 
                          assistants are available to help you with any questions or challenges.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LMSPage;
