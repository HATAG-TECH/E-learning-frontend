import { Card, Col, Container, Row } from 'react-bootstrap';

const About = () => (
  <Container className="py-4">
    <Row className="g-3">
      <Col md={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>About E-Learn Pro</Card.Title>
            <Card.Text>
              A modern SaaS-style e-learning platform built with React, Bootstrap, and localStorage
              for persistence. We focus on clean UX, accessibility, and fast performance with Vite.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>What you get</Card.Title>
            <Card.Text>
              Role-based dashboards, protected routes, responsive grids, and delightful micro
              interactions powered by Bootstrap utilities.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default About;

