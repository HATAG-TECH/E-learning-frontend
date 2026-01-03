import { Badge, Button, ListGroup } from 'react-bootstrap';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ResourceList = ({ courseId }) => {
  const { courses, enrollments } = useData();
  const { user } = useAuth();

  // Get the active course
  const active = enrollments.find((e) => e.userId === user?.id);
  const course = courseId
    ? courses.find((c) => c.id === courseId)
    : courses.find((c) => c.id === active?.courseId);

  // Default resources (fallback)
  const defaultResources = [
    {
      title: 'React Docs',
      url: 'https://react.dev/learn',
      type: 'Guide',
      size: 'Web'
    },
    {
      title: 'React Router v6',
      url: 'https://reactrouter.com/en/main',
      type: 'Routing',
      size: 'Web'
    },
    {
      title: 'Bootstrap Components',
      url: 'https://getbootstrap.com/docs/5.3/components/alerts/',
      type: 'UI',
      size: 'Web'
    }
  ];

  // Course-level resources
  const courseResources = course?.courseResources || [];

  // Lesson resources
  const lessonResources = course?.lessons?.flatMap((lesson, idx) =>
    lesson.resources?.map((resource) => ({
      title: typeof resource === 'string' ? resource : resource.name,
      lessonTitle: lesson.title,
      type: typeof resource === 'string' ? 'Lesson Resource' : resource.type || 'File',
      size: typeof resource === 'string' ? 'File' : resource.size || 'Unknown',
      url: typeof resource === 'string' ? null : resource.url,
      isLessonResource: true
    })) || []
  ) || [];

  const allResources = [
    ...courseResources.map((r) => ({
      title: typeof r === 'string' ? r : r.name,
      type: typeof r === 'string' ? 'Course Resource' : r.type || 'File',
      size: typeof r === 'string' ? 'File' : r.size || 'Unknown',
      url: typeof r === 'string' ? null : r.url,
      isCourseResource: true
    })),
    ...lessonResources,
    ...(courseResources.length === 0 && lessonResources.length === 0 ? defaultResources : [])
  ];

  return (
    <ListGroup variant="flush">
      {allResources.length === 0 ? (
        <ListGroup.Item className="text-muted text-center">No resources available.</ListGroup.Item>
      ) : (
        allResources.map((res, idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-between align-items-center card-hover transition-theme py-3"
          >
            <div className="flex-grow-1 me-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <strong className="fs-5">{res.title}</strong>
                <Badge
                  bg={res.isCourseResource ? 'primary' : res.isLessonResource ? 'secondary' : 'info'}
                  className="text-uppercase"
                  style={{ fontSize: '0.6rem' }}
                >
                  {res.isCourseResource ? 'Course File' : res.isLessonResource ? 'Lesson File' : res.type}
                </Badge>
              </div>
              <div className="text-muted small mb-1">
                {res.type} · {res.size}
              </div>
              {res.lessonTitle && (
                <div className="text-muted small">
                  Lesson: <span className="text-secondary">{res.lessonTitle}</span>
                </div>
              )}
            </div>
            <div className="d-flex align-items-center">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  if (res.url) {
                    window.open(res.url, '_blank');
                  } else {
                    alert(`The resource "${res.title}" is being prepared for download.\n\n(Mock System: In a real app, this would open/download the file)`);
                  }
                }}
                className="px-3"
              >
                {res.url ? (res.url.startsWith('blob:') ? 'View File' : 'Open') : 'Open'}
              </Button>
            </div>
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );
};

export default ResourceList;
