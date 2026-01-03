import { useState, useRef } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  ListGroup,
  Modal,
  ProgressBar,
  Row,
  Tab,
  Table,
  Tabs
} from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout.jsx';
import AssignmentGrading from '../components/AssignmentGrading.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const INSTRUCTOR_NAV_ITEMS = [
  { label: 'Dashboard', to: '/instructor/dashboard' },
  { label: 'Create Course', to: '/instructor/create' }
];

const CourseBuilder = () => {
  const { user } = useAuth();
  const {
    courses,
    addCourseDraft,
    addAssignment,
    getAssignments,
    addInstructorQuiz,
    getInstructorQuizzes,
    updateCourse
  } = useData();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const lessonFileRef = useRef(null);
  const courseFileRef = useRef(null);

  // Course creation state
  const [course, setCourse] = useState({
    title: '',
    category: 'Development',
    level: 'Beginner',
    summary: '',
    price: 0,
    duration: '4 weeks',
    language: 'English',
    tags: [],
    tagsInput: '',
    outcomes: [],
    lessons: []
  });

  // Lesson management
  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '10m',
    videoUrl: '',
    description: '',
    resources: []
  });
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);


  // Assignment management
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100
  });

  // Quiz management
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passThreshold: 70,
    questions: []
  });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const selectedCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;
  const courseAssignments = selectedCourseId ? getAssignments(selectedCourseId) : [];
  const courseQuizzes = selectedCourseId ? getInstructorQuizzes(selectedCourseId) : [];

  // Show all courses for instructor (including pending ones) so they can continue building
  const instructorCourses = courses.filter(
    (c) => c.authorId === user?.id || c.instructor === user?.email || c.instructor?.includes(user?.email)
  );

  const handleCreateCourse = () => {
    addCourseDraft({
      ...course,
      authorId: user?.id,
      instructor: user?.email,
      courseResources: []
    });
    alert('Course draft created and sent for admin approval! You can now add lessons, resources, assignments, and quizzes. The course will appear in the catalog once approved by an admin.');
    setShowCourseModal(false);
    setCourse({
      title: '',
      category: 'Development',
      level: 'Beginner',
      summary: '',
      price: 0,
      duration: '4 weeks',
      language: 'English',
      tags: [],
      tagsInput: '',
      outcomes: [],
      lessons: [],
      courseResources: []
    });
  };

  const handleAddLesson = () => {
    if (!selectedCourseId || !lessonForm.title.trim()) return;

    let updatedLessons;
    const newLesson = {
      ...lessonForm,
      resources: (lessonForm.resources || []).filter((r) => {
        if (typeof r === 'string') return r.trim().length > 0;
        return !!r;
      })
    };

    if (editingLessonIndex !== null) {
      // Update existing lesson
      updatedLessons = [...(selectedCourse.lessons || [])];
      updatedLessons[editingLessonIndex] = newLesson;
      setEditingLessonIndex(null);
      alert('Lesson updated successfully!');
    } else {
      // Add new lesson
      updatedLessons = [...(selectedCourse.lessons || []), newLesson];
      alert('Lesson added successfully!');
    }

    updateCourse(selectedCourseId, { lessons: updatedLessons });
    setLessonForm({ title: '', duration: '10m', videoUrl: '', description: '', resources: [] });
  };

  const handleEditLesson = (index) => {
    const lessonToEdit = selectedCourse.lessons[index];
    setLessonForm({ ...lessonToEdit });
    setEditingLessonIndex(index);
  };

  const handleCancelEdit = () => {
    setLessonForm({ title: '', duration: '10m', videoUrl: '', description: '', resources: [] });
    setEditingLessonIndex(null);
  };

  const handleFileSelect = (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newResources = Array.from(files).map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'Unknown',
      url: URL.createObjectURL(file), // Generate temporary URL
      uploadedAt: new Date().toISOString()
    }));

    if (type === 'lesson') {
      setLessonForm(prev => ({
        ...prev,
        resources: [...(prev.resources || []), ...newResources]
      }));
    } else {
      if (!selectedCourseId) return;
      const currentResources = selectedCourse.courseResources || [];
      const updatedResources = [...currentResources, ...newResources];
      updateCourse(selectedCourseId, { courseResources: updatedResources });
      alert(`${newResources.length} resource(s) uploaded successfully!`);
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemoveCourseResource = (index) => {
    if (!selectedCourseId) return;
    const currentResources = selectedCourse.courseResources || [];
    const updatedResources = currentResources.filter((_, i) => i !== index);
    updateCourse(selectedCourseId, { courseResources: updatedResources });
  };

  const handleCreateAssignment = () => {
    if (!selectedCourseId || !assignmentForm.title.trim()) return;
    addAssignment(selectedCourseId, assignmentForm);
    setAssignmentForm({ title: '', description: '', dueDate: '', maxScore: 100 });
    alert('Assignment created successfully!');
  };

  const handleAddQuestion = () => {
    if (!questionForm.question.trim() || questionForm.options.some((o) => !o.trim())) return;
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          ...questionForm,
          options: questionForm.options.filter((o) => o.trim())
        }
      ]
    });
    setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const handleCreateQuiz = () => {
    if (!selectedCourseId || !quizForm.title.trim() || quizForm.questions.length === 0) return;
    addInstructorQuiz(selectedCourseId, quizForm);
    setQuizForm({ title: '', description: '', passThreshold: 70, questions: [] });
    alert('Quiz created successfully!');
  };

  return (
    <DashboardLayout
      title="Instructor Navigation"
      navItems={INSTRUCTOR_NAV_ITEMS}
    >
      <Row className="g-3">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>My Courses</span>
                <Button size="sm" variant="primary" onClick={() => setShowCourseModal(true)}>
                  + New
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {instructorCourses.length === 0 ? (
                  <ListGroup.Item className="text-muted text-center">
                    No courses yet. Create one!
                  </ListGroup.Item>
                ) : (
                  instructorCourses.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      action
                      active={selectedCourseId === c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                    >
                      <div className="fw-semibold">{c.title}</div>
                      <small className="text-muted">{c.category}</small>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {!selectedCourse ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <h5>Select a Course</h5>
                <p className="text-muted">
                  Choose a course from the sidebar to manage lessons, resources, assignments, and quizzes.
                </p>
                <Button onClick={() => setShowCourseModal(true)}>Create New Course</Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>{selectedCourse.title}</span>
                    {selectedCourse.status === 'pending' && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Pending Approval
                      </Badge>
                    )}
                    {selectedCourse.status === 'approved' && (
                      <Badge bg="success" className="ms-2">
                        Approved
                      </Badge>
                    )}
                  </div>
                  <Badge bg="info">{selectedCourse.category}</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                  {/* Lessons Tab */}
                  <Tab eventKey="lessons" title="Lessons">
                    <h6 className="mb-3">{editingLessonIndex !== null ? 'Edit Lesson' : 'Add New Lesson'}</h6>
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Lesson Title</Form.Label>
                          <Form.Control
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            placeholder="e.g. Introduction to React Hooks"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Duration</Form.Label>
                          <Form.Control
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                            placeholder="10m"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Video URL</Form.Label>
                          <Form.Control
                            value={lessonForm.videoUrl}
                            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                            placeholder="YouTube embed URL"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        placeholder="What will students learn in this lesson?"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Resources</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="file"
                          multiple
                          ref={lessonFileRef}
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileSelect(e, 'lesson')}
                        />
                        <Button
                          variant="outline-primary"
                          onClick={() => lessonFileRef.current.click()}
                          className="w-100"
                        >
                          <i className="bi bi-cloud-upload me-2"></i>
                          Upload Resource Files from Device
                        </Button>
                      </div>
                      {lessonForm.resources.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                          {lessonForm.resources.map((r, idx) => (
                            <Badge key={idx} bg="secondary" className="p-2">
                              {typeof r === 'string' ? r : r.name}
                              <Button
                                variant="link"
                                className="text-white p-0 ms-2"
                                onClick={() => {
                                  setLessonForm({
                                    ...lessonForm,
                                    resources: lessonForm.resources.filter((_, i) => i !== idx)
                                  });
                                }}
                              >
                                &times;
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button onClick={handleAddLesson} disabled={!lessonForm.title.trim()}>
                        {editingLessonIndex !== null ? 'Update Lesson' : 'Add Lesson'}
                      </Button>
                      {editingLessonIndex !== null && (
                        <Button variant="outline-secondary" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      )}
                    </div>

                    <hr className="my-4" />

                    <h6 className="mb-3">Course Lessons ({selectedCourse.lessons?.length || 0})</h6>
                    {selectedCourse.lessons?.length === 0 ? (
                      <Alert variant="info">No lessons added yet.</Alert>
                    ) : (
                      <ListGroup>
                        {selectedCourse.lessons?.map((lesson, idx) => (
                          <ListGroup.Item key={idx}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">{lesson.title}</div>
                                <small className="text-muted">{lesson.duration}</small>
                                {lesson.description && (
                                  <div className="small mt-1">{lesson.description}</div>
                                )}
                                {lesson.resources?.length > 0 && (
                                  <div className="mt-2 text-wrap">
                                    {lesson.resources.map((r, rIdx) => (
                                      <Badge key={rIdx} bg="light" text="dark" className="me-1 border small">
                                        <i className="bi bi-file-earmark me-1"></i>
                                        {typeof r === 'string' ? r : r.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="d-flex gap-2 align-items-center">
                                <Badge bg="info">{idx + 1}</Badge>
                                <Button size="sm" variant="outline-primary" onClick={() => handleEditLesson(idx)}>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Tab>

                  {/* Resources Tab */}
                  <Tab eventKey="resources" title="Resources">
                    <Alert variant="primary" className="mb-3">
                      <strong>Course:</strong> {selectedCourse.title} - Add resources that will be available to all students enrolled in this course.
                    </Alert>

                    <h6 className="mb-3">Add Course-Level Resources</h6>
                    <p className="text-muted small mb-3">
                      These resources will be available to all students in this course (e.g., course syllabus, general materials, templates).
                    </p>
                    <div className="d-flex gap-2 mb-3">
                      <input
                        type="file"
                        multiple
                        ref={courseFileRef}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(e, 'course')}
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() => courseFileRef.current.click()}
                        className="w-100"
                      >
                        <i className="bi bi-cloud-upload me-2"></i>
                        Upload Course Files from Device
                      </Button>
                    </div>

                    <h6 className="mb-2">Course Resources ({selectedCourse.courseResources?.length || 0})</h6>
                    {selectedCourse.courseResources?.length === 0 ? (
                      <Alert variant="info">No course-level resources added yet.</Alert>
                    ) : (
                      <ListGroup className="mb-4">
                        {selectedCourse.courseResources?.map((resource, idx) => (
                          <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                            <div>
                              <Badge bg="primary" className="me-2 text-uppercase" style={{ fontSize: '0.65rem' }}>Course File</Badge>
                              <span className="fw-medium">{typeof resource === 'string' ? resource : resource.name}</span>
                              {resource.size && <small className="text-muted ms-2 text-lowercase">({resource.size})</small>}
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveCourseResource(idx)}
                              style={{ borderRadius: '8px' }}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}

                    <hr className="my-4" />

                    <h6 className="mb-3">Lesson-Specific Resources</h6>
                    <p className="text-muted small mb-3">
                      Resources attached to specific lessons (added in the Lessons tab).
                    </p>
                    {selectedCourse.lessons?.some((l) => l.resources?.length > 0) ? (
                      <ListGroup>
                        {selectedCourse.lessons
                          ?.flatMap((lesson, lIdx) =>
                            lesson.resources?.map((resource, rIdx) => ({
                              lessonTitle: lesson.title,
                              resource,
                              key: `${lIdx}-${rIdx}`
                            })) || []
                          )
                          .map((item) => (
                            <ListGroup.Item key={item.key} className="d-flex align-items-center">
                              <Badge bg="secondary" className="me-2">
                                {item.lessonTitle}
                              </Badge>
                              <span className="flex-grow-1">{typeof item.resource === 'string' ? item.resource : item.resource.name}</span>
                              {item.resource.size && <Badge bg="light" text="dark" className="border small ms-2 text-lowercase">{item.resource.size}</Badge>}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">No lesson-specific resources added yet.</Alert>
                    )}
                  </Tab>

                  {/* Assignments Tab */}
                  <Tab eventKey="assignments" title="Assignments">
                    <Alert variant="primary" className="mb-3">
                      <strong>Course:</strong> {selectedCourse.title} - Create assignments for this course.
                    </Alert>
                    <Tabs defaultActiveKey="create" className="mb-3">
                      <Tab eventKey="create" title="Create Assignment">
                        <h6 className="mb-3">Create New Assignment for {selectedCourse.title}</h6>
                        <Row className="g-3 mb-3">
                          <Col md={8}>
                            <Form.Group>
                              <Form.Label>Assignment Title</Form.Label>
                              <Form.Control
                                value={assignmentForm.title}
                                onChange={(e) =>
                                  setAssignmentForm({ ...assignmentForm, title: e.target.value })
                                }
                                placeholder="e.g. Build a Todo App"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Max Score</Form.Label>
                              <Form.Control
                                type="number"
                                value={assignmentForm.maxScore}
                                onChange={(e) =>
                                  setAssignmentForm({ ...assignmentForm, maxScore: Number(e.target.value) })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={assignmentForm.description}
                            onChange={(e) =>
                              setAssignmentForm({ ...assignmentForm, description: e.target.value })
                            }
                            placeholder="Describe what students need to do..."
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={assignmentForm.dueDate}
                            onChange={(e) =>
                              setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Button onClick={handleCreateAssignment} disabled={!assignmentForm.title.trim()}>
                          Create Assignment
                        </Button>

                        <hr className="my-4" />

                        <h6 className="mb-3">Course Assignments ({courseAssignments.length})</h6>
                        {courseAssignments.length === 0 ? (
                          <Alert variant="info">No assignments created yet.</Alert>
                        ) : (
                          <Table striped bordered hover>
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Due Date</th>
                                <th>Max Score</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courseAssignments.map((assignment) => (
                                <tr key={assignment.id}>
                                  <td>{assignment.title}</td>
                                  <td>{assignment.dueDate || 'No due date'}</td>
                                  <td>{assignment.maxScore}</td>
                                  <td>
                                    <Badge bg="success">Active</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Tab>
                      <Tab eventKey="grade" title="Grade Submissions">
                        <AssignmentGrading courseId={selectedCourseId} />
                      </Tab>
                    </Tabs>
                  </Tab>

                  {/* Quizzes Tab */}
                  <Tab eventKey="quizzes" title="Quizzes">
                    <Alert variant="primary" className="mb-3">
                      <strong>Course:</strong> {selectedCourse.title} - Create quizzes for this course.
                    </Alert>
                    <h6 className="mb-3">Create New Quiz for {selectedCourse.title}</h6>
                    <Row className="g-3 mb-3">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label>Quiz Title</Form.Label>
                          <Form.Control
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                            placeholder="e.g. React Hooks Quiz"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Pass Threshold (%)</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            max={100}
                            value={quizForm.passThreshold}
                            onChange={(e) =>
                              setQuizForm({ ...quizForm, passThreshold: Number(e.target.value) })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        placeholder="Quiz description..."
                      />
                    </Form.Group>

                    <hr className="my-3" />

                    <h6 className="mb-3">Add Questions ({quizForm.questions.length})</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Question</Form.Label>
                      <Form.Control
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="Enter the question..."
                      />
                    </Form.Group>
                    <Row className="g-2 mb-3">
                      {questionForm.options.map((opt, optIdx) => (
                        <Col md={6} key={optIdx}>
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check
                              type="radio"
                              name="correct-option"
                              checked={questionForm.correctAnswer === optIdx}
                              onChange={() =>
                                setQuestionForm({ ...questionForm, correctAnswer: optIdx })
                              }
                            />
                            <Form.Control
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[optIdx] = e.target.value;
                                setQuestionForm({ ...questionForm, options: newOptions });
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Explanation (shown after quiz)</Form.Label>
                      <Form.Control
                        value={questionForm.explanation}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, explanation: e.target.value })
                        }
                        placeholder="Explain why this is the correct answer..."
                      />
                    </Form.Group>
                    <Button
                      onClick={handleAddQuestion}
                      disabled={
                        !questionForm.question.trim() ||
                        questionForm.options.some((o) => !o.trim()) ||
                        questionForm.options.filter((o) => o.trim()).length < 2
                      }
                    >
                      Add Question
                    </Button>

                    {quizForm.questions.length > 0 && (
                      <>
                        <hr className="my-3" />
                        <h6 className="mb-2">Quiz Questions ({quizForm.questions.length})</h6>
                        <ListGroup className="mb-3">
                          {quizForm.questions.map((q, qIdx) => (
                            <ListGroup.Item key={qIdx}>
                              <div className="fw-semibold">Q{qIdx + 1}: {q.question}</div>
                              <div className="small mt-1">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className={optIdx === q.correctAnswer ? 'text-success' : ''}>
                                    {optIdx === q.correctAnswer ? '✓ ' : '  '}
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <Button
                          onClick={handleCreateQuiz}
                          disabled={!quizForm.title.trim() || quizForm.questions.length === 0}
                          variant="success"
                        >
                          Create Quiz
                        </Button>
                      </>
                    )}

                    <hr className="my-4" />

                    <h6 className="mb-3">Course Quizzes ({courseQuizzes.length})</h6>
                    {courseQuizzes.length === 0 ? (
                      <Alert variant="info">No quizzes created yet.</Alert>
                    ) : (
                      <ListGroup>
                        {courseQuizzes.map((quiz) => (
                          <ListGroup.Item key={quiz.id}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">{quiz.title}</div>
                                {quiz.description && <div className="small text-muted">{quiz.description}</div>}
                                <div className="small mt-1">
                                  {quiz.questions?.length || 0} questions • Pass: {quiz.passThreshold}%
                                </div>
                              </div>
                              <Badge bg="info">Active</Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Create Course Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Title</Form.Label>
              <Form.Control
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="e.g. Advanced React Patterns"
              />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={course.category}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  >
                    <option>Development</option>
                    <option>Design</option>
                    <option>Data Science</option>
                    <option>Marketing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    value={course.level}
                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={course.summary}
                onChange={(e) => setCourse({ ...course, summary: e.target.value })}
                placeholder="Brief course description..."
              />
            </Form.Group>
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Price (ETB)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={course.price}
                    onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    value={course.duration}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    placeholder="e.g. 6 weeks"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Select
                    value={course.language}
                    onChange={(e) => setCourse({ ...course, language: e.target.value })}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Tags</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  value={course.tagsInput || ''}
                  onChange={(e) => setCourse({ ...course, tagsInput: e.target.value })}
                  placeholder="Add tags (e.g. React, Frontend)... Press Enter to add"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (course.tagsInput?.trim()) {
                        setCourse({
                          ...course,
                          tags: [...(course.tags || []), course.tagsInput.trim()],
                          tagsInput: ''
                        });
                      }
                    }
                  }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    if (course.tagsInput?.trim()) {
                      setCourse({
                        ...course,
                        tags: [...(course.tags || []), course.tagsInput.trim()],
                        tagsInput: ''
                      });
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 d-flex flex-wrap gap-1">
                {course.tags && course.tags.map((tag, idx) => (
                  <Badge key={idx} bg="light" text="dark" className="border">
                    {tag} <span style={{ cursor: 'pointer' }} onClick={() => {
                      setCourse({
                        ...course,
                        tags: course.tags.filter((_, i) => i !== idx)
                      });
                    }}>&times;</span>
                  </Badge>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateCourse}
            disabled={!course.title.trim() || !course.summary.trim()}
          >
            Create Course
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default CourseBuilder;
