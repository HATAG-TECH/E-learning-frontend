import { memo } from 'react';
import { Badge, Button, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onEnroll, progress, className = '' }) => {
  const tags = Array.isArray(course.tags)
    ? course.tags
    : typeof course.tags === 'string'
      ? course.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  return (
    <Card className={`h-100 shadow-sm card-hover transition-theme ${className}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title>{course.title}</Card.Title>
            <Card.Subtitle className="text-muted">By {course.instructor}</Card.Subtitle>
          </div>
          <Badge bg="info">{course.level}</Badge>
        </div>
        <Card.Text className="mt-2 text-truncate">{course.summary}</Card.Text>
        <div className="d-flex gap-2 flex-wrap mb-2">
          <Badge bg="secondary">{course.category}</Badge>
          {course.rating && <Badge bg="success">{course.rating}★</Badge>}
        </div>
        {progress !== undefined && (
          <div className="mb-3">
            <small className="text-muted">Progress</small>
            <ProgressBar now={progress} label={`${progress}%`} />
          </div>
        )}
        {tags.length > 0 && (
          <ListGroup className="mb-3">
            {tags.map((tag) => (
              <ListGroup.Item key={tag}>{tag}</ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <div className="d-flex justify-content-between align-items-center">
          {course.price !== undefined && <div className="fw-bold">{course.price} ETB</div>}
          <div className="d-flex gap-2">
            <Button as={Link} to={`/course/${course.id}`} variant="outline-primary">
              Details
            </Button>
            {onEnroll && (
              <Button
                variant={progress !== undefined ? "success" : "primary"}
                onClick={() => onEnroll(course.id)}
                disabled={progress !== undefined}
                className="transition-all"
              >
                {progress !== undefined ? 'Enrolled' : 'Enroll'}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
export default memo(CourseCard);

