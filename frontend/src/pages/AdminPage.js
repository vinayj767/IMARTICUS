import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesForAdmin, uploadDocument } from '../services/api';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
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
        // Reset form
        setSelectedCourse('');
        setSelectedModule('');
        setSelectedLesson('');
        setFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Failed to upload document');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const getCourse = () => courses.find(c => c._id === selectedCourse);
  const getModule = () => getCourse()?.modules.find(m => m._id === selectedModule);

  return (
    <div className="admin-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="admin-card">
              <div className="admin-header">
                <h2>📚 Admin Document Upload</h2>
                <p className="text-muted">Upload PDF documents for lessons</p>
              </div>

              {message && (
                <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Select Course */}
                <div className="mb-4">
                  <label htmlFor="course" className="form-label">Select Course *</label>
                  <select
                    className="form-select"
                    id="course"
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

                {/* Select Module */}
                {selectedCourse && (
                  <div className="mb-4">
                    <label htmlFor="module" className="form-label">Select Module *</label>
                    <select
                      className="form-select"
                      id="module"
                      value={selectedModule}
                      onChange={handleModuleChange}
                      required
                    >
                      <option value="">Choose a module...</option>
                      {getCourse()?.modules.map(module => (
                        <option key={module._id} value={module._id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Select Lesson */}
                {selectedModule && (
                  <div className="mb-4">
                    <label htmlFor="lesson" className="form-label">Select Lesson *</label>
                    <select
                      className="form-select"
                      id="lesson"
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      required
                    >
                      <option value="">Choose a lesson...</option>
                      {getModule()?.lessons.map(lesson => (
                        <option key={lesson._id} value={lesson._id}>
                          {lesson.title} 
                          {lesson.document && ' (Has document)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-4">
                  <label htmlFor="fileInput" className="form-label">Upload PDF Document *</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      className="form-control"
                      id="fileInput"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                    />
                    <div className="file-upload-info mt-2">
                      <small className="text-muted">
                        📄 Accepted format: PDF | Maximum size: 10MB
                      </small>
                    </div>
                    {file && (
                      <div className="file-selected mt-2">
                        <span className="badge bg-success">
                          ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={loading || !selectedCourse || !selectedModule || !selectedLesson || !file}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>📤 Upload Document</>
                    )}
                  </button>
                </div>
              </form>

              <div className="admin-footer mt-4">
                <button className="btn btn-outline-secondary" onClick={() => navigate('/lms')}>
                  ← Back to LMS
                </button>
              </div>

              {/* Instructions */}
              <div className="instructions mt-5">
                <h5 className="mb-3">📋 Instructions</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <span className="text-success fw-bold">1.</span> Select the course, module, and lesson
                  </li>
                  <li className="mb-2">
                    <span className="text-success fw-bold">2.</span> Choose a PDF document (max 10MB)
                  </li>
                  <li className="mb-2">
                    <span className="text-success fw-bold">3.</span> Click upload to attach the document to the lesson
                  </li>
                  <li className="mb-2">
                    <span className="text-success fw-bold">4.</span> Students will see "Summarise with AI" button for this document
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
