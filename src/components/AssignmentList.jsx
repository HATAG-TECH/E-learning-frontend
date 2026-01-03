import { useState } from 'react';
import { Alert, Badge, Button, Card, Form, ListGroup, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const AssignmentList = ({ courseId }) => {
  const { user } = useAuth();
  const { getAssignments, submitAssignment, getAssignmentSubmissions } = useData();
  const assignments = getAssignments(courseId);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  const handleSubmit = (assignmentId) => {
    if (!submissionText.trim()) return;
    submitAssignment(user.id, assignmentId, {
      content: submissionText,
      status: 'submitted'
    });
    setShowSubmitModal(null);
    setSubmissionText('');
    alert('Assignment submitted successfully!');
  };

  const getMySubmission = (assignmentId) => {
    const submissions = getAssignmentSubmissions(assignmentId);
    return submissions.find((s) => s.userId === user?.id);
  };

  return (
    <div>
      {assignments.length === 0 ? (
        <Alert variant="info">No assignments available for this course.</Alert>
      ) : (
        <ListGroup>
          {assignments.map((assignment) => {
            const mySubmission = getMySubmission(assignment.id);
            const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

            return (
              <ListGroup.Item key={assignment.id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{assignment.title}</div>
                    {assignment.description && (
                      <div className="small text-muted mt-1">{assignment.description}</div>
                    )}
                    <div className="mt-2">
                      {assignment.dueDate && (
                        <Badge bg={isOverdue ? 'danger' : 'warning'} className="me-2">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                      <Badge bg="info">Max Score: {assignment.maxScore}</Badge>
                      {mySubmission && (
                        <>
                          <Badge bg="success" className="ms-2">
                            ✓ Submitted
                          </Badge>
                          {mySubmission.graded ? (
                            <Badge bg="primary" className="ms-2" style={{ fontSize: '0.9em', padding: '0.5em 0.75em' }}>
                              <strong>Grade: {mySubmission.grade}/{assignment.maxScore}</strong>
                              {mySubmission.feedback && (
                                <span className="ms-1">• Feedback Available</span>
                              )}
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="ms-2">
                              Awaiting Grade
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    {mySubmission?.graded && (
                      <Badge bg="primary" style={{ fontSize: '0.9em' }}>
                        {mySubmission.grade}/{assignment.maxScore}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={mySubmission ? 'outline-secondary' : 'primary'}
                      onClick={() => setShowSubmitModal(assignment)}
                    >
                      {mySubmission ? (mySubmission.graded ? 'View Grade' : 'View Submission') : 'Submit'}
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}

      {showSubmitModal && (
        <Modal show={!!showSubmitModal} onHide={() => setShowSubmitModal(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {getMySubmission(showSubmitModal.id)
                ? getMySubmission(showSubmitModal.id).graded
                  ? 'Assignment Grade & Feedback'
                  : 'View Submission'
                : 'Submit Assignment'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <h6>{showSubmitModal.title}</h6>
              <p className="text-muted">{showSubmitModal.description}</p>
              <div>
                <Badge bg="info">Max Score: {showSubmitModal.maxScore}</Badge>
                {showSubmitModal.dueDate && (
                  <Badge bg="warning" className="ms-2">
                    Due: {new Date(showSubmitModal.dueDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            {getMySubmission(showSubmitModal.id) ? (
              <div>
                <Alert variant="success">
                  <div className="fw-semibold mb-2">Your Submission:</div>
                  <div className="p-3 bg-body bg-opacity-50 rounded border">{getMySubmission(showSubmitModal.id).content}</div>
                  <div className="small text-muted mt-2">
                    Submitted: {new Date(getMySubmission(showSubmitModal.id).submittedAt).toLocaleString()}
                  </div>
                </Alert>
                {getMySubmission(showSubmitModal.id).graded ? (
                  <Alert variant="primary" className="mt-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="mb-0">Assignment Graded</h6>
                        <div className="fw-bold text-primary" style={{ fontSize: '1.5em' }}>
                          {getMySubmission(showSubmitModal.id).grade}/{showSubmitModal.maxScore}
                        </div>
                        <div className="small text-muted mt-1">
                          Percentage: {Math.round((getMySubmission(showSubmitModal.id).grade / showSubmitModal.maxScore) * 100)}%
                        </div>
                      </div>
                      <Badge bg="success" style={{ fontSize: '1em', padding: '0.5em 1em' }}>
                        ✓ Graded
                      </Badge>
                    </div>
                    {getMySubmission(showSubmitModal.id).feedback && (
                      <div className="mt-3 pt-3 border-top">
                        <strong>Instructor Feedback:</strong>
                        <div className="mt-2 p-2 bg-body bg-opacity-25 rounded">{getMySubmission(showSubmitModal.id).feedback}</div>
                      </div>
                    )}
                    <div className="small text-muted mt-2">
                      Graded on: {new Date(getMySubmission(showSubmitModal.id).gradedAt).toLocaleString()}
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="warning" className="mt-3">
                    <div className="d-flex align-items-center">
                      <span className="me-2">⏳</span>
                      <div>
                        <strong>Awaiting Grade</strong>
                        <div className="small">Your submission is being reviewed by the instructor.</div>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
            ) : (
              <Form>
                <Form.Group>
                  <Form.Label>Your Submission</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Write your assignment submission here..."
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSubmitModal(null)}>
              Close
            </Button>
            {!getMySubmission(showSubmitModal.id) && (
              <Button variant="primary" onClick={() => handleSubmit(showSubmitModal.id)}>
                Submit Assignment
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default AssignmentList;

