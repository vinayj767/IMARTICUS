import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesForAdmin, uploadDocument, createCourse, updateCourse, deleteCourse, getAnalytics, getStudentProgress } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Check if user is admin
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      alert('Access denied! Admin only.');
      navigate('/dashboard');
    }
  }, [navigate]);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [studentProgressData, setStudentProgressData] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  // Course form state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: 'Imarticus Learning',
    price: 500,
    category: 'technology',
    duration: '',
    thumbnail: ''
  });

  useEffect(() => {
    fetchCourses();
    if (activeTab === 'analytics') {
      fetchAnalytics();
      fetchStudentProgress();
    }
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      const response = await getCoursesForAdmin();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Please login as admin to view analytics');
        setMessageType('danger');
        return;
      }

      console.log('Fetching analytics with JWT token...');
      const response = await getAnalytics();

      if (response.data.success) {
        console.log('Analytics data received:', response.data.data);
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMessage(error.response?.data?.message || 'Failed to load analytics data');
      setMessageType('danger');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      setProgressLoading(true);
      const response = await getStudentProgress();
      if (response.data.success) {
        console.log('Student progress data received:', response.data.data);
        setStudentProgressData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSelectedModule('');
    setSelectedLesson('');
  };

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
    setSelectedLesson('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setMessage('Please select a PDF file');
        setMessageType('danger');
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage('File size should be less than 10MB');
        setMessageType('danger');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedModule || !selectedLesson || !file) {
      setMessage('Please fill all fields and select a file');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('moduleId', selectedModule);
      formData.append('lessonId', selectedLesson);
      formData.append('document', file);

      const response = await uploadDocument(formData);
      
      if (response.data.success) {
        setMessage('Document uploaded successfully!');
        setMessageType('success');
        setSelectedCourse('');
        setSelectedModule('');
        setSelectedLesson('');
        setFile(null);
        document.getElementById('fileInput').value = '';
        fetchCourses();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Failed to upload document');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteCourse(courseId);
      setMessage('Course deleted successfully!');
      setMessageType('success');
      fetchCourses();
    } catch (error) {
      console.error('Delete error:', error);
      setMessage(error.response?.data?.message || 'Failed to delete course');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor || 'Imarticus Learning',
      price: course.price || 500,
      category: course.category || 'technology',
      duration: course.duration || '',
      thumbnail: course.thumbnail || ''
    });
    setShowCourseModal(true);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      instructor: 'Imarticus Learning',
      price: 500,
      category: 'technology',
      duration: '',
      thumbnail: ''
    });
    setShowCourseModal(true);
  };

  const handleCourseFormChange = (e) => {
    setCourseForm({
      ...courseForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const courseData = {
        ...courseForm,
        modules: editingCourse?.modules || []
      };

      if (editingCourse) {
        await updateCourse(editingCourse._id, courseData);
        setMessage('Course updated successfully!');
      } else {
        await createCourse(courseData);
        setMessage('Course created successfully!');
      }
      
      setMessageType('success');
      setShowCourseModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Save error:', error);
      setMessage(error.response?.data?.message || 'Failed to save course');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const getCourse = () => courses.find(c => c._id === selectedCourse);
  const getModule = () => getCourse()?.modules.find(m => m._id === selectedModule);

  return (
    <div className="admin-dashboard">
      {/* Admin Navigation */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-white me-3" onClick={() => navigate('/')}>
              ← Home
            </button>
            <h5 className="mb-0 text-white">Admin Dashboard</h5>
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-light btn-sm me-2" onClick={() => navigate('/lms')}>
              View LMS
            </button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 sidebar-admin">
            <div className="admin-menu">
              <h6 className="text-muted mb-3">ADMIN MENU</h6>
              <button 
                className={`menu-item ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <i className="bi bi-cloud-upload me-2"></i>Upload Documents
              </button>
              <button 
                className={`menu-item ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                <i className="bi bi-book me-2"></i>Manage Courses
              </button>
              <button 
                className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-graph-up me-2"></i>Analytics
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 main-admin-content">
            {message && (
              <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="content-section">
                <h3 className="mb-4">
                  <i className="bi bi-cloud-upload me-2"></i>Upload Course Documents
                </h3>
                <p className="text-muted">Upload PDF documents to enhance lessons with AI-powered summaries</p>

                <form onSubmit={handleSubmit} className="upload-form">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select Course *</label>
                      <select
                        className="form-select"
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        required
                      >
                        <option value="">Choose a course...</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select Module *</label>
                      <select
                        className="form-select"
                        value={selectedModule}
                        onChange={handleModuleChange}
                        required
                        disabled={!selectedCourse}
                      >
                        <option value="">Choose a module...</option>
                        {getCourse()?.modules.map(module => (
                          <option key={module._id} value={module._id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select Lesson *</label>
                      <select
                        className="form-select"
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        required
                        disabled={!selectedModule}
                      >
                        <option value="">Choose a lesson...</option>
                        {getModule()?.lessons.map(lesson => (
                          <option key={lesson._id} value={lesson._id}>
                            {lesson.title} {lesson.document && '✓'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Upload PDF *</label>
                      <input
                        type="file"
                        className="form-control"
                        id="fileInput"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                      />
                      {file && (
                        <small className="text-success">
                          ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Manage Courses Tab */}
            {activeTab === 'manage' && (
              <div className="content-section">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="mb-0">📚 Manage Courses</h3>
                  <button className="btn btn-success" onClick={handleAddCourse}>
                    + Add New Course
                  </button>
                </div>
                
                <div className="courses-list">
                  {courses.map(course => (
                    <div key={course._id} className="course-item-admin card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h5>{course.title}</h5>
                            <p className="text-muted mb-2">
                              {course.modules?.length || 0} Modules • 
                              {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} Lessons
                            </p>
                            <div className="d-flex gap-2 flex-wrap">
                              <span className="badge bg-success">₹{course.price || 500}</span>
                              <span className="badge bg-info">{course.category || 'technology'}</span>
                              <span className="badge bg-secondary">{course.instructor || 'Imarticus'}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handleEditCourse(course)}
                            >
                               Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="content-section">
                <h3 className="mb-4">
                  <i className="bi bi-graph-up me-2"></i>Analytics Dashboard
                </h3>
                
                {analyticsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading analytics data...</p>
                  </div>
                ) : analyticsData ? (
                  <>
                    {/* Core Stats */}
                    <div className="row mb-4">
                      <div className="col-md-3 mb-3">
                        <div className="card analytics-card bg-primary text-white">
                          <div className="card-body text-center">
                            <h2 className="display-4">{analyticsData.coreStats.totalStudents}</h2>
                            <p className="mb-0">
                              <i className="bi bi-people me-2"></i>Total Students
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card analytics-card bg-success text-white">
                          <div className="card-body text-center">
                            <h2 className="display-4">{analyticsData.coreStats.totalCourses}</h2>
                            <p className="mb-0">
                              <i className="bi bi-book me-2"></i>Total Courses
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card analytics-card bg-info text-white">
                          <div className="card-body text-center">
                            <h2 className="display-4">{analyticsData.coreStats.totalEnrollments}</h2>
                            <p className="mb-0">
                              <i className="bi bi-mortarboard me-2"></i>Total Enrollments
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card analytics-card bg-warning text-white">
                          <div className="card-body text-center">
                            <h2 className="display-4">₹{analyticsData.coreStats.totalRevenue}</h2>
                            <p className="mb-0">
                              <i className="bi bi-currency-rupee me-2"></i>Total Revenue
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Student Progress Table */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                              <i className="bi bi-person-check me-2"></i>Student Progress Tracker
                            </h5>
                          </div>
                          <div className="card-body">
                            {progressLoading ? (
                              <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                                <span className="ms-2">Loading student data...</span>
                              </div>
                            ) : studentProgressData.length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-hover table-striped">
                                  <thead className="table-dark">
                                    <tr>
                                      <th>Student Name</th>
                                      <th>Email</th>
                                      <th>Enrolled Courses</th>
                                      <th>Avg. Completion</th>
                                      <th>Course Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {studentProgressData.map((student) => (
                                      <tr key={student.studentId}>
                                        <td><strong>{student.studentName}</strong></td>
                                        <td><small className="text-muted">{student.studentEmail}</small></td>
                                        <td>
                                          <span className="badge bg-info">{student.totalEnrollments}</span>
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="progress me-2" style={{width: '100px', height: '20px'}}>
                                              <div 
                                                className={`progress-bar ${
                                                  student.averageCompletion >= 70 ? 'bg-success' :
                                                  student.averageCompletion >= 40 ? 'bg-warning' :
                                                  'bg-danger'
                                                }`}
                                                style={{width: `${student.averageCompletion}%`}}
                                              ></div>
                                            </div>
                                            <strong>{student.averageCompletion}%</strong>
                                          </div>
                                        </td>
                                        <td>
                                          {student.courses.length > 0 ? (
                                            <div className="small">
                                              {student.courses.map((course, idx) => (
                                                <div key={idx} className="mb-1">
                                                  <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                                                    {course.courseName}
                                                  </span>
                                                  <span className={`badge ms-2 ${
                                                    course.completionPercentage >= 70 ? 'bg-success' :
                                                    course.completionPercentage >= 40 ? 'bg-warning' :
                                                    'bg-danger'
                                                  }`}>
                                                    {course.completionPercentage}%
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-muted">No enrollments</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-muted text-center">No student data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Popularity & Completion */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-success text-white">
                            <h5 className="mb-0">
                              <i className="bi bi-bar-chart me-2"></i>Top 5 Popular Courses
                            </h5>
                          </div>
                          <div className="card-body">
                            {analyticsData.coursePopularity.length > 0 ? (
                              <div className="chart-container">
                                {analyticsData.coursePopularity.map((course, index) => (
                                  <div key={course.courseId} className="progress-bar-item mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="text-truncate" style={{maxWidth: '70%'}}>
                                        {index + 1}. {course.courseName}
                                      </span>
                                      <strong>{course.enrollments} students</strong>
                                    </div>
                                    <div className="progress" style={{height: '25px'}}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        role="progressbar" 
                                        style={{
                                          width: `${(course.enrollments / analyticsData.coursePopularity[0].enrollments) * 100}%`
                                        }}
                                      >
                                        {course.enrollments}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted">No enrollment data available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Course Completion Rates */}
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                              <i className="bi bi-check-circle me-2"></i>Course Completion Rates
                            </h5>
                          </div>
                          <div className="card-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {analyticsData.studentProgress.length > 0 ? (
                              analyticsData.studentProgress.map((progress) => (
                                <div key={progress.courseId} className="mb-3">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="text-truncate" style={{maxWidth: '60%'}}>
                                      {progress.courseName}
                                    </span>
                                    <span className="badge bg-primary">
                                      {progress.completionPercentage}%
                                    </span>
                                  </div>
                                  <div className="progress" style={{height: '20px'}}>
                                    <div 
                                      className="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                                      role="progressbar" 
                                      style={{width: `${progress.completionPercentage}%`}}
                                    >
                                      {progress.completionPercentage}%
                                    </div>
                                  </div>
                                  <small className="text-muted">
                                    Avg: {progress.avgCompletedLessons}/{progress.totalLessons} lessons
                                  </small>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">No progress data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">
                              <i className="bi bi-clock-history me-2"></i>Recently Registered Students
                            </h5>
                          </div>
                          <div className="card-body">
                            {analyticsData.recentActivity.length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Email</th>
                                      <th>Enrolled Courses</th>
                                      <th>Joined</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analyticsData.recentActivity.map((student) => (
                                      <tr key={student._id}>
                                        <td>{student.name}</td>
                                        <td><small>{student.email}</small></td>
                                        <td>
                                          <span className="badge bg-primary">
                                            {student.enrolledCoursesCount}
                                          </span>
                                        </td>
                                        <td>
                                          <small>
                                            {new Date(student.registeredAt).toLocaleDateString()}
                                          </small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-muted">No recent registrations</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Trends */}
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-warning text-dark">
                            <h5 className="mb-0">
                              <i className="bi bi-calendar-week me-2"></i>Enrollment Trends (Last 7 Days)
                            </h5>
                          </div>
                          <div className="card-body">
                            {analyticsData.enrollmentTrends.length > 0 ? (
                              <div className="chart-container">
                                {analyticsData.enrollmentTrends.map((trend) => (
                                  <div key={trend.date} className="d-flex justify-content-between align-items-center mb-2">
                                    <span>{new Date(trend.date).toLocaleDateString()}</span>
                                    <div className="d-flex align-items-center">
                                      <div className="progress mx-3" style={{width: '200px', height: '20px'}}>
                                        <div 
                                          className="progress-bar bg-info" 
                                          style={{width: `${(trend.enrollments / 10) * 100}%`}}
                                        ></div>
                                      </div>
                                      <strong>{trend.enrollments} enrollments</strong>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted">No enrollment trends available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cache Info */}
                    <div className="alert alert-info">
                      <strong>ℹ️ Cache Info:</strong> Analytics data is cached for 30 minutes to improve performance. 
                      Last updated: {new Date(analyticsData.timestamp || Date.now()).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning">
                    <strong>⚠️ No Analytics Data</strong>
                    <p className="mb-0">Click "Refresh Analytics" to load the data.</p>
                    <button className="btn btn-primary mt-2" onClick={fetchAnalytics}>
                      Refresh Analytics
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCourseModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveCourse}>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Course Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={courseForm.title}
                        onChange={handleCourseFormChange}
                        required
                        placeholder="e.g., Data Science Masterclass"
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={courseForm.description}
                        onChange={handleCourseFormChange}
                        required
                        rows="3"
                        placeholder="Brief description of the course"
                      ></textarea>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Instructor</label>
                      <input
                        type="text"
                        className="form-control"
                        name="instructor"
                        value={courseForm.instructor}
                        onChange={handleCourseFormChange}
                        placeholder="Instructor name"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        name="duration"
                        value={courseForm.duration}
                        onChange={handleCourseFormChange}
                        placeholder="e.g., 3 Months"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={courseForm.price}
                        onChange={handleCourseFormChange}
                        required
                        min="0"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        name="category"
                        value={courseForm.category}
                        onChange={handleCourseFormChange}
                        required
                      >
                        <option value="finance">Finance</option>
                        <option value="technology">Technology</option>
                        <option value="analytics">Analytics</option>
                        <option value="marketing">Marketing</option>
                        <option value="management">Management</option>
                      </select>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Thumbnail URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="thumbnail"
                        value={courseForm.thumbnail}
                        onChange={handleCourseFormChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCourseModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingCourse ? 'Update Course' : 'Create Course'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
