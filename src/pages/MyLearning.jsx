import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Col, Row, Badge, Button, Tab, Tabs, Alert, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LessonAccordion from '../components/LessonAccordion.jsx';

import ResourceList from '../components/ResourceList.jsx';
import AssignmentList from '../components/AssignmentList.jsx';
import InstructorQuiz from '../components/InstructorQuiz.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const MyLearning = () => {
  const { user } = useAuth();
  const { courses, enrollments, getInstructorQuizzes, canGenerateCertificate, generateCertificate } =
    useData();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');

  // Find all enrollments for the user
  const userEnrollments = enrollments.filter((e) => e.userId === user?.id);

  // Find the active enrollment:
  // 1. If courseId param exists, find matching enrollment
  // 2. Else, find the most recently enrolled course that still exists
  const active = courseIdParam
    ? userEnrollments.find(e => e.courseId === courseIdParam)
    : userEnrollments
      .filter(e => courses.some(c => c.id === e.courseId)) // Only valid courses
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))[0]; // Most recent first

  const course = courses.find((c) => c.id === active?.courseId);

  // Use a stable reference for nav items
  const studentNavItems = useMemo(() => [
    { label: 'Dashboard', to: '/student/dashboard' },
    { label: 'My Learning', to: '/student/learning' }
  ], []);

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState(null);

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

  const selectedLesson = course?.lessons?.[selectedLessonIndex];
  const instructorQuizzes = course ? getInstructorQuizzes(course.id) : [];

  const handleNextLesson = () => {
    if (course?.lessons && selectedLessonIndex < course.lessons.length - 1) {
      setSelectedLessonIndex(selectedLessonIndex + 1);
    }
  };

  const handlePrevLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex(selectedLessonIndex - 1);
    }
  };

  const handleGenerateCertificate = () => {
    if (!user || !course) return;
    if (!canGenerateCertificate(user.id, course.id)) {
      alert(
        'Certificate cannot be generated yet. Please complete all lessons, pass quizzes, and meet assignment criteria.'
      );
      return;
    }
    const cert = generateCertificate(user.id, course.id);
    if (cert) {
      setCertificate(cert);
      setShowCertificateModal(true);
    }
  };

  if (!course) {
    return (
      <DashboardLayout
        title="Student Navigation"
        navItems={studentNavItems}
      >
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h5>No Active Course</h5>
            <p className="text-muted">Please enroll in a course from the catalog to start learning.</p>
          </Card.Body>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Student Navigation"
      navItems={studentNavItems}
    >
      <Row className="g-3">
        <Col md={8}>
          <Card className="shadow-sm card-hover transition-theme">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{course.title}</strong>
                {selectedLesson && (
                  <div className="small text-muted">
                    Lesson {selectedLessonIndex + 1} of {course.lessons?.length || 0}
                  </div>
                )}
              </div>
              <div className="d-flex flex-column align-items-end gap-1">
                <Badge bg="primary">{active?.progress || 0}% Complete</Badge>

                {!canGenerateCertificate(user.id, course.id) ? (
                  <OverlayTrigger
                    placement="left"
                    overlay={
                      <Tooltip id="cert-tooltip">
                        <div className="text-start">
                          <strong>Locked. Requirements:</strong><br />
                          • 100% Lesson Progress<br />
                          • Avg Quiz Score ≥ 70%<br />
                          • Avg Assignment Grade ≥ 70%
                        </div>
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        style={{ pointerEvents: 'none' }}
                        disabled
                      >
                        Cert Locked ⓘ
                      </Button>
                    </span>
                  </OverlayTrigger>
                ) : (
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={handleGenerateCertificate}
                  >
                    View Certificate
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="lessons" title="Lessons">
                  {selectedLesson ? (
                    <>
                      <div className="mb-3">
                        <h5>{selectedLesson.title}</h5>
                        {selectedLesson.description && (
                          <p className="text-muted">{selectedLesson.description}</p>
                        )}
                      </div>
                      <div className="ratio ratio-16x9 mb-3">
                        {selectedLesson.videoUrl ? (
                          <iframe
                            src={getEmbedUrl(selectedLesson.videoUrl)}
                            title={selectedLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded"
                          />
                        ) : (
                          <div className="bg-dark text-white d-flex align-items-center justify-content-center rounded">
                            <div className="text-center">
                              <div className="mb-2">▶</div>
                              <div>Video Player</div>
                              <small className="text-muted">Lesson: {selectedLesson.title}</small>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <Button
                          variant="outline-secondary"
                          onClick={handlePrevLesson}
                          disabled={selectedLessonIndex === 0}
                        >
                          ← Previous Lesson
                        </Button>
                        <div className="small text-muted">
                          Duration: {selectedLesson.duration || 'N/A'}
                        </div>
                        <Button
                          variant="outline-secondary"
                          onClick={handleNextLesson}
                          disabled={selectedLessonIndex === (course.lessons?.length || 0) - 1}
                        >
                          Next Lesson →
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">Select a lesson from the sidebar to start learning.</p>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="assignments" title="Assignments">
                  <AssignmentList courseId={course.id} />
                </Tab>

                <Tab eventKey="quizzes" title="Quizzes">
                  <div className="mb-3">
                    <h6>Instructor Quizzes</h6>
                    {instructorQuizzes.length === 0 ? (
                      <p className="text-muted">No quizzes available for this course.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {instructorQuizzes.map((quiz) => (
                          <InstructorQuiz key={quiz.id} quiz={quiz} />
                        ))}
                      </div>
                    )}
                  </div>

                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="d-flex flex-column gap-3">
          <Card className="shadow-sm h-100 card-hover transition-theme">
            <Card.Header>Course Lessons</Card.Header>
            <Card.Body>
              <LessonAccordion
                lessons={course.lessons}
                courseId={course.id}
                onLessonSelect={setSelectedLessonIndex}
                selectedLessonIndex={selectedLessonIndex}
              />
            </Card.Body>
          </Card>
          <Card className="shadow-sm card-hover transition-theme">
            <Card.Header>Resources</Card.Header>
            <Card.Body>
              <ResourceList courseId={course.id} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCertificateModal} onHide={() => setShowCertificateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Course Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {certificate ? (
            <Card className="shadow-sm border-success">
              <Card.Body className="text-center">
                <h5 className="mb-3">Certificate of Completion</h5>
                <p className="mb-1">This certifies that</p>
                <h4 className="mb-2">{certificate.studentEmail}</h4>
                <p className="mb-1">has successfully completed the course</p>
                <h5 className="mb-2">“{certificate.courseTitle}”</h5>
                <p className="mb-1">
                  under the instruction of <strong>{certificate.instructor}</strong>
                </p>
                <p className="small text-muted mt-3 mb-1">
                  Issued on: {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
                <p className="small text-muted">Certificate ID: {certificate.id}</p>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="warning">No certificate available.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCertificateModal(false)}>
            Close
          </Button>
          {certificate && (
            <Button
              variant="success"
              href={`/certificate/${certificate.id}`}
              target="_blank"
            >
              Print / Download
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default MyLearning;
