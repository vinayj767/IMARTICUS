import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesForAdmin, uploadDocument, createCourse, updateCourse, deleteCourse } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage'); // Changed default to manage
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getCoursesForAdmin();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
                📤 Upload Documents
              </button>
              <button 
                className={`menu-item ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                📚 Manage Courses
              </button>
              <button 
                className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                📊 Analytics
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
                <h3 className="mb-4">📤 Upload Course Documents</h3>
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
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              🗑️ Delete
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
                <h3 className="mb-4">📊 Analytics Dashboard</h3>
                
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h2 className="text-primary">{courses.length}</h2>
                        <p className="text-muted">Total Courses</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h2 className="text-success">
                          {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
                        </h2>
                        <p className="text-muted">Total Modules</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h2 className="text-info">
                          {courses.reduce((acc, c) => 
                            acc + (c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0), 0
                          )}
                        </h2>
                        <p className="text-muted">Total Lessons</p>
                      </div>
                    </div>
                  </div>
                </div>
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
