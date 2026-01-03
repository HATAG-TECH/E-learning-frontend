import { useMemo, useState } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  ProgressBar,
  Row
} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import LessonAccordion from '../components/LessonAccordion.jsx';

const CourseDetails = () => {
  const { id } = useParams();
  const { courses, enrollments, enroll, addOrUpdateReview, getReviewsForCourse } = useData();
  const { user } = useAuth();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!course) {
    return (
      <Container className="py-4">
        <Card body>Course not found.</Card>
      </Container>
    );
  }

  // Check if course is approved (or has no status for backward compatibility)
  const isApproved = course.status === 'approved' || course.status === 'live' || !course.status;

  if (!isApproved && user?.role !== 'Instructor' && user?.role !== 'Admin') {
    return (
      <Container className="py-4">
        <Card body>
          <h5>Course Not Available</h5>
          <p className="text-muted">This course is pending approval and not yet available for enrollment.</p>
        </Card>
      </Container>
    );
  }

  const progress = enrollments.find((e) => e.userId === user?.id && e.courseId === course.id)?.progress;
  const isEnrolled = !!progress || enrollments.some((e) => e.userId === user?.id && e.courseId === course.id);
  const reviews = getReviewsForCourse(course.id);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : null;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login as a student to leave a review.');
      return;
    }
    if (!isEnrolled) {
      alert('Only enrolled students can rate this course.');
      return;
    }
    // Mock payment processing state
    if (course.price && course.price > 0 && !isEnrolled) {
      // Enrolled check handles this, but just in case
    }
    addOrUpdateReview(user.id, course.id, Number(rating), comment.trim());
    alert('Your review has been saved.');
  };

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <Card.Title>{course.title}</Card.Title>
                  <Card.Subtitle className="text-muted">{course.instructor}</Card.Subtitle>
                </div>
                <Badge bg="info">{course.level}</Badge>
              </div>
              <Card.Text className="mt-3">{course.summary}</Card.Text>

              {/* Tags Display */}
              {course.tags && (
                <div className="mb-3">
                  {typeof course.tags === 'string'
                    ? course.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <Badge key={tag} bg="light" text="dark" className="me-1 border">{tag}</Badge>
                    ))
                    : Array.isArray(course.tags) ? course.tags.map(tag => (
                      <Badge key={tag} bg="light" text="dark" className="me-1 border">{tag}</Badge>
                    )) : null
                  }
                </div>
              )}

              <div className="d-flex gap-2 flex-wrap mb-3">
                <Badge bg="secondary">{course.category}</Badge>
                <Badge bg="success">
                  {averageRating ? `${averageRating.toFixed(1)}★` : `${course.rating}★`}
                </Badge>
                {reviews.length > 0 && (
                  <Badge bg="light" text="dark">
                    {reviews.length} review{reviews.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {progress !== undefined && (
                <div className="mb-3">
                  <small className="text-muted">Progress</small>
                  <ProgressBar now={progress} label={`${progress}%`} />
                </div>
              )}
              <Button
                onClick={() => {
                  if (!user) {
                    alert('Please login first to enroll in this course.');
                    return;
                  }
                  if (user.role !== 'Student') {
                    alert('Only students can enroll in courses.');
                    return;
                  }
                  if (!isApproved) {
                    alert('This course is pending approval and cannot be enrolled yet.');
                    return;
                  }
                  if (course.price && course.price > 0) {
                    // Mock payment flow
                    const confirmed = window.confirm(
                      `Processing payment of ${course.price} ETB...\n\nClick OK to confirm payment authorization.`
                    );
                    if (!confirmed) return;

                    // Simulate loading delay could go here

                    const result = enroll(user.id, course.id, 'paid');
                    if (result.success) {
                      alert('Payment successfully authorized! You are now enrolled.');
                    } else {
                      alert(result.message || 'Enrollment failed.');
                    }
                  } else {
                    const result = enroll(user.id, course.id, 'free');
                    if (result.success) {
                      alert('Successfully enrolled in this free course!');
                    } else {
                      alert(result.message || 'Enrollment failed.');
                    }
                  }
                }}
                disabled={progress !== undefined || !isApproved}
              >
                {progress !== undefined ? 'Enrolled' : !isApproved ? 'Pending Approval' : 'Enroll now'}
              </Button>
            </Card.Body>
          </Card>

          {course.curriculum && course.curriculum.length > 0 && (
            <Card className="mt-3 shadow-sm">
              <Card.Header>Curriculum</Card.Header>
              <Card.Body>
                <Accordion flush>
                  {course.curriculum.map((section, idx) => (
                    <Accordion.Item eventKey={String(idx)} key={section.heading || idx}>
                      <Accordion.Header>{section.heading}</Accordion.Header>
                      <Accordion.Body>{section.content}</Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          )}

          <Card className="mt-3 shadow-sm">
            <Card.Header>Lessons</Card.Header>
            <Card.Body>
              <LessonAccordion
                lessons={course.lessons}
                courseId={course.id}
                isEnrolled={isEnrolled}
              />
            </Card.Body>
          </Card>

          {/* Course Resources Section */}
          {isEnrolled && course.courseResources && course.courseResources.length > 0 && (
            <Card className="mt-3 shadow-sm">
              <Card.Header className="d-flex align-items-center">
                <i className="bi bi-folder-fill me-2"></i>
                Course Resources ({course.courseResources.length})
              </Card.Header>
              <ListGroup variant="flush">
                {course.courseResources.map((resource, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${resource.type === 'pdf' ? 'bi-file-pdf text-danger' :
                          resource.type === 'video' ? 'bi-camera-video text-primary' :
                            resource.type === 'link' ? 'bi-link-45deg text-info' :
                              'bi-file-earmark text-secondary'
                        } fs-5`}></i>
                      <div>
                        <div className="fw-semibold">{resource.name}</div>
                        {resource.description && (
                          <small className="text-muted">{resource.description}</small>
                        )}
                      </div>
                    </div>
                    {resource.url && (
                      <Button
                        as="a"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        variant="outline-primary"
                        className="rounded-pill"
                      >
                        <i className="bi bi-download me-1"></i>
                        Download
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>Instructor</Card.Header>
            <Card.Body>
              <Card.Title>{course.instructor}</Card.Title>
              <Card.Text>Expert mentor with hands-on portfolio projects.</Card.Text>
              <ListGroup>
                <ListGroup.Item>Office hours weekly</ListGroup.Item>
                <ListGroup.Item>Mentor feedback</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mt-3 shadow-sm">
            <Card.Header>Student Reviews</Card.Header>
            <ListGroup variant="flush">
              {reviews.length === 0 && (
                <ListGroup.Item className="text-muted small">
                  No reviews yet. Be the first to rate this course.
                </ListGroup.Item>
              )}
              {reviews.map((review) => (
                <ListGroup.Item key={review.id}>
                  <div className="d-flex justify-content-between">
                    <strong>{review.userId}</strong>
                    <Badge bg="warning" text="dark">
                      {review.rating}★
                    </Badge>
                  </div>
                  {review.comment && <div className="text-muted small mt-1">{review.comment}</div>}
                  <div className="small text-muted mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.updatedAt && ` (updated ${new Date(review.updatedAt).toLocaleDateString()})`}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {user && (
              <Card.Body>
                <h6 className="mb-2">Rate this course</h6>
                <Form onSubmit={handleSubmitReview}>
                  <Form.Group className="mb-2">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                      disabled={!isEnrolled}
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Star{r > 1 ? 's' : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Comment (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this course..."
                      disabled={!isEnrolled}
                    />
                  </Form.Group>
                  <Button type="submit" size="sm" disabled={!isEnrolled}>
                    {isEnrolled ? 'Submit Review' : 'Only enrolled students can review'}
                  </Button>
                </Form>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetails;

