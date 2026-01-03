import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Tabs,
  Tab,
  Image,
  Badge,
  Alert,
  ListGroup,
  Stack,
  ProgressBar,
  Table,
  Modal,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import AssignmentGrading from '../components/AssignmentGrading.jsx';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    courses,
    enrollments,
    courseReviews,
    addCourseDraft,
    addAssignment,
    getAssignments,
    addInstructorQuiz,
    getInstructorQuizzes,
    updateInstructorQuiz,
    updateCourse,
    updateAssignment
  } = useData();

  // Dashboard State
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const lessonFileRef = useRef(null);
  const courseFileRef = useRef(null);

  // Filter courses for this instructor (matching by authorId or username/email as fallback)
  const myCourses = courses.filter(
    (c) => c.authorId === user?.id ||
      c.instructor === user?.username ||
      c.instructor === user?.email
  );

  // Calculate high-level stats
  const totalStudents = enrollments.filter(e => myCourses.some(c => c.id === e.courseId)).length;
  // Fallback to internal baseStudents for mock visibility
  const studentsDisplay = Math.max(totalStudents, myCourses.reduce((sum, c) => sum + (c.students || 0), 0));

  const totalRevenue = enrollments
    .filter(e => myCourses.some(c => c.id === e.courseId))
    .reduce((sum, e) => {
      const course = myCourses.find(c => c.id === e.courseId);
      return sum + (course?.price || 0);
    }, 0);

  // Mock performance calculation
  const performance = myCourses.length > 0
    ? (myCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : '0.0';

  const selectedCourse = selectedCourseId ? myCourses.find((c) => c.id === selectedCourseId) : null;
  const courseAssignments = selectedCourseId ? getAssignments(selectedCourseId) : [];
  const courseQuizzes = selectedCourseId ? getInstructorQuizzes(selectedCourseId) : [];

  // Course creation state
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Development',
    level: 'Beginner',
    summary: '',
    price: 0,
    duration: '4 weeks',
    language: 'English',
    lessons: [],
    courseResources: []
  });

  // Builder States (Inline)
  const [lessonForm, setLessonForm] = useState({ title: '', duration: '10m', videoUrl: '', description: '', resources: [] });
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', passThreshold: 70, questions: [] });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    summary: '',
    price: 0,
    category: 'Development',
    level: 'Beginner'
  });

  // Handlers
  const handleCreateCourse = () => {
    addCourseDraft({
      ...newCourse,
      authorId: user?.id,
      instructor: user?.username || user?.email,
      status: 'pending'
    });
    setShowCourseModal(false);
    setNewCourse({ title: '', category: 'Development', level: 'Beginner', summary: '', price: 0, duration: '4 weeks', language: 'English', lessons: [], courseResources: [] });
  };

  const handleAddLesson = () => {
    if (!selectedCourseId || !lessonForm.title.trim()) return;
    const updatedLessons = [...(selectedCourse.lessons || [])];
    if (editingLessonIndex !== null) {
      updatedLessons[editingLessonIndex] = lessonForm;
      setEditingLessonIndex(null);
    } else {
      updatedLessons.push(lessonForm);
    }
    updateCourse(selectedCourseId, { lessons: updatedLessons });
    setLessonForm({ title: '', duration: '10m', videoUrl: '', description: '', resources: [] });
    alert(editingLessonIndex !== null ? 'Lesson updated!' : 'Lesson added to curriculum!');
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate || '',
      maxScore: assignment.maxScore
    });
    setEditingAssignmentId(assignment.id);
    setActiveTab('assignments');
  };

  const handleAddAssignment = () => {
    if (!selectedCourseId || !assignmentForm.title.trim()) return;
    if (editingAssignmentId) {
      updateAssignment(editingAssignmentId, assignmentForm);
      setEditingAssignmentId(null);
    } else {
      addAssignment(selectedCourseId, assignmentForm);
    }
    setAssignmentForm({ title: '', description: '', dueDate: '', maxScore: 100 });
    alert(editingAssignmentId ? 'Assignment updated!' : 'Assignment created!');
  };

  const handleEditQuiz = (quiz) => {
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      passThreshold: quiz.passThreshold,
      questions: quiz.questions || []
    });
    setEditingQuizId(quiz.id);
    setActiveTab('quizzes');
  };

  const handleAddQuiz = () => {
    if (!selectedCourseId || !quizForm.title.trim()) return;
    if (quizForm.questions.length === 0) {
      alert('Please add at least one question to the quiz.');
      return;
    }
    if (editingQuizId) {
      updateInstructorQuiz(editingQuizId, quizForm);
      setEditingQuizId(null);
    } else {
      addInstructorQuiz(selectedCourseId, quizForm);
    }
    setQuizForm({ title: '', description: '', passThreshold: 70, questions: [] });
    alert(editingQuizId ? 'Quiz updated!' : 'Quiz created!');
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    updateCourse(selectedCourseId, settingsForm);
    alert('Settings updated successfully!');
  };

  // Sync settings form when course changes
  useEffect(() => {
    if (selectedCourse) {
      setSettingsForm({
        title: selectedCourse.title,
        summary: selectedCourse.summary || selectedCourse.description || '',
        price: selectedCourse.price || 0,
        category: selectedCourse.category || 'Development',
        level: selectedCourse.level || 'Beginner'
      });
    }
  }, [selectedCourseId]);

  const handleAddQuestionToQuiz = () => {
    if (!questionForm.question.trim()) return;
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...questionForm, id: Date.now() }]
    }));
    setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const handleRemoveQuestion = (idx) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleFileSelect = (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newRes = Array.from(files).map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type,
      url: URL.createObjectURL(f),
      uploadedAt: new Date().toISOString()
    }));

    if (type === 'lesson') {
      setLessonForm(prev => ({ ...prev, resources: [...(prev.resources || []), ...newRes] }));
    } else {
      if (!selectedCourseId) return;
      const currentResources = selectedCourse.courseResources || [];
      updateCourse(selectedCourseId, { courseResources: [...currentResources, ...newRes] });
      alert(`${newRes.length} resource(s) uploaded successfully!`);
    }
    e.target.value = '';
  };

  const handleRemoveCourseResource = (index) => {
    if (!selectedCourseId) return;
    const currentResources = selectedCourse.courseResources || [];
    const updatedResources = currentResources.filter((_, i) => i !== index);
    updateCourse(selectedCourseId, { courseResources: updatedResources });
  };

  const handleRemoveLessonResource = (index) => {
    setLessonForm(prev => ({
      ...prev,
      resources: (prev.resources || []).filter((_, i) => i !== index)
    }));
  };

  const handlePreviewCourse = () => {
    if (selectedCourseId) {
      navigate(`/course/${selectedCourseId}`);
    }
  };

  const handleArchiveCourse = () => {
    if (!selectedCourseId) return;
    const confirmArchive = window.confirm('Are you sure you want to archive this course? It will no longer be visible to new students.');
    if (confirmArchive) {
      updateCourse(selectedCourseId, { status: 'archived' });
      alert('Course archived successfully.');
    }
  };

  return (
    <Container fluid className="py-4 px-lg-4 transition-theme" style={{ minHeight: '90vh', background: 'var(--lumina-bg)' }}>
      {/* Analytics Overview */}
      <Row className="g-4 mb-5">
        <Col lg={3} md={6}>
          <Card className="glass-card h-100 border-0 shadow-sm overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 p-3 opacity-10"><i className="bi bi-mortarboard fs-1"></i></div>
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <div className="text-lumina-muted small fw-bold text-uppercase mb-2">My Courses</div>
              <h2 className="mb-0 fw-bold">{myCourses.length}</h2>
              <div className="text-success small mt-2 fw-semibold"><i className="bi bi-arrow-up-short"></i> Active & Drafts</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="glass-card h-100 border-0 shadow-sm overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 p-3 opacity-10"><i className="bi bi-people fs-1"></i></div>
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <div className="text-lumina-muted small fw-bold text-uppercase mb-2">Total Students</div>
              <h2 className="mb-0 fw-bold">{studentsDisplay}</h2>
              <div className="text-primary small mt-2 fw-semibold"><i className="bi bi-person-plus me-1"></i> Live Tracking</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="glass-card h-100 border-0 shadow-sm overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 p-3 opacity-10"><i className="bi bi-cash-stack fs-1"></i></div>
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <div className="text-lumina-muted small fw-bold text-uppercase mb-2">Estimated Revenue</div>
              <h2 className="mb-0 fw-bold">{totalRevenue.toLocaleString()} ETB</h2>
              <div className="text-success small mt-2 fw-semibold"><i className="bi bi-graph-up me-1"></i> Lifetime Earnings</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="glass-card h-100 border-0 shadow-sm overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 p-3 opacity-10"><i className="bi bi-star-fill fs-1"></i></div>
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <div className="text-lumina-muted small fw-bold text-uppercase mb-2">Performance</div>
              <h2 className="mb-0 fw-bold">{performance}<span className="fs-5 text-muted fw-normal">/5</span></h2>
              <div className="text-warning small mt-2 fw-semibold"><i className="bi bi-award me-1"></i> Overall Rating</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Course Sidebar */}
        <Col lg={4}>
          <Card className="glass-card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <Card.Header className="bg-transparent border-0 px-4 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Management</h5>
              <Button size="sm" variant="primary" className="rounded-pill px-3 fw-semibold shadow-sm" onClick={() => setShowCourseModal(true)}>
                <i className="bi bi-plus-lg me-2"></i>New Course
              </Button>
            </Card.Header>
            <Card.Body className="px-3 pb-4">
              <ListGroup variant="flush" className="custom-dashboard-list">
                {myCourses.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-folder-x fs-1 opacity-25 d-block mb-3"></i>
                    <p className="text-lumina-muted px-4">Ready to share your knowledge? Start by creating your first course!</p>
                  </div>
                ) : (
                  myCourses.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      action
                      active={selectedCourseId === c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`border-0 mb-2 rounded-4 p-3 transition-all ${selectedCourseId === c.id ? 'active-course-shadow bg-primary text-white' : 'glass-hover'}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg={c.status === 'approved' ? 'success' : c.status === 'archived' ? 'secondary' : 'warning'} className="rounded-pill text-uppercase" style={{ fontSize: '0.6rem' }}>
                          {c.status}
                        </Badge>
                        <span className="text-lumina-muted opacity-75 small">{c.students || 0} students</span>
                      </div>
                      <h6 className="mb-1 fw-bold text-truncate">{c.title}</h6>
                      <div className="d-flex justify-content-between align-items-center mt-2 small opacity-75">
                        <span>{c.category}</span>
                        <span>{c.lessons?.length || 0} lessons</span>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Builder Area */}
        <Col lg={8}>
          {!selectedCourse ? (
            <Card className="glass-card border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center py-5 text-center">
              <div className="py-5 px-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block mb-4">
                  <i className="bi bi-window-sidebar fs-1 text-primary"></i>
                </div>
                <h4 className="fw-bold">Course Workspace</h4>
                <p className="text-lumina-muted mx-auto" style={{ maxWidth: 400 }}>
                  Select one of your existing courses from the list or create a new one to start building your curriculum.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="glass-card border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-transparent border-bottom-0 p-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h4 className="fw-bold mb-1">{selectedCourse.title}</h4>
                    <p className="text-lumina-muted mb-0 small"><i className="bi bi-tag me-1"></i> {selectedCourse.category} • {selectedCourse.level}</p>
                  </div>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={handlePreviewCourse}>
                      <i className="bi bi-eye me-2"></i>Preview
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-pill px-3"
                      onClick={handleArchiveCourse}
                      disabled={selectedCourse.status === 'archived'}
                    >
                      <i className="bi bi-archive me-2"></i>{selectedCourse.status === 'archived' ? 'Archived' : 'Archive'}
                    </Button>
                  </Stack>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-dashboard-tabs mb-4 border-bottom">
                  <Tab eventKey="lessons" title={<span><i className="bi bi-play-circle me-2"></i>Curriculum</span>}>
                    <div className="mt-4">
                      <div className="bg-body bg-opacity-25 rounded-4 p-4 mb-4 border border-info border-opacity-25 shadow-sm">
                        <h6 className="fw-bold mb-3">{editingLessonIndex !== null ? '🖊️ Edit Lesson' : '✨ Add New Lesson'}</h6>
                        <Row className="g-3 mb-3">
                          <Col md={8}>
                            <Form.Group>
                              <Form.Label className="small fw-semibold">Lesson Title</Form.Label>
                              <Form.Control
                                className="glass-input"
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                placeholder="e.g. Master the useState Hook"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="small fw-semibold">Duration</Form.Label>
                              <Form.Control
                                className="glass-input"
                                value={lessonForm.duration}
                                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                placeholder="15m"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-semibold">Video URL (YouTube)</Form.Label>
                          <Form.Control
                            className="glass-input"
                            value={lessonForm.videoUrl}
                            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                            placeholder="https://youtube.com/embed/..."
                          />
                        </Form.Group>

                        {/* Lesson Resource List Preview */}
                        {lessonForm.resources?.length > 0 && (
                          <div className="mb-3">
                            <Form.Label className="small fw-semibold">Attached Resources ({lessonForm.resources.length})</Form.Label>
                            <ListGroup className="rounded-3 overflow-hidden border">
                              {lessonForm.resources.map((res, idx) => (
                                <ListGroup.Item key={idx} className="p-2 py-1 bg-light bg-opacity-10 border-0 border-bottom d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                                    <i className="bi bi-file-earmark-text text-primary"></i>
                                    <span className="small text-truncate" style={{ maxWidth: '200px' }}>{res.name}</span>
                                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>({res.size})</span>
                                  </div>
                                  <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => handleRemoveLessonResource(idx)}>
                                    <i className="bi bi-x-circle"></i>
                                  </Button>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                        )}
                        <div className="d-flex gap-2">
                          <Button size="sm" onClick={handleAddLesson} className="rounded-pill px-4">
                            {editingLessonIndex !== null ? 'Save Changes' : 'Add to Curriculum'}
                          </Button>
                          <Button size="sm" variant="outline-secondary" className="rounded-pill px-4" onClick={() => lessonFileRef.current.click()}>
                            <i className="bi bi-cloud-arrow-up me-2"></i>Files
                          </Button>
                          <input type="file" multiple ref={lessonFileRef} style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'lesson')} />
                          {editingLessonIndex !== null && (
                            <Button variant="link" onClick={() => { setEditingLessonIndex(null); setLessonForm({ title: '', duration: '10m', videoUrl: '', description: '', resources: [] }) }}>Cancel</Button>
                          )}
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="fw-bold mb-0">Lessons ({selectedCourse.lessons?.length || 0})</h6>
                        <Badge bg="body" className="text-dark border rounded-pill py-2 px-3 fw-normal small">Drag to reorder</Badge>
                      </div>

                      <ListGroup className="rounded-4 overflow-hidden border">
                        {selectedCourse.lessons?.map((lesson, idx) => (
                          <ListGroup.Item key={idx} className="p-3 glass-hover border-0 border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle small d-flex align-items-center justify-content-center fw-bold" style={{ width: 24, height: 24 }}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="fw-semibold">{lesson.title}</div>
                                  <div className="text-lumina-muted small">{lesson.duration} • {lesson.resources?.length || 0} assets</div>
                                </div>
                              </div>
                              <Button variant="outline-primary" size="sm" className="rounded-pill opacity-75-hover" onClick={() => { setEditingLessonIndex(idx); setLessonForm(lesson) }}>
                                Edit
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  </Tab>
                  <Tab eventKey="resources" title={<span><i className="bi bi-folder2-open me-2"></i>Resources</span>}>
                    <div className="mt-4">
                      <div className="bg-body bg-opacity-25 rounded-4 p-4 mb-4 border border-primary border-opacity-25 shadow-sm">
                        <h6 className="fw-bold mb-3">📦 Course-Wide Resources</h6>
                        <p className="text-lumina-muted small mb-4">
                          Upload files that will be available to all students enrolled in this course (e.g., Syllabus, Setup Guides).
                        </p>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="primary" className="rounded-pill px-4" onClick={() => courseFileRef.current.click()}>
                            <i className="bi bi-cloud-arrow-up me-2"></i>Upload Course Files
                          </Button>
                          <input type="file" multiple ref={courseFileRef} style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'course')} />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3">General Resources ({selectedCourse.courseResources?.length || 0})</h6>
                      {selectedCourse.courseResources?.length === 0 ? (
                        <div className="text-center py-4 border rounded-4 bg-light bg-opacity-10 mb-4">
                          <p className="text-muted mb-0 small">No course-wide resources added yet.</p>
                        </div>
                      ) : (
                        <ListGroup className="rounded-4 overflow-hidden border mb-4">
                          {selectedCourse.courseResources?.map((resource, idx) => (
                            <ListGroup.Item key={idx} className="p-3 glass-hover border-0 border-bottom d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-arrow-up text-primary fs-5"></i>
                                <div>
                                  <div className="fw-semibold small">{resource.name}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{resource.size} • {new Date(resource.uploadedAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <Button size="sm" variant="link" as="a" href={resource.url} target="_blank" className="p-0 text-primary">
                                  <i className="bi bi-download"></i>
                                </Button>
                                <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => handleRemoveCourseResource(idx)}>
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}

                      <h6 className="fw-bold mb-3">Lesson Resources</h6>
                      {selectedCourse.lessons?.some(l => l.resources?.length > 0) ? (
                        <ListGroup className="rounded-4 overflow-hidden border">
                          {selectedCourse.lessons?.flatMap((lesson, lIdx) =>
                            lesson.resources?.map((res, rIdx) => (
                              <ListGroup.Item key={`${lIdx}-${rIdx}`} className="p-3 glass-hover border-0 border-bottom d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                  <Badge bg="secondary" className="rounded-pill" style={{ fontSize: '0.6rem' }}>{lesson.title}</Badge>
                                  <div className="fw-semibold small ms-2">{res.name}</div>
                                </div>
                                <Button size="sm" variant="link" as="a" href={res.url} target="_blank" className="p-0 text-primary">
                                  <i className="bi bi-download"></i>
                                </Button>
                              </ListGroup.Item>
                            ))
                          )}
                        </ListGroup>
                      ) : (
                        <div className="text-center py-4 border rounded-4 bg-light bg-opacity-10">
                          <p className="text-muted mb-0 small">No lesson-specific resources found.</p>
                        </div>
                      )}
                    </div>
                  </Tab>
                  <Tab eventKey="assignments" title={<span><i className="bi bi-file-earmark-text me-2"></i>Assignments</span>}>
                    <div className="mt-4">
                      <div className="bg-body bg-opacity-25 rounded-4 p-4 mb-4 border border-warning border-opacity-25 shadow-sm">
                        <h6 className="fw-bold mb-3">📝 Create Assignment</h6>
                        <Row className="g-3 mb-3">
                          <Col md={8}>
                            <Form.Group>
                              <Form.Label className="small fw-semibold">Assignment Title</Form.Label>
                              <Form.Control
                                className="glass-input"
                                value={assignmentForm.title}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                placeholder="e.g. Final Project Submission"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="small fw-semibold">Max Score</Form.Label>
                              <Form.Control
                                type="number"
                                className="glass-input"
                                value={assignmentForm.maxScore}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: parseInt(e.target.value) })}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-semibold">Description & Instructions</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            className="glass-input text-white bg-dark"
                            value={assignmentForm.description}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                            placeholder="Detail the requirements, constraints, and submission format..."
                          />
                        </Form.Group>
                        <Row className="mb-4">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small fw-semibold">Due Date (Optional)</Form.Label>
                              <Form.Control
                                type="date"
                                className="glass-input"
                                value={assignmentForm.dueDate}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="warning" onClick={handleAddAssignment} className="rounded-pill px-4 fw-bold">
                            {editingAssignmentId ? 'Save Changes' : 'Create Assignment'}
                          </Button>
                          {editingAssignmentId && (
                            <Button size="sm" variant="outline-secondary" onClick={() => { setEditingAssignmentId(null); setAssignmentForm({ title: '', description: '', dueDate: '', maxScore: 100 }); }} className="rounded-pill px-3">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3">Course Assignments ({courseAssignments.length})</h6>
                      <ListGroup className="rounded-4 overflow-hidden border">
                        {courseAssignments.length === 0 ? (
                          <div className="text-center py-4 text-muted small">No assignments created yet.</div>
                        ) : (
                          courseAssignments.map((a, idx) => (
                            <ListGroup.Item key={idx} className="p-3 glass-hover border-0 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">{a.title}</div>
                                  <div className="text-lumina-muted small">Max Score: {a.maxScore} {a.dueDate && `• Due: ${new Date(a.dueDate).toLocaleDateString()}`}</div>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => handleEditAssignment(a)}>Edit</Button>
                                  <div className="text-warning small fw-bold d-flex align-items-center">Live</div>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </div>
                  </Tab>
                  <Tab eventKey="quizzes" title={<span><i className="bi bi-question-diamond me-2"></i>Quizzes</span>}>
                    <div className="mt-4">
                      <div className="bg-body bg-opacity-25 rounded-4 p-4 mb-4 border border-success border-opacity-25 shadow-sm">
                        <h6 className="fw-bold mb-3">🧠 Create Quiz</h6>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-semibold">Quiz Title</Form.Label>
                          <Form.Control
                            className="glass-input"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                            placeholder="e.g. Mid-term Assessment"
                          />
                        </Form.Group>
                        <Row className="mb-4 d-flex align-items-end">
                          <Col md={8}>
                            <div className="bg-dark bg-opacity-25 p-3 rounded-4 border border-dashed mb-3">
                              <h6 className="small fw-bold mb-3">Add Question</h6>
                              <Form.Group className="mb-2">
                                <Form.Control
                                  size="sm"
                                  className="glass-input"
                                  placeholder="Enter question text..."
                                  value={questionForm.question}
                                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                />
                              </Form.Group>
                              <Row className="g-2 mb-2">
                                {questionForm.options.map((opt, i) => (
                                  <Col md={6} key={i}>
                                    <InputGroup size="sm">
                                      <InputGroup.Radio
                                        name="correctAnswer"
                                        checked={questionForm.correctAnswer === i}
                                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })}
                                      />
                                      <Form.Control
                                        className="glass-input"
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...questionForm.options];
                                          newOpts[i] = e.target.value;
                                          setQuestionForm({ ...questionForm, options: newOpts });
                                        }}
                                      />
                                    </InputGroup>
                                  </Col>
                                ))}
                              </Row>
                              <Button size="sm" variant="outline-success" className="w-100 rounded-pill" onClick={handleAddQuestionToQuiz}>
                                Add Question to Quiz
                              </Button>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="p-3 bg-dark bg-opacity-10 rounded-4 h-100">
                              <Form.Label className="small fw-semibold">Pass Threshold (%)</Form.Label>
                              <Form.Control
                                type="number"
                                className="glass-input mb-3"
                                value={quizForm.passThreshold}
                                onChange={(e) => setQuizForm({ ...quizForm, passThreshold: parseInt(e.target.value) })}
                              />
                              <div className="small fw-bold mb-2">Build Summary</div>
                              <div className="small text-lumina-muted mb-1">• {quizForm.questions.length} questions added</div>
                              <div className="small text-lumina-muted">• Req: {quizForm.passThreshold}% to pass</div>
                            </div>
                          </Col>
                        </Row>

                        {quizForm.questions.length > 0 && (
                          <div className="mb-3">
                            <Form.Label className="small fw-bold">Draft Questions</Form.Label>
                            <ListGroup className="rounded-3 overflow-hidden border">
                              {quizForm.questions.map((q, idx) => (
                                <ListGroup.Item key={idx} className="p-2 small glass-hover border-0 border-bottom d-flex justify-content-between align-items-center">
                                  <span>{idx + 1}. {q.question}</span>
                                  <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => handleRemoveQuestion(idx)}><i className="bi bi-trash"></i></Button>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <Button size="sm" variant="success" onClick={handleAddQuiz} className="rounded-pill px-4 fw-bold shadow-sm">
                            {editingQuizId ? 'Save Changes' : 'Publish Quiz'}
                          </Button>
                          {editingQuizId && (
                            <Button size="sm" variant="outline-secondary" onClick={() => { setEditingQuizId(null); setQuizForm({ title: '', description: '', passThreshold: 70, questions: [] }); }} className="rounded-pill px-3">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3">Course Quizzes ({courseQuizzes.length})</h6>
                      <ListGroup className="rounded-4 overflow-hidden border">
                        {courseQuizzes.length === 0 ? (
                          <div className="text-center py-4 text-muted small">No quizzes created yet.</div>
                        ) : (
                          courseQuizzes.map((q, idx) => (
                            <ListGroup.Item key={idx} className="p-3 glass-hover border-0 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">{q.title}</div>
                                  <div className="text-lumina-muted small">{q.questions?.length || 0} Questions • Pass: {q.passThreshold}%</div>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => handleEditQuiz(q)}>Edit</Button>
                                  <Badge bg="success" className="rounded-pill d-flex align-items-center">Active</Badge>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </div>
                  </Tab>
                  <Tab eventKey="grading" title={<span><i className="bi bi-check2-all me-2"></i>Grading</span>}>
                    <div className="mt-4">
                      <AssignmentGrading courseId={selectedCourseId} />
                    </div>
                  </Tab>
                  <Tab eventKey="settings" title={<span><i className="bi bi-gear me-2"></i>Settings</span>}>
                    <div className="mt-4">
                      <div className="bg-body bg-opacity-25 rounded-4 p-4 border shadow-sm">
                        <h6 className="fw-bold mb-4">⚙️ Course Settings</h6>
                        <Form onSubmit={handleUpdateSettings}>
                          <Row className="g-4">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-lumina-muted">Course Title</Form.Label>
                                <Form.Control
                                  className="glass-input"
                                  value={settingsForm.title}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                                />
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-lumina-muted">Category</Form.Label>
                                <Form.Select
                                  className="glass-input"
                                  value={settingsForm.category}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                                >
                                  <option>Development</option>
                                  <option>Design</option>
                                  <option>Business</option>
                                  <option>Marketing</option>
                                  <option>Data Science</option>
                                </Form.Select>
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-lumina-muted">Price ($)</Form.Label>
                                <Form.Control
                                  type="number"
                                  className="glass-input"
                                  value={settingsForm.price}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, price: parseFloat(e.target.value) })}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-lumina-muted">Difficulty Level</Form.Label>
                                <Form.Select
                                  className="glass-input"
                                  value={settingsForm.level}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, level: e.target.value })}
                                >
                                  <option>Beginner</option>
                                  <option>Intermediate</option>
                                  <option>Advanced</option>
                                </Form.Select>
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-lumina-muted">Course Summary</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={5}
                                  className="glass-input"
                                  value={settingsForm.summary}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, summary: e.target.value })}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <hr className="my-4 opacity-25" />
                          <div className="d-flex justify-content-end">
                            <Button type="submit" variant="primary" className="rounded-pill px-4 fw-bold">
                              Save Settings
                            </Button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* New Course Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small">Course Title</Form.Label>
              <Form.Control
                className="glass-input p-3"
                placeholder="e.g. Master the Art of Digital Painting"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </Form.Group>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Category</Form.Label>
                  <Form.Select className="glass-input p-3" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}>
                    <option>Development</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Marketing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Level</Form.Label>
                  <Form.Select className="glass-input p-3" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small">Price (ETB)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                className="glass-input p-3"
                placeholder="e.g. 99.99"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
              />
              <Form.Text className="text-muted small">
                Set to 0 for free courses
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small">Summary</Form.Label>
              <Form.Control
                as="textarea" rows={3}
                className="glass-input p-3"
                placeholder="Briefly describe what students will achieve..."
                value={newCourse.summary}
                onChange={(e) => setNewCourse({ ...newCourse, summary: e.target.value })}
              />
            </Form.Group>
            <div className="d-grid">
              <Button className="rounded-4 py-3 fw-bold" variant="primary" onClick={handleCreateCourse} disabled={!newCourse.title}>
                Launch Draft Workspace
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .glass-card {
          background: var(--lumina-surface);
          border: 1px solid var(--lumina-border) !important;
          backdrop-filter: blur(10px);
        }
        .glass-hover:hover {
          background: var(--lumina-surface-hover);
          cursor: pointer;
        }
        .custom-dashboard-list .list-group-item.active {
          border: none !important;
          background: linear-gradient(135deg, var(--bs-primary) 0%, #7000ff 100%) !important;
        }
        .active-course-shadow {
          box-shadow: 0 10px 20px -5px rgba(var(--bs-primary-rgb), 0.3);
        }
        .custom-dashboard-tabs .nav-link {
          border: none !important;
          color: var(--lumina-text-muted);
          font-weight: 600;
          padding: 1rem 1.5rem;
          background: transparent !important;
        }
        .custom-dashboard-tabs .nav-link.active {
          color: var(--bs-primary) !important;
          border-bottom: 3px solid var(--bs-primary) !important;
        }
        .glass-input {
          background: var(--lumina-bg) !important;
          border: 1px solid var(--lumina-border) !important;
          color: var(--lumina-text) !important;
          border-radius: 12px;
        }
        .glass-input:focus {
          border-color: var(--bs-primary) !important;
          box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default InstructorDashboard;
