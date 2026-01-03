import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const Contact = () => (
  <Container className="py-4">
    <Row className="g-3">
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Contact Us</Card.Title>
            <Card.Text>We respond within one business day.</Card.Text>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control placeholder="Your name" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="you@example.com" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={3} />
              </Form.Group>
              <Button type="submit">Send</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Offices</Card.Title>
            <Card.Text>Remote-first with hubs in Debre Berhan and Addis Ababa.</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default Contact;

