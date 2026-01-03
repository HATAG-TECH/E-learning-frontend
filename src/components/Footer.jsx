import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Footer = () => {
    const { user } = useAuth();

    const getDashboardPath = () => {
        if (!user) return '/';
        if (user.role === 'Instructor') return '/instructor/dashboard';
        if (user.role === 'Admin') return '/admin/dashboard';
        return '/student/dashboard';
    };

    return (
        <footer className="mt-auto pt-5 pb-4 transition-theme" style={{ backgroundColor: 'var(--lumina-bg)', borderTop: '1px solid var(--lumina-border)' }}>
            <Container>
                <Row className="g-4 justify-content-between mb-5">
                    <Col lg={4} md={12}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div className="bg-primary rounded p-1" style={{ width: 24, height: 24 }}></div>
                            <h5 className="fw-bold m-0" style={{ color: 'var(--lumina-text)' }}>E-learn pro</h5>
                        </div>
                        <p className="text-lumina-muted small mb-4" style={{ maxWidth: 300 }}>
                            Empowering learners worldwide with accessible, high-quality expert content. Unlock your potential today.
                        </p>
                        <div className="text-lumina-muted small">
                            © {new Date().getFullYear()} E-learn pro. All rights reserved.
                        </div>
                    </Col>

                    <Col lg={2} md={4} sm={4}>
                        <h6 className="fw-bold mb-3" style={{ color: 'var(--lumina-text)' }}>Platform</h6>
                        <Nav className="flex-column gap-2">
                            {user && (
                                <Nav.Link as={Link} to={getDashboardPath()} className="p-0 text-primary small fw-semibold">My Dashboard</Nav.Link>
                            )}
                            <Nav.Link as={Link} to="/catalog" className="p-0 text-lumina-muted small">Browse Courses</Nav.Link>
                            <Nav.Link as={Link} to="/pricing" className="p-0 text-lumina-muted small">Pricing</Nav.Link>
                            <Nav.Link as={Link} to="/contact" className="p-0 text-lumina-muted small">For Teams</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Instructors</Nav.Link>
                        </Nav>
                    </Col>

                    <Col lg={2} md={4} sm={4}>
                        <h6 className="fw-bold mb-3" style={{ color: 'var(--lumina-text)' }}>Company</h6>
                        <Nav className="flex-column gap-2">
                            <Nav.Link as={Link} to="/about" className="p-0 text-lumina-muted small">About Us</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Careers</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Blog</Nav.Link>
                            <Nav.Link as={Link} to="/contact" className="p-0 text-lumina-muted small">Contact</Nav.Link>
                        </Nav>
                    </Col>

                    <Col lg={2} md={4} sm={4}>
                        <h6 className="fw-bold mb-3" style={{ color: 'var(--lumina-text)' }}>Legal</h6>
                        <Nav className="flex-column gap-2">
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Terms of Use</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Privacy Policy</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Cookie Policy</Nav.Link>
                            <Nav.Link href="#!" className="p-0 text-lumina-muted small">Accesibility</Nav.Link>
                        </Nav>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
