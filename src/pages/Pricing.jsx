import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import ScrollReveal from '../components/ScrollReveal.jsx';

const Pricing = () => {
  const tiers = [
    { name: 'Free', price: 'ETB 0', features: ['Access to free courses', 'Community limited', 'No certificates'] },
    { name: 'Pro', price: 'ETB 29', features: ['All courses included', 'Completion certificates', 'Offline downloads'], active: true },
    { name: 'Team', price: 'ETB 99', features: ['5 Team members', 'Admin dashboard', 'Progress analytics'] }
  ];

  return (
    <section className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold">Our Pricing</h2>
          <p className="text-lumina-muted">Start for free, upgrade for mastery.</p>
        </div>

        <Row className="g-4 justify-content-center">
          {tiers.map((tier, i) => (
            <Col md={4} key={i}>
              <ScrollReveal delay={i * 100} animation="fade-up">
                <Card className={`h-100 ${tier.active ? 'border-primary' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                  {tier.active && <div className="position-absolute top-0 start-0 w-100 h-1 d-block bg-primary" style={{ height: 4 }}></div>}
                  <Card.Body className="p-4 d-flex flex-column">
                    <h5 className="fw-bold mb-1">{tier.name}</h5>
                    <div className="small text-lumina-muted mb-4">{tier.name === 'Team' ? 'For organizations' : 'For individuals'}</div>

                    <div className="display-4 fw-bold mb-4">{tier.price}<span className="fs-6 fw-normal text-muted">/mo</span></div>

                    <ul className="list-unstyled mb-4 flex-grow-1">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="mb-2 small d-flex gap-2">
                          <i className="bi bi-check-lg text-primary"></i>
                          <span className="text-lumina-muted">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button variant={tier.active ? 'primary' : 'outline-primary'} className="w-100 rounded-pill">
                      {tier.active ? 'Get Started' : 'Current Plan'}
                    </Button>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Pricing;
