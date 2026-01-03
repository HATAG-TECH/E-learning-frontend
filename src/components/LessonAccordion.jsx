import { Accordion, Badge, Button, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const LessonAccordion = ({ lessons, courseId, onLessonSelect, selectedLessonIndex, isEnrolled = true }) => {
  const { user } = useAuth();
  const { isLessonCompleted, completeLesson } = useData();

  const handleComplete = (lessonIndex) => {
    if (user && courseId) {
      completeLesson(user.id, courseId, lessonIndex);
    }
  };

  const handleSelect = (lessonIndex) => {
    if (onLessonSelect) {
      onLessonSelect(lessonIndex);
    }
  };

  return (
    <Accordion alwaysOpen>
      {lessons?.map((lesson, idx) => {
        const completed = user && courseId ? isLessonCompleted(user.id, courseId, idx) : false;
        const isSelected = selectedLessonIndex === idx;

        return (
          <Accordion.Item eventKey={String(idx)} key={lesson.title || idx}>
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2 w-100">
                {completed && <Badge bg="success" className="me-2">✓</Badge>}
                <span className={isSelected ? 'fw-bold' : ''}>{lesson.title || `Lesson ${idx + 1}`}</span>
                {!isEnrolled && <span className="ms-2">🔒</span>}
                <Badge bg="secondary" className="ms-auto">
                  {lesson.duration || 'N/A'}
                </Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              {lesson.description && <p className="text-muted small mb-2">{lesson.description}</p>}

              {!isEnrolled ? (
                <div className="text-muted small fst-italic">
                  Enroll in this course to access lessons and resources.
                </div>
              ) : (
                <ListGroup variant="flush">
                  <ListGroup.Item
                    action
                    active={isSelected}
                    onClick={() => handleSelect(idx)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>▶ Watch Lesson</span>
                    {isSelected && <Badge bg="primary">Playing</Badge>}
                  </ListGroup.Item>
                  {lesson.resources && lesson.resources.length > 0 && (
                    <ListGroup.Item>
                      <div className="small fw-semibold mb-1">Resources:</div>
                      {lesson.resources.map((resource, rIdx) => {
                        const resTitle = typeof resource === 'string' ? resource : resource.name;
                        return (
                          <Button
                            key={rIdx}
                            variant="outline-secondary"
                            size="sm"
                            className="me-2 mb-1"
                            onClick={() => {
                              if (resource.url) {
                                window.open(resource.url, '_blank');
                              } else {
                                alert(`The resource "${resTitle}" is being prepared for download.\n\n(Mock System: In a real app, this would open/download the file)`);
                              }
                            }}
                          >
                            📄 {resource.url ? 'View' : 'Open'} {resTitle}
                          </Button>
                        );
                      })}
                    </ListGroup.Item>
                  )}
                  {user && courseId && (
                    <ListGroup.Item>
                      <Button
                        variant={completed ? 'outline-success' : 'success'}
                        size="sm"
                        onClick={() => handleComplete(idx)}
                        disabled={completed}
                      >
                        {completed ? '✓ Completed' : 'Mark as Complete'}
                      </Button>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              )}
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
};

export default LessonAccordion;
