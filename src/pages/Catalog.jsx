import { useMemo, useState } from 'react';
import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Pagination,
  Row
} from 'react-bootstrap';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import CourseCard from '../components/CourseCard.jsx';

const Catalog = () => {
  const { courses, enrollments } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      // Only show approved courses in catalog
      const isApproved = c.status === 'approved' || c.status === 'live' || !c.status;
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || c.category === category;
      const matchLevel = level === 'All' || c.level === level;
      return isApproved && matchSearch && matchCat && matchLevel;
    });
  }, [courses, search, category, level]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const { enroll } = useData();
  const onEnroll = (courseId) => {
    if (!user) {
      alert('Please login first to enroll in this course.');
      return;
    }
    if (user.role !== 'Student') {
      alert('Only students can enroll in courses.');
      return;
    }
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    if (course.price && course.price > 0) {
      const confirmed = window.confirm(
        `This is a paid course (${course.price} ETB). Confirm mock payment to enroll?`
      );
      if (!confirmed) return;
      const result = enroll(user.id, courseId, 'paid');
      if (result.success) {
        alert('Payment successful and enrollment confirmed!');
      } else {
        alert(result.message || 'Enrollment failed.');
      }
    } else {
      const result = enroll(user.id, courseId, 'free');
      if (result.success) {
        alert('Successfully enrolled in this free course!');
      } else {
        alert(result.message || 'Enrollment failed.');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-end g-3 mb-3">
        <Col md={4}>
          <Form.Label>Search</Form.Label>
          <Form.Control
            placeholder="Search courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <DropdownButton title={`Category: ${category}`} onSelect={(k) => setCategory(k || 'All')}>
            <Dropdown.Item eventKey="All">All</Dropdown.Item>
            {[...new Set(courses.filter((c) => c.status === 'approved' || c.status === 'live' || !c.status).map((c) => c.category))].map((cat) => (
              <Dropdown.Item key={cat} eventKey={cat}>
                {cat}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
        <Col md={4}>
          <DropdownButton title={`Level: ${level}`} onSelect={(k) => setLevel(k || 'All')}>
            <Dropdown.Item eventKey="All">All</Dropdown.Item>
            <Dropdown.Item eventKey="Beginner">Beginner</Dropdown.Item>
            <Dropdown.Item eventKey="Intermediate">Intermediate</Dropdown.Item>
            <Dropdown.Item eventKey="Advanced">Advanced</Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>

      <Row className="g-3">
        {items.map((course) => {
          const enrollment = enrollments.find(e => e.userId === user?.id && e.courseId === course.id);
          return (
            <Col md={4} key={course.id}>
              <CourseCard
                course={course}
                onEnroll={onEnroll}
                progress={enrollment?.progress}
                isEnrolled={!!enrollment}
              />
            </Col>
          );
        })}
      </Row>

      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
          {[...Array(pages)].map((_, idx) => (
            <Pagination.Item key={idx} active={idx + 1 === page} onClick={() => setPage(idx + 1)}>
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          />
        </Pagination>
      </div>
    </Container>
  );
};

export default Catalog;

