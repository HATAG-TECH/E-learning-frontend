import { Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ADMIN_NAV_ITEMS = [{ label: 'Dashboard', to: '/admin/dashboard' }];

const AdminDashboard = () => {
  const { courses, approvals, approveCourse, deleteCourse } = useData();
  const { user, users, deleteUser } = useAuth();

  return (
    <DashboardLayout
      title="Admin Navigation"
      navItems={ADMIN_NAV_ITEMS}
    >
      <Row className="g-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <h2>{users.length}</h2>
              <Badge bg="info">Active</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Courses</Card.Title>
              <h2>{courses.filter((c) => c.status === 'approved' || c.status === 'live' || !c.status).length}</h2>
              <Badge bg="success">Approved</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Pending approval</Card.Title>
              <h2>{approvals.length}</h2>
              <Badge bg="warning" text="dark">
                Queue
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-3 shadow-sm">
        <Card.Header>User management</Card.Header>
        <Table responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={u.id === user?.id}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove user "${u.email}"?`)) {
                        deleteUser(u.id);
                        alert('User removed successfully.');
                      }
                    }}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="mt-3 shadow-sm">
        <Card.Header>Course approval queue</Card.Header>
        <Container className="py-3">
          {approvals.length === 0 ? (
            <div className="text-muted text-center py-3">No pending courses for approval.</div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Instructor</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.title}</strong>
                      {c.summary && <div className="text-muted small">{c.summary.substring(0, 50)}...</div>}
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <Badge bg="secondary">{c.level}</Badge>
                    </td>
                    <td>{c.instructor || 'Unknown'}</td>
                    <td>${c.price || 0}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            if (window.confirm(`Approve "${c.title}"? It will be visible in the catalog.`)) {
                              approveCourse(c.id, true);
                              alert('Course approved! It is now visible in the catalog.');
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            if (window.confirm(`Reject "${c.title}"? It will be removed from the system.`)) {
                              approveCourse(c.id, false);
                              alert('Course rejected and removed.');
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </Card>

      <Card className="mt-3 shadow-sm">
        <Card.Header>Active Courses Management</Card.Header>
        <Container className="py-3">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Category</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.filter(c => c.status === 'approved' || c.status === 'live' || !c.status).map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.instructor || 'Unknown'}</td>
                  <td><Badge bg="success">Active</Badge></td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${c.title}"? This cannot be undone.`)) {
                          deleteCourse(c.id);
                          alert('Course deleted successfully.');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
