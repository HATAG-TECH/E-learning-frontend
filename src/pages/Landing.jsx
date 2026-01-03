import { Link } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useData } from '../contexts/DataContext.jsx';
import CourseCard from '../components/CourseCard.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Landing = () => {
  const { courses } = useData();
  const { theme } = useTheme();
  const featured = courses.slice(0, 3); // Mock featured courses

  const features = [
    { icon: 'bi-laptop', title: 'Flexible Learning', desc: 'Learn at your own pace, anytime, anywhere on any device.' },
    { icon: 'bi-person-badge', title: 'Expert Instructors', desc: 'Learn from industry experts and subject matter masters.' },
    { icon: 'bi-graph-up-arrow', title: 'Career Growth', desc: 'Practical skills directly applicable to career advancement.' },
    { icon: 'bi-people', title: 'Community Support', desc: 'Join a global community of learners and mentors.' }
  ];

  const testimonials = [
    { name: 'Michael Chen', role: 'Frontend Dev', text: 'The courses here transformed my career path. Highly recommended!', avatar: 'https://i.pravatar.cc/50?u=1' },
    { name: 'Sarah Jones', role: 'UX Designer', text: 'Excellent content quality and very engaging instructors.', avatar: 'https://i.pravatar.cc/50?u=2' },
    { name: 'David Smith', role: 'Data Analyst', text: 'The best platform for mastering data science concepts.', avatar: 'https://i.pravatar.cc/50?u=3' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-5 position-relative overflow-hidden">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="section-header-badge mb-3">
                <i className="bi bi-stars me-2"></i> Unlock infinite knowledge
              </div>
              <h1 className="display-4 fw-bold mb-4 lh-tight">
                Unlock your potential with <span className="text-gradient">expert-led learning</span>
              </h1>
              <p className="lead text-lumina-muted mb-4">
                Master new skills in design, coding, and more. Join a community of lifelong learners achieving their goals today.
              </p>

              <div className="mb-4 text-lumina-muted small">
                <div className="d-flex gap-3 flex-wrap">
                  <span><i className="bi bi-check-circle-fill text-info me-2"></i>Access to all courses</span>
                  <span><i className="bi bi-check-circle-fill text-info me-2"></i>Industry-recognized certificates</span>
                </div>
              </div>

              <div className="d-flex gap-3">
                <Button size="lg" variant="primary" as={Link} to="/catalog">Get Started</Button>
                <Button size="lg" variant="outline-primary" as={Link} to="/catalog">Browse Courses</Button>
              </div>
            </Col>
            <Col lg={6} className="position-relative">
              {/* Abstract decorative elements could go here */}
              <div className="position-relative z-1 rounded-4 overflow-hidden border border-secondary shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students learning"
                  className="img-fluid w-100"
                  style={{ opacity: 0.9 }}
                />
                <div className="position-absolute bottom-0 start-0 m-4 p-3 glass-panel rounded-3 text-white" style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1px solid var(--lumina-border)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                      <i className="bi bi-play-fill text-white fs-5"></i>
                    </div>
                    <div>
                      <div className="small fw-bold">1000+ Video Lessons</div>
                      <div className="extra-small text-white-50" style={{ fontSize: '0.75rem' }}>High quality content</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-4">
        <Container>
          <Row className="g-4">
            {[
              { num: '12k+', label: 'Active Learners', icon: 'bi-people' },
              { num: '450+', label: 'Instructors', icon: 'bi-journal-richtext' },
              { num: '150+', label: 'Secret Courses', icon: 'bi-lock' },
              { num: '4.9', label: 'Average Rating', icon: 'bi-star-fill' }
            ].map((stat, idx) => (
              <Col md={3} sm={6} key={idx}>
                <ScrollReveal delay={idx * 100} animation="fade-up">
                  <div className="stats-box h-100">
                    <div className="fs-1 fw-bold mb-1">{stat.num}</div>
                    <div className="text-lumina-muted small text-uppercase fw-semibold mb-2">{stat.label}</div>
                    <i className={`bi ${stat.icon} fs-4 text-primary opacity-50`}></i>
                  </div>
                </ScrollReveal>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Courses */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h2 className="fw-bold mb-2">Explore Popular Courses</h2>
              <p className="text-lumina-muted m-0">Hand-picked sources to advance your career.</p>
            </div>
            <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} size="sm" as={Link} to="/catalog">View All Courses</Button>
          </div>
          <Row className="g-4">
            {featured.map(course => (
              <Col md={4} key={course.id}>
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Why Choose Lumina */}
      <section className="py-5 bg-opacity-10 bg-black">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Why Choose E-learn pro?</h2>
            <p className="text-lumina-muted text-center mx-auto" style={{ maxWidth: 600 }}>
              We provide cutting-edge learning ecosystem designed to help you succeed in the real world.
            </p>
          </div>
          <Row className="g-4">
            {features.map((f, idx) => (
              <Col md={3} sm={6} key={idx}>
                <ScrollReveal delay={idx * 100}>
                  <div className="text-center p-3">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--lumina-surface)', color: 'var(--bs-primary)', fontSize: '1.75rem' }}>
                      <i className={`bi ${f.icon}`}></i>
                    </div>
                    <h5 className="fw-semibold mb-2">{f.title}</h5>
                    <p className="text-lumina-muted small">{f.desc}</p>
                  </div>
                </ScrollReveal>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <Container>
          <h2 className="fw-bold mb-5 text-center">What Our Students Say</h2>
          <Row className="g-4">
            {testimonials.map((t, idx) => (
              <Col md={4} key={idx}>
                <ScrollReveal delay={idx * 150} animation="scale-up">
                  <Card className="h-100 border-0 bg-transparent">
                    <Card.Body className="bg-surface rounded-4 p-4 position-relative" style={{ background: 'var(--lumina-surface)', border: '1px solid var(--lumina-border)' }}>
                      <p className="text-lumina-muted mb-4">"{t.text}"</p>
                      <div className="d-flex align-items-center gap-3">
                        <img src={t.avatar} alt={t.name} className="rounded-circle" width="40" height="40" />
                        <div>
                          <div className="fw-bold small">{t.name}</div>
                          <div className="text-lumina-muted extra-small" style={{ fontSize: '0.75rem' }}>{t.role}</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </ScrollReveal>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing Preview */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Our Pricing</h2>
            <p className="text-lumina-muted">Start for free, upgrade for mastery.</p>
          </div>

          <Row className="g-4 justify-content-center">
            {[
              { name: 'Free', price: 'ETB 0', features: ['Access to free courses', 'Community limited', 'No certificates'] },
              { name: 'Pro', price: 'ETB 29', features: ['All courses included', 'Completion certificates', 'Offline downloads'], active: true },
              { name: 'Team', price: 'ETB 99', features: ['5 Team members', 'Admin dashboard', 'Progress analytics'] }
            ].map((tier, i) => (
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

      {/* Newsletter */}
      <section className="py-5 mb-5">
        <Container>
          <div className="newsletter-card">
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h3 className="fw-bold mb-2">Join the Newsletter</h3>
                <p className="text-lumina-muted m-0">Get the latest course updates and career insights straight to your inbox.</p>
              </Col>
              <Col lg={6}>
                <Form className="d-flex" onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for joining our newsletter!');
                }}>
                  <Form.Control type="email" placeholder="Enter your email address" className="newsletter-input" style={{ borderColor: 'transparent' }} />
                  <Button variant="primary" type="submit" className="px-4" style={{ borderRadius: '0 9999px 9999px 0' }}>Join</Button>
                </Form>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Landing;
