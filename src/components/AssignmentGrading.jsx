import { useState } from 'react';
import { Alert, Badge, Button, Card, Form, ListGroup, Modal, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const AssignmentGrading = ({ courseId }) => {
  const { user } = useAuth();
  const { getAssignments, getSubmissionsByCourse, gradeAssignment, users } = useData();
  const assignments = getAssignments(courseId);
  const allSubmissions = getSubmissionsByCourse(courseId);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const getSubmissionsForAssignment = (assignmentId) => {
    return allSubmissions.filter((s) => s.assignmentId === assignmentId);
  };

  const getStudentName = (userId) => {
    const student = users.find((u) => u.id === userId);
    return student?.email || `Student ${userId.slice(0, 8)}`;
  };

  const handleGrade = () => {
    if (!selectedSubmission || !grade || grade < 0) return;
    const assignment = assignments.find((a) => a.id === selectedSubmission.assignmentId);
    if (grade > assignment.maxScore) {
      alert(`Grade cannot exceed max score of ${assignment.maxScore}`);
      return;
    }
    gradeAssignment(selectedSubmission.id, Number(grade), feedback);
    setSelectedSubmission(null);
    setGrade('');
    setFeedback('');
    alert('Assignment graded successfully!');
  };

  return (
    <div>
      <h5 className="mb-3">Assignment Submissions & Grading</h5>
      {assignments.length === 0 ? (
        <Alert variant="info">No assignments created for this course yet.</Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {assignments.map((assignment) => {
            const submissions = getSubmissionsForAssignment(assignment.id);
            const pendingCount = submissions.filter((s) => !s.graded).length;
            const gradedCount = submissions.filter((s) => s.graded).length;

            return (
              <Card key={assignment.id} className="shadow-sm">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{assignment.title}</strong>
                      <div className="small text-muted mt-1">
                        Max Score: {assignment.maxScore} • Due: {assignment.dueDate || 'No due date'}
                      </div>
                    </div>
                    <div>
                      <Badge bg="warning" className="me-2">
                        {pendingCount} Pending
                      </Badge>
                      <Badge bg="success">{gradedCount} Graded</Badge>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  {submissions.length === 0 ? (
                    <Alert variant="info">No submissions yet.</Alert>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Submitted</th>
                          <th>Status</th>
                          <th>Grade</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>{getStudentName(submission.userId)}</td>
                            <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                            <td>
                              {submission.graded ? (
                                <Badge bg="success">Graded</Badge>
                              ) : (
                                <Badge bg="warning">Pending</Badge>
                              )}
                            </td>
                            <td>
                              {submission.graded ? (
                                <strong>
                                  {submission.grade}/{assignment.maxScore}
                                </strong>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant={submission.graded ? 'outline-primary' : 'primary'}
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                {submission.graded ? 'View/Edit Grade' : 'Grade'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <Modal
          show={!!selectedSubmission}
          onHide={() => {
            setSelectedSubmission(null);
            setGrade('');
            setFeedback('');
          }}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Grade Assignment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(() => {
              const assignment = assignments.find((a) => a.id === selectedSubmission.assignmentId);
              return (
                <>
                  <div className="mb-3">
                    <h6>{assignment?.title}</h6>
                    <p className="text-muted small mb-2">
                      Student: <strong>{getStudentName(selectedSubmission.userId)}</strong>
                    </p>
                    <p className="text-muted small mb-2">
                      Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-muted small">
                      Max Score: <strong>{assignment?.maxScore}</strong>
                    </p>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <h6>Student Submission:</h6>
                    <Card className="border">
                      <Card.Body>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'inherit' }}>
                          {selectedSubmission.content}
                        </pre>
                      </Card.Body>
                    </Card>
                  </div>

                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Grade (out of {assignment?.maxScore})
                        {selectedSubmission.graded && (
                          <Badge bg="info" className="ms-2">
                            Current: {selectedSubmission.grade}/{assignment?.maxScore}
                          </Badge>
                        )}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        max={assignment?.maxScore}
                        value={grade || selectedSubmission.grade || ''}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder={`Enter grade (0-${assignment?.maxScore})`}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Feedback (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={feedback || selectedSubmission.feedback || ''}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide feedback to the student..."
                      />
                    </Form.Group>
                  </Form>
                </>
              );
            })()}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedSubmission(null);
                setGrade('');
                setFeedback('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGrade} disabled={!grade || grade < 0}>
              {selectedSubmission.graded ? 'Update Grade' : 'Submit Grade'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default AssignmentGrading;

