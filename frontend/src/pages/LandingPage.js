import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import logo from '../assests/logo.svg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Smooth scrolling animation for student profiles
  React.useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleApplyNow = () => {
    navigate('/courses');
  };

  const handleQuizNext = () => {
    if (selectedInterest) {
      // Navigate to courses page with selected interest
      navigate('/courses', { state: { interest: selectedInterest } });
    } else {
      alert('Please select an option to continue');
    }
  };

  const handleNavigation = (section) => {
    if (section === 'courses') {
      // Navigate to courses page
      navigate('/courses');
    } else {
      // For other sections, scroll within the page
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#home">
            <img src={logo} alt="Imarticus Learning" height="50" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleNavigation('courses')}>All Programs</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleNavigation('placement-section')}>Career Services</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleNavigation('curriculum-section')}>Discover</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleNavigation('leaders-section')}>For Enterprise</button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-success ms-2" onClick={() => navigate('/auth')}>Login</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title animate-fade-in">
                <span className="highlight">Real Learning</span><br />
                that delivers your<br />
                <span className="text-dark">career goals</span>
              </h1>
              <p className="hero-subtitle animate-fade-in" style={{animationDelay: '0.3s'}}>
                <strong>Unmatched Outcomes</strong> from job-ready, certification, and executive programs
              </p>
              <button className="btn btn-success btn-lg mt-4 animate-fade-in pulse-on-hover" style={{animationDelay: '0.6s'}} onClick={handleApplyNow}>
                Explore Our Programs →
              </button>

              {/* Stats */}
              <div className="stats-section mt-5">
                <div className="row">
                  <div className="col-6 col-md-3 mb-3 animate-count-up">
                    <h3 className="stat-number">10 Lakh+</h3>
                    <p className="stat-label">Careers Transformed</p>
                  </div>
                  <div className="col-6 col-md-3 mb-3 animate-count-up" style={{animationDelay: '0.2s'}}>
                    <h3 className="stat-number">#1 in</h3>
                    <p className="stat-label">Job-Ready Programs</p>
                  </div>
                  <div className="col-6 col-md-3 mb-3 animate-count-up" style={{animationDelay: '0.4s'}}>
                    <h3 className="stat-number">3500+</h3>
                    <p className="stat-label">Hiring Partners</p>
                  </div>
                  <div className="col-6 col-md-3 mb-3 animate-count-up" style={{animationDelay: '0.6s'}}>
                    <h3 className="stat-number">3X</h3>
                    <p className="stat-label">Salary Growth</p>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="ratings-section mt-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
                <div className="d-flex flex-wrap gap-3">
                  <div className="rating-badge">
                    <span className="stars">⭐ 4.7</span>
                    <span className="platform">Google</span>
                  </div>
                  <div className="rating-badge">
                    <span className="stars">⭐ 4.5</span>
                    <span className="platform">Facebook</span>
                  </div>
                  <div className="rating-badge">
                    <span className="stars">⭐ 4.5</span>
                    <span className="platform">Trustpilot</span>
                  </div>
                  <div className="rating-badge">
                    <span className="stars">⭐ 4.6</span>
                    <span className="platform">CourseReport</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="success-stories-horizontal">
                <div className="stories-scroll-wrapper">
                  <div className="stories-scroll-track">
                    {/* Student Success Stories - Horizontal Cards */}
                    {[
                      {
                        name: 'Riya Israni',
                        company: 'Flipkart',
                        role: 'Data Analyst',
                        program: 'PGA in Data Science',
                        badge: 'Fresher Upskilled',
                        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
                      },
                      {
                        name: 'Hussain Johar',
                        company: 'GSKA & CO.',
                        role: 'Tax Assistant',
                        program: 'US CPA Program',
                        badge: 'US CPA',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
                      },
                      {
                        name: 'Timir Naha',
                        company: 'Digital Marketing Co.',
                        role: 'Marketing Manager',
                        program: "IIT Roorkee's Certificate",
                        badge: 'Career Switcher',
                        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
                      },
                      {
                        name: 'Priya Sharma',
                        company: 'Goldman Sachs',
                        role: 'IB Analyst',
                        program: 'Investment Banking Pro',
                        badge: 'Freshers Placed',
                        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
                      },
                      {
                        name: 'Rahul Verma',
                        company: 'Amazon',
                        role: 'Cloud Architect',
                        program: 'AWS Cloud Computing',
                        badge: 'Career Growth',
                        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300'
                      }
                    ].map((student, idx) => (
                      <div key={idx} className="story-card-horizontal">
                        <div className="story-card-content">
                          <div className="student-badge">{student.badge}</div>
                          <div className="student-image-section">
                            <img src={student.image} alt={student.name} className="student-avatar" />
                          </div>
                          <div className="student-info">
                            <h6 className="student-name-horizontal">{student.name}</h6>
                            <p className="student-role-horizontal">{student.role}</p>
                            <p className="student-program">{student.program}</p>
                          </div>
                          <div className="company-tag">
                            <span>Started at: <strong>{student.company}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {[
                      {
                        name: 'Riya Israni',
                        company: 'Flipkart',
                        role: 'Data Analyst',
                        program: 'PGA in Data Science',
                        badge: 'Fresher Upskilled',
                        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
                      },
                      {
                        name: 'Hussain Johar',
                        company: 'GSKA & CO.',
                        role: 'Tax Assistant',
                        program: 'US CPA Program',
                        badge: 'US CPA',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
                      },
                      {
                        name: 'Timir Naha',
                        company: 'Digital Marketing Co.',
                        role: 'Marketing Manager',
                        program: "IIT Roorkee's Certificate",
                        badge: 'Career Switcher',
                        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
                      }
                    ].map((student, idx) => (
                      <div key={`dup-${idx}`} className="story-card-horizontal">
                        <div className="story-card-content">
                          <div className="student-badge">{student.badge}</div>
                          <div className="student-image-section">
                            <img src={student.image} alt={student.name} className="student-avatar" />
                          </div>
                          <div className="student-info">
                            <h6 className="student-name-horizontal">{student.name}</h6>
                            <p className="student-role-horizontal">{student.role}</p>
                            <p className="student-program">{student.program}</p>
                          </div>
                          <div className="company-tag">
                            <span>Started at: <strong>{student.company}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prestigious Academies Section */}
      <section className="academies-section py-5 bg-success text-white">
        <div className="container-fluid">
          <h2 className="text-center mb-2 animate-fade-in">The most prestigious academies</h2>
          <p className="text-center mb-5 animate-fade-in">
            Our courses are partnered with top universities for globally recognized certifications
          </p>
          
          {/* Top Row - Scroll Right to Left */}
          <div className="scroll-container mb-3">
            <div className="scroll-track scroll-rtl">
              {['KPMG', 'Skill India', 'IIMA', 'XLRI', 'ACCA', 'AICPA', 'NISM', 'CFA', 'IMA', 'FRM', 'CIMA', 'CME'].map((partner, idx) => (
                <div key={idx} className="partner-badge">
                  <span className="partner-name">{partner}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {['KPMG', 'Skill India', 'IIMA', 'XLRI', 'ACCA', 'AICPA', 'NISM', 'CFA', 'IMA', 'FRM', 'CIMA', 'CME'].map((partner, idx) => (
                <div key={`dup1-${idx}`} className="partner-badge">
                  <span className="partner-name">{partner}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Scroll Left to Right */}
          <div className="scroll-container">
            <div className="scroll-track scroll-ltr">
              {['NSE', 'BSE', 'SEBI', 'RBI', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'ISB', 'NMIMS', 'SP Jain', 'MICA', 'MDI'].map((partner, idx) => (
                <div key={idx} className="partner-badge">
                  <span className="partner-name">{partner}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {['NSE', 'BSE', 'SEBI', 'RBI', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'ISB', 'NMIMS', 'SP Jain', 'MICA', 'MDI'].map((partner, idx) => (
                <div key={`dup2-${idx}`} className="partner-badge">
                  <span className="partner-name">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum-section" className="curriculum-section py-5">
        <div className="container">
          <h2 className="text-center mb-4">
            Learn using a <span className="text-success">curriculum built by industry</span>
          </h2>
          <p className="text-center text-muted mb-5">
            Designed to meet market demands and propel your career success
          </p>

          {/* Category Tabs */}
          <ul className="nav nav-tabs justify-content-center mb-5" id="courseTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="finance-tab" data-bs-toggle="tab" data-bs-target="#finance" type="button">
                Finance
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="analytics-tab" data-bs-toggle="tab" data-bs-target="#analytics" type="button">
                Analytics
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="marketing-tab" data-bs-toggle="tab" data-bs-target="#marketing" type="button">
                Marketing
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="technology-tab" data-bs-toggle="tab" data-bs-target="#technology" type="button">
                Technology
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="management-tab" data-bs-toggle="tab" data-bs-target="#management" type="button">
                General Management
              </button>
            </li>
          </ul>

          {/* Course Cards */}
          <div className="tab-content" id="courseTabsContent">
            {/* Finance Tab */}
            <div className="tab-pane fade show active" id="finance" role="tabpanel">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">3 or 6 Months | Classroom or Live Online Training</span>
                      <h5 className="card-title">Certified Investment Banking Operations Professional</h5>
                      <ul className="list-unstyled">
                        <li>✓ 100% Job Assurance</li>
                        <li>✓ 1200+ Batches Completed</li>
                      </ul>
                      <p className="fw-bold">36000+ Placements</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">JP Morgan | Goldman Sachs | Nomura</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">4 or 8 Months | Classroom or Online Training</span>
                      <h5 className="card-title">Postgraduate Financial Analysis Program</h5>
                      <ul className="list-unstyled">
                        <li>✓ 100% Job Assurance</li>
                        <li>✓ 18 LPA Highest Salary</li>
                      </ul>
                      <p className="fw-bold">4500+ Career Transitions</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Bank of America | BNP Paribas | Capgemini</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">3 Months | Classroom Training</span>
                      <h5 className="card-title">Postgraduate Program in Banking and Finance</h5>
                      <ul className="list-unstyled">
                        <li>✓ 100% Job Assurance</li>
                        <li>✓ 10000+ Learners Impacted</li>
                      </ul>
                      <p className="fw-bold">85% Placement Record</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Genpact</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Tab */}
            <div className="tab-pane fade" id="analytics" role="tabpanel">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">6 Months | Live Online Training</span>
                      <h5 className="card-title">Data Science with Python</h5>
                      <ul className="list-unstyled">
                        <li>✓ Industry Projects</li>
                        <li>✓ 500+ Hiring Partners</li>
                      </ul>
                      <p className="fw-bold">92% Placement Rate</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Amazon | Microsoft | IBM</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">5 Months | Online Training</span>
                      <h5 className="card-title">Business Analytics with Power BI</h5>
                      <ul className="list-unstyled">
                        <li>✓ Certified Program</li>
                        <li>✓ Real-world Projects</li>
                      </ul>
                      <p className="fw-bold">1000+ Students Trained</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Deloitte | Accenture | EY</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">4 Months | Classroom Training</span>
                      <h5 className="card-title">Advanced Analytics Program</h5>
                      <ul className="list-unstyled">
                        <li>✓ Job Guarantee</li>
                        <li>✓ 12 LPA Average Package</li>
                      </ul>
                      <p className="fw-bold">95% Satisfaction Rate</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Google | Facebook | Twitter</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Tab */}
            <div className="tab-pane fade" id="marketing" role="tabpanel">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">3 Months | Online Training</span>
                      <h5 className="card-title">Digital Marketing Mastery</h5>
                      <ul className="list-unstyled">
                        <li>✓ Google Certification</li>
                        <li>✓ Live Projects</li>
                      </ul>
                      <p className="fw-bold">2000+ Careers Transformed</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Ogilvy | WPP | Publicis</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">4 Months | Hybrid Training</span>
                      <h5 className="card-title">Social Media Marketing Pro</h5>
                      <ul className="list-unstyled">
                        <li>✓ Meta Certified</li>
                        <li>✓ Industry Mentors</li>
                      </ul>
                      <p className="fw-bold">88% Placement Success</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Meta | LinkedIn | Twitter</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">5 Months | Live Online</span>
                      <h5 className="card-title">Content Marketing Specialist</h5>
                      <ul className="list-unstyled">
                        <li>✓ Portfolio Building</li>
                        <li>✓ Freelance Ready</li>
                      </ul>
                      <p className="fw-bold">1500+ Success Stories</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">HubSpot | Mailchimp | Buffer</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Tab */}
            <div className="tab-pane fade" id="technology" role="tabpanel">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">6 Months | Classroom Training</span>
                      <h5 className="card-title">Full Stack Web Development Bootcamp</h5>
                      <ul className="list-unstyled">
                        <li>✓ MERN Stack</li>
                        <li>✓ 100% Job Support</li>
                      </ul>
                      <p className="fw-bold">3000+ Developers Trained</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Amazon | Flipkart | Paytm</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">5 Months | Online Training</span>
                      <h5 className="card-title">Cloud Computing with AWS</h5>
                      <ul className="list-unstyled">
                        <li>✓ AWS Certification</li>
                        <li>✓ Hands-on Labs</li>
                      </ul>
                      <p className="fw-bold">15 LPA Average Package</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Amazon | Microsoft Azure | Google Cloud</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">4 Months | Live Online</span>
                      <h5 className="card-title">Machine Learning & AI</h5>
                      <ul className="list-unstyled">
                        <li>✓ IIT Certification</li>
                        <li>✓ Research Projects</li>
                      </ul>
                      <p className="fw-bold">2500+ AI Engineers Created</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Google | NVIDIA | OpenAI</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Tab */}
            <div className="tab-pane fade" id="management" role="tabpanel">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">12 Months | Executive Program</span>
                      <h5 className="card-title">Executive MBA Program</h5>
                      <ul className="list-unstyled">
                        <li>✓ IIM Certification</li>
                        <li>✓ C-Suite Mentors</li>
                      </ul>
                      <p className="fw-bold">25 LPA Average CTC</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">McKinsey | BCG | Bain</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">6 Months | Weekend Program</span>
                      <h5 className="card-title">Product Management Bootcamp</h5>
                      <ul className="list-unstyled">
                        <li>✓ Industry Projects</li>
                        <li>✓ PM Certification</li>
                      </ul>
                      <p className="fw-bold">1200+ Product Managers</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Google | Amazon | Microsoft</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card course-card h-100">
                    <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400" className="card-img-top" alt="Course" />
                    <div className="card-body">
                      <span className="badge bg-light text-dark mb-2">8 Months | Online Program</span>
                      <h5 className="card-title">Strategic Management Program</h5>
                      <ul className="list-unstyled">
                        <li>✓ ISB Certification</li>
                        <li>✓ Case Studies</li>
                      </ul>
                      <p className="fw-bold">800+ Senior Leaders</p>
                      <div className="company-logos mt-3">
                        <small className="text-muted">Deloitte | KPMG | PwC</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="quiz-section py-5 bg-success text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="mb-4">Unsure about which program meets your requirements?</h2>
              <p className="h5 mb-4">TAKE OUR QUIZ!</p>
              
              <div className="quiz-options">
                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio" name="interest" id="finance" 
                    onChange={() => setSelectedInterest('finance')} />
                  <label className="form-check-label h5" htmlFor="finance">
                    Finance
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio" name="interest" id="technology" 
                    onChange={() => setSelectedInterest('technology')} />
                  <label className="form-check-label h5" htmlFor="technology">
                    Technology
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio" name="interest" id="marketing" 
                    onChange={() => setSelectedInterest('marketing')} />
                  <label className="form-check-label h5" htmlFor="marketing">
                    Marketing
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio" name="interest" id="analytics" 
                    onChange={() => setSelectedInterest('analytics')} />
                  <label className="form-check-label h5" htmlFor="analytics">
                    Analytics
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio" name="interest" id="management" 
                    onChange={() => setSelectedInterest('management')} />
                  <label className="form-check-label h5" htmlFor="management">
                    Management
                  </label>
                </div>
              </div>

              <button className="btn btn-light btn-lg mt-4" onClick={handleQuizNext}>
                Next →
              </button>
              <p className="mt-3">1/3</p>
            </div>

            <div className="col-lg-6">
              <img src="https://t4.ftcdn.net/jpg/04/67/95/73/360_F_467957383_3yRd5rVS1KcK6mjVNXaNwnGkxe2JOqDu.jpg" 
                alt="Student" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Industry Leaders Section */}
      <section id="leaders-section" className="leaders-section py-5">
        <div className="container-fluid">
          <h2 className="text-center mb-2 animate-fade-in">
            We place you with <span className="text-success">industry leaders</span> in every field
          </h2>
          <p className="text-center text-muted mb-5 animate-fade-in">3500+ leading companies hire our learners</p>

          {/* Row 1 - Scroll Left to Right */}
          <div className="scroll-container mb-3">
            <div className="scroll-track scroll-ltr">
              {['J.P. Morgan', 'Goldman Sachs', 'Morgan Stanley', 'BNP Paribas', 'Deloitte', 'PwC', 'EY', 'KPMG', 
                'Standard Chartered', 'State Street', 'MSCI', 'Nomura', 'Citi', 'Barclays'].map((company, idx) => (
                <div key={idx} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
              {/* Duplicate */}
              {['J.P. Morgan', 'Goldman Sachs', 'Morgan Stanley', 'BNP Paribas', 'Deloitte', 'PwC', 'EY', 'KPMG', 
                'Standard Chartered', 'State Street', 'MSCI', 'Nomura', 'Citi', 'Barclays'].map((company, idx) => (
                <div key={`dup1-${idx}`} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Scroll Right to Left */}
          <div className="scroll-container mb-3">
            <div className="scroll-track scroll-rtl">
              {['Amazon', 'Google', 'Microsoft', 'Flipkart', 'Accenture', 'Cognizant', 'TCS', 'Infosys', 
                'Wipro', 'HCL', 'Tech Mahindra', 'Capgemini', 'IBM', 'Oracle'].map((company, idx) => (
                <div key={idx} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
              {/* Duplicate */}
              {['Amazon', 'Google', 'Microsoft', 'Flipkart', 'Accenture', 'Cognizant', 'TCS', 'Infosys', 
                'Wipro', 'HCL', 'Tech Mahindra', 'Capgemini', 'IBM', 'Oracle'].map((company, idx) => (
                <div key={`dup2-${idx}`} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 - Scroll Left to Right */}
          <div className="scroll-container">
            <div className="scroll-track scroll-ltr">
              {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'IndusInd Bank', 
                'American Express', 'Genpact', 'WNS', 'Concentrix', 'Teleperformance', 'HSBC', 'DBS', 'RBS'].map((company, idx) => (
                <div key={idx} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
              {/* Duplicate */}
              {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'IndusInd Bank', 
                'American Express', 'Genpact', 'WNS', 'Concentrix', 'Teleperformance', 'HSBC', 'DBS', 'RBS'].map((company, idx) => (
                <div key={`dup3-${idx}`} className="company-badge-scroll">
                  <span className="company-name-scroll">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonial Section */}
      <section className="video-testimonial-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Hear From Our <span className="text-success">Success Stories</span></h2>
          <p className="text-center text-muted mb-5">Real stories from our learners who transformed their careers</p>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="video-container shadow-lg rounded overflow-hidden">
                <video 
                  controls 
                  poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop"
                  className="w-100"
                  style={{maxHeight: '500px', objectFit: 'cover'}}
                >
                  <source src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/public/Vinay_jain.mp4`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="text-center mt-4">
                <h5 className="mb-2">Vinay Jain - Success Story</h5>
                <p className="text-muted">See how Imarticus helped transform careers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Highlights */}
      <section id="placement-section" className="placement-section py-5 bg-success text-white">
        <div className="container">
          <h2 className="text-center mb-5 animate-slide-up">Placement highlights FY2025</h2>
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="stat-card animate-count-up">
                <h1 className="display-4 fw-bold counter" data-target="7921">7,921</h1>
                <p className="stat-description">Learners Placed</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-card animate-count-up" style={{animationDelay: '0.2s'}}>
                <h1 className="display-4 fw-bold counter" data-target="4350">4,350+</h1>
                <p className="stat-description">Unique Job Roles Explored</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-card animate-count-up" style={{animationDelay: '0.4s'}}>
                <h1 className="display-4 fw-bold counter" data-target="31700">31,700+</h1>
                <p className="stat-description">Interviews Conducted</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-card animate-count-up" style={{animationDelay: '0.6s'}}>
                <h1 className="display-4 fw-bold counter" data-target="2215">2,215+</h1>
                <p className="stat-description">Companies Hired Our Learners</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button className="btn btn-light btn-lg pulse-animation" onClick={() => alert('Placement report download feature coming soon!')}>
              Download Placement Report →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 text-center">
        <div className="container">
          <h2 className="mb-4">Ready to Transform Your Career?</h2>
          <button className="btn btn-success btn-lg px-5" onClick={handleApplyNow}>
            Apply Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="footer-logo mb-3">
                <img src={logo} alt="Imarticus Learning" style={{height: '50px', filter: 'brightness(0) invert(1)'}} />
              </div>
              <p className="text-muted">
                India's leading professional education institute delivering job-ready, certification, and executive programs since 2012.
              </p>
              <div className="social-links mt-3">
                <a href="https://www.facebook.com/imarticuslearning" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="bi bi-facebook" style={{fontSize: '1.5rem'}}></i>
                </a>
                <a href="https://www.linkedin.com/school/imarticus-learning" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="bi bi-linkedin" style={{fontSize: '1.5rem'}}></i>
                </a>
                <a href="https://twitter.com/imarticusindia" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="bi bi-twitter-x" style={{fontSize: '1.5rem'}}></i>
                </a>
                <a href="https://www.instagram.com/imarticuslearning" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <i className="bi bi-instagram" style={{fontSize: '1.5rem'}}></i>
                </a>
                <a href="https://www.youtube.com/@ImarticusLearning" target="_blank" rel="noopener noreferrer" className="text-white">
                  <i className="bi bi-youtube" style={{fontSize: '1.5rem'}}></i>
                </a>
              </div>
              <div className="mt-4">
                <h6 className="mb-2">Download our app</h6>
                <div className="app-badges">
                  <a href="#" className="d-block mb-2">
                    <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="App Store" style={{height: '40px'}} />
                  </a>
                  <a href="#" className="d-block">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{height: '40px'}} />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-md-2 mb-4">
              <h6 className="mb-3 text-success">Support</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">About Us</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Help And Support</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Refer And Earn</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Careers At Imarticus</a></li>
              </ul>
            </div>

            <div className="col-md-2 mb-4">
              <h6 className="mb-3 text-success">Industries</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Finance</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Analytics</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Technology</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Marketing</a></li>
              </ul>
            </div>

            <div className="col-md-2 mb-4">
              <h6 className="mb-3 text-success">Resources</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Blogs</a></li>
              </ul>
            </div>

            <div className="col-md-3 mb-4">
              <h6 className="mb-3 text-success">Follow us on</h6>
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-facebook text-white me-2"></i>
                  <i className="bi bi-twitter-x text-white me-2"></i>
                  <i className="bi bi-linkedin text-white me-2"></i>
                  <i className="bi bi-instagram text-white me-2"></i>
                  <i className="bi bi-youtube text-white"></i>
                </div>
              </div>
              <h6 className="mb-3">Download our app</h6>
              <div className="app-store-badges">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={{height: '35px'}} className="mb-2 d-block" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{height: '35px'}} className="d-block" />
              </div>
            </div>
          </div>
          
          <hr className="bg-secondary my-4" />
          
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="text-muted mb-0">
                © 2025 Imarticus Learning. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <a href="#" className="text-muted text-decoration-none me-3">Privacy Policy</a>
              <a href="#" className="text-muted text-decoration-none">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
