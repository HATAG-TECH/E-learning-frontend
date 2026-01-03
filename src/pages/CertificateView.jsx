import { useRef } from 'react';
import { Badge, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const CertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { certificates } = useData();
    const { theme } = useTheme();

    const certificate = certificates.find((c) => c.id === id);
    const printRef = useRef();

    if (!certificate) {
        return (
            <Container className="py-5 text-center">
                <h3>Certificate Not Found</h3>
                <p>The requested certificate does not exist or you do not have permission to view it.</p>
                <Button variant="primary" onClick={() => navigate('/')}>Return Home</Button>
            </Container>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <Button variant="success" onClick={handlePrint}>
                    🖨 Print / Download PDF
                </Button>
            </div>

            <div className="certificate-container" ref={printRef}>
                <Card className={`text-center p-5 border-success ${theme === 'dark' ? 'bg-dark text-white' : 'bg-white'}`} style={{ border: '5px double #198754' }}>
                    <Card.Body className="py-5">
                        <div className="mb-4">
                            <Badge bg="success" className="p-2 fs-6 mb-2">VERIFIED CERTIFICATE</Badge>
                            <h1 className="display-4 fw-bold text-success mb-0" style={{ fontFamily: 'serif' }}>Certificate of Completion</h1>
                        </div>

                        <p className="fs-5 text-muted mb-1">This is to certify that</p>
                        <h2 className="display-6 fw-bold mb-3 border-bottom d-inline-block px-5 py-2">{certificate.studentName || certificate.studentEmail}</h2>

                        <p className="fs-5 text-muted mb-1">has successfully completed the course</p>
                        <h3 className="fw-bold mb-4">{certificate.courseTitle}</h3>

                        <Row className="justify-content-center mt-5">
                            <Col md={4}>
                                <div className="border-top border-dark pt-2">
                                    <p className="fw-bold mb-0">{certificate.instructor}</p>
                                    <small className="text-muted">Instructor</small>
                                </div>
                            </Col>
                            <Col md={4}>
                                {/* Seal or Logo could go here */}
                                <div className="mb-3" style={{ opacity: 0.5 }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid goldenrod', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '40px', color: 'var(--bs-warning)' }}>★</span>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="border-top border-dark pt-2">
                                    <p className="fw-bold mb-0">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                                    <small className="text-muted">Date Issued</small>
                                </div>
                            </Col>
                        </Row>

                        <div className="mt-5 text-muted small">
                            <p>Certificate ID: {certificate.id}</p>
                            <p>E-Learn Pro Certification Authority</p>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <style>
                {`
          @media print {
            .no-print { display: none !important; }
            .navbar { display: none !important; }
            footer { display: none !important; }
            .certificate-container { margin: 0; padding: 0; }
            .card { border: 5px double #198754 !important; box-shadow: none !important; }
          }
        `}
            </style>
        </Container>
    );
};

export default CertificateView;
