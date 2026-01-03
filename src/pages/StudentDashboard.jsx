import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Col,
  ProgressBar,
  Row,
  Stack,
  Tab,
  Tabs,
  Alert,
  Modal,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LessonAccordion from '../components/LessonAccordion.jsx';
import ResourceList from '../components/ResourceList.jsx';
import AssignmentList from '../components/AssignmentList.jsx';
import InstructorQuiz from '../components/InstructorQuiz.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';

const STUDENT_NAV_ITEMS = [
  { label: 'Dashboard', to: '/student/dashboard' }
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const {
    courses,
    enrollments,
    getInstructorQuizzes,
    canGenerateCertificate,
    generateCertificate,
    getCertificatesForUser,
    getNotificationsForUser,
    markNotificationAsRead,
    clearNotifications
  } = useData();
  const { setShowNotifications } = useUI();

  const [searchParams, setSearchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');

  const myEnrolls = enrollments.filter((e) => e.userId === user?.id);
  const myCertificates = user ? getCertificatesForUser(user.id) : [];

  // If a courseId is selected, show the learning view; otherwise, show the overview.
  const activeEnrollment = courseIdParam ? myEnrolls.find(e => e.courseId === courseIdParam) : null;
  const activeCourse = activeEnrollment ? courses.find(c => c.id === activeEnrollment.courseId) : null;

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState(null);

  const notifications = useMemo(() => user ? getNotificationsForUser(user.id) : [], [user, getNotificationsForUser]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        const v = urlObj.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      } else if (urlObj.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      }
    } catch (e) {
      console.error('Invalid URL', e);
    }
    return url;
  };

  const selectedLesson = activeCourse?.lessons?.[selectedLessonIndex];
  const instructorQuizzes = activeCourse ? getInstructorQuizzes(activeCourse.id) : [];

  const handleNextLesson = () => {
    if (activeCourse?.lessons && selectedLessonIndex < activeCourse.lessons.length - 1) {
      setSelectedLessonIndex(selectedLessonIndex + 1);
    }
  };

  const handlePrevLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex(selectedLessonIndex - 1);
    }
  };

  const handleGenerateCertificate = () => {
    if (!user || !activeCourse) return;
    if (!canGenerateCertificate(user.id, activeCourse.id)) {
      alert('Certificate requirements not met yet.');
      return;
    }
    const cert = generateCertificate(user.id, activeCourse.id);
    if (cert) {
      setCertificate(cert);
      setShowCertificateModal(true);
    }
  };

  const clearSelection = () => {
    setSearchParams({});
    setSelectedLessonIndex(0);
  };

  return (
    <DashboardLayout
      title="Student Navigation"
      navItems={STUDENT_NAV_ITEMS}
    >
      {!activeCourse ? (
        <>
          {/* Overview Dashboard */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="shadow-sm card-hover border-0 bg-primary text-white">
                <Card.Body className="d-flex flex-column align-items-center py-4">
                  <div className="fs-1 mb-2">📚</div>
                  <Card.Title>My Courses</Card.Title>
                  <h2 className="fw-bold">{myEnrolls.length}</h2>
                  <Badge bg="light" text="primary">Enrolled</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm card-hover border-0 bg-success text-white">
                <Card.Body className="d-flex flex-column align-items-center py-4">
                  <div className="fs-1 mb-2">🎓</div>
                  <Card.Title>Certificates</Card.Title>
                  <h2 className="fw-bold">{myCertificates.length}</h2>
                  <Badge bg="light" text="success">Earned</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="shadow-sm card-hover border-0 bg-info text-white cursor-pointer"
                onClick={() => setShowNotifications(true)}
              >
                <Card.Body className="d-flex flex-column align-items-center py-4">
                  <div className="fs-1 mb-2">🔔</div>
                  <Card.Title>Notifications</Card.Title>
                  <h2 className="fw-bold">{unreadCount}</h2>
                  <Badge bg="light" text="info">{unreadCount > 0 ? 'New Alerts' : 'No New Alerts'}</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="shadow-sm border-0 transition-theme h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Active Enrollments</h5>
                  <Button as={Link} to="/catalog" variant="link" className="text-decoration-none">Explore More</Button>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {myEnrolls.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-lumina-muted">You haven't enrolled in any courses yet.</p>
                      <Button as={Link} to="/catalog" variant="primary">Browse Catalog</Button>
                    </div>
                  ) : (
                    <Stack gap={3}>
                      {myEnrolls.map((enroll) => {
                        const course = courses.find((c) => c.id === enroll.courseId);
                        if (!course) return null;
                        return (
                          <Card
                            key={enroll.id}
                            className="border transition-all cursor-pointer hover-shadow"
                            onClick={() => setSearchParams({ courseId: course.id })}
                          >
                            <Card.Body className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary bg-opacity-10 rounded p-3 text-primary d-none d-md-block">
                                  <i className="bi bi-journal-bookmark-fill fs-4"></i>
                                </div>
                                <div>
                                  <div className="fw-bold fs-5">{course.title}</div>
                                  <div className="text-lumina-muted small">By {course.instructor}</div>
                                </div>
                              </div>
                              <div className="text-end" style={{ minWidth: '150px' }}>
                                <div className="small text-lumina-muted mb-1 text-uppercase fw-bold ls-1">Progress</div>
                                <ProgressBar now={enroll.progress} label={`${enroll.progress}%`} className="rounded-pill" style={{ height: '8px' }} />
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm border-0 transition-theme h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Activity</h5>
                  <Button variant="link" className="text-decoration-none p-0" onClick={() => setShowNotifications(true)}>View All</Button>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No recent activity.</div>
                  ) : (
                    <Stack gap={3}>
                      {notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className="d-flex gap-3 align-items-start pb-3 border-bottom last-child-no-border position-relative"
                          style={{ cursor: 'pointer' }}
                          onClick={() => markNotificationAsRead(n.id)}
                        >
                          <div className={`rounded-circle bg-${n.type || 'info'} bg-opacity-25 p-2 text-${n.type || 'info'}`} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            <i className={`bi bi-${n.type === 'success' ? 'check-lg' : (n.type === 'danger' ? 'exclamation-triangle' : 'info-lg')}`}></i>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className={`fw-bold small text-truncate ${!n.read ? '' : 'text-lumina-muted'}`}>{n.title}</div>
                            <div className="text-lumina-muted text-truncate" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                            <div className="mt-1 opacity-50 text-lumina-muted" style={{ fontSize: '0.65rem' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                          {!n.read && (
                            <div
                              className="bg-primary rounded-circle position-absolute"
                              style={{ width: 6, height: 6, top: 4, right: 0 }}
                            ></div>
                          )}
                        </div>
                      ))}
                    </Stack>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm border-0 transition-theme">
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold">Earned Certificates</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {myCertificates.length === 0 ? (
                <div className="text-lumina-muted text-center py-4">Complete a course to unlock your certificates!</div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-3">
                  {myCertificates.map((cert) => (
                    <Col key={cert.id}>
                      <Card className="h-100 border-0 bg-light-success shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Badge bg="success" className="px-2 py-1">Certified</Badge>
                            <small className="text-lumina-muted fw-bold">{new Date(cert.issuedAt).toLocaleDateString()}</small>
                          </div>
                          <h6 className="fw-bold mb-2">{cert.courseTitle}</h6>
                          <Button variant="success" size="sm" className="w-100 mt-2" href={`/certificate/${cert.id}`} target="_blank">
                            Open Certificate
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </>
      ) : (
        <>
          {/* Learning Workspace View */}
          <div className="mb-3">
            <Button variant="link" onClick={clearSelection} className="p-0 text-decoration-none text-lumina-muted mb-2">
              <i className="bi bi-chevron-left me-1"></i> Back to Dashboard
            </Button>
          </div>
          <Row className="g-4">
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-4 h-100 overflow-hidden">
                <Card.Header className="bg-transparent border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">{activeCourse.title}</h5>
                    <div className="small text-lumina-muted opacity-75">
                      Progress: {activeEnrollment?.progress || 0}% Complete • {activeCourse.lessons?.length || 0} Lessons
                    </div>
                  </div>
                  {canGenerateCertificate(user.id, activeCourse.id) ? (
                    <Button variant="success" size="sm" onClick={handleGenerateCertificate}>
                      <i className="bi bi-award me-1"></i> Get Certificate
                    </Button>
                  ) : (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip>
                          Requirements: 100% lessons + 70% average on quizzes/assignments
                        </Tooltip>
                      }
                    >
                      <Badge bg="secondary" className="cursor-help p-2">
                        <i className="bi bi-lock-fill me-1"></i> Cert Locked
                      </Badge>
                    </OverlayTrigger>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="workspace-video-wrapper bg-dark">
                    {selectedLesson?.videoUrl ? (
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={getEmbedUrl(selectedLesson.videoUrl)}
                          title={selectedLesson.title}
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="ratio ratio-16x9 d-flex align-items-center justify-content-center text-white text-center">
                        <div>
                          <i className="bi bi-play-circle fs-1 opacity-50"></i>
                          <div className="mt-2">No Video Available</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-top">
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-nav-tabs">
                      <Tab eventKey="lessons" title="Course Content">
                        {selectedLesson && (
                          <div className="mt-2 animate-fade-in">
                            <h4 className="fw-bold mb-3">{selectedLesson.title}</h4>
                            <p className="text-lumina-muted mb-4 fs-5" style={{ lineHeight: '1.6' }}>{selectedLesson.description}</p>
                            <div className="d-flex justify-content-between">
                              <Button variant="outline-primary" onClick={handlePrevLesson} disabled={selectedLessonIndex === 0}>
                                <i className="bi bi-arrow-left me-2"></i> Previous
                              </Button>
                              <Button variant="primary" onClick={handleNextLesson} disabled={selectedLessonIndex === activeCourse.lessons.length - 1}>
                                Next <i className="bi bi-arrow-right ms-2"></i>
                              </Button>
                            </div>
                          </div>
                        )}
                      </Tab>
                      <Tab eventKey="assignments" title="Assignments">
                        <AssignmentList courseId={activeCourse.id} />
                      </Tab>
                      <Tab eventKey="quizzes" title="Quizzes">
                        {instructorQuizzes.length === 0 ? (
                          <Alert variant="info" className="bg-info bg-opacity-10 border-info text-info">No quizzes for this course.</Alert>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {instructorQuizzes.map(quiz => <InstructorQuiz key={quiz.id} quiz={quiz} />)}
                          </div>
                        )}
                      </Tab>
                    </Tabs>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Stack gap={4}>
                <Card className="shadow-sm border-0 transition-theme h-100">
                  <Card.Header className="bg-transparent pt-4 px-4 border-0">
                    <h6 className="fw-bold mb-0">Curriculum</h6>
                  </Card.Header>
                  <Card.Body className="px-3 pb-4">
                    <LessonAccordion
                      lessons={activeCourse.lessons}
                      courseId={activeCourse.id}
                      onLessonSelect={setSelectedLessonIndex}
                      selectedLessonIndex={selectedLessonIndex}
                    />
                  </Card.Body>
                </Card>

                <Card className="shadow-sm border-0 transition-theme">
                  <Card.Header className="bg-transparent pt-4 px-4 border-0">
                    <h6 className="fw-bold mb-0">Resources</h6>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <ResourceList courseId={activeCourse.id} />
                  </Card.Body>
                </Card>
              </Stack>
            </Col>
          </Row>
        </>
      )}

      {/* Certificate Modal */}
      <Modal show={showCertificateModal} onHide={() => setShowCertificateModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {certificate && (
            <Card className="border-0 bg-light p-5 text-center certificate-preview">
              <div className="border p-4 h-100 position-relative" style={{ border: '4px double #ccc !important' }}>
                <h1 className="display-4 fw-bold mb-4 font-serif">Certificate of Excellence</h1>
                <p className="fs-5 mb-1">This is to certify that</p>
                <h2 className="display-6 fw-bold text-primary mb-4 underline">{user.username || user.email}</h2>
                <p className="fs-5 mb-1">has successfully mastered</p>
                <h3 className="fw-bold mb-5 italic">“{certificate.courseTitle}”</h3>
                <div className="d-flex justify-content-around mt-5 pt-4 border-top">
                  <div>
                    <div className="fw-bold underline">{certificate.instructor}</div>
                    <small className="text-muted">Instructor</small>
                  </div>
                  <div>
                    <div className="fw-bold underline">{new Date(certificate.issuedAt).toLocaleDateString()}</div>
                    <small className="text-muted">Date Issued</small>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowCertificateModal(false)}>Close</Button>
          <Button variant="primary" href={`/certificate/${certificate?.id}`} target="_blank">Download PDF</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
         .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important; transform: translateY(-2px); }
         .ls-1 { letter-spacing: 1px; }
         .cursor-pointer { cursor: pointer; }
         .cursor-help { cursor: help; }
         .custom-nav-tabs .nav-link { border: none; color: var(--lumina-text-muted); font-weight: 600; padding: 10px 20px; }
         .custom-nav-tabs .nav-link.active { color: var(--lumina-primary); border-bottom: 2px solid var(--lumina-primary); background: transparent; }
         .certificate-preview { background-color: #fdfdfd; background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); color: #212529; }
         [data-bs-theme="dark"] .certificate-preview { background-color: #1a1a1a; filter: sepia(0.2) contrast(1.1); color: #e0e0e0; }
         .font-serif { font-family: 'Georgia', serif; }
         .underline { text-decoration: underline; }
         .italic { font-style: italic; }
         .animate-fade-in { animation: fadeIn 0.4s ease-out; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </DashboardLayout>
  );
};

export default StudentDashboard;
