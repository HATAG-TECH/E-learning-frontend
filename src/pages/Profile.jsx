import { useState, useRef } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Tabs,
    Tab,
    Image,
    Alert,
    Modal
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser, changePassword, deleteUser, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('personal');
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        profilePic: user?.profilePic || 'https://placehold.co/150'
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [feedback, setFeedback] = useState({ show: false, message: '', variant: 'success' });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        updateUser(user.id, profileForm);
        setFeedback({ show: true, message: 'Profile updated successfully!', variant: 'success' });
        setTimeout(() => setFeedback({ ...feedback, show: false }), 3000);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const currentActualPassword = user.password;
        if (passwordForm.currentPassword !== currentActualPassword) {
            setFeedback({
                show: true,
                message: 'Current password is incorrect. (Hint: The default mock password is "password")',
                variant: 'danger'
            });
            return;
        }

        const { newPassword, confirmPassword } = passwordForm;
        let pError = '';
        if (newPassword.length < 8) {
            pError = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(newPassword)) {
            pError = 'Password must include an uppercase letter.';
        } else if (!/[a-z]/.test(newPassword)) {
            pError = 'Password must include a lowercase letter.';
        } else if (!/[0-9]/.test(newPassword)) {
            pError = 'Password must include a number.';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            pError = 'Password must include a special character.';
        }

        if (pError) {
            setFeedback({ show: true, message: pError, variant: 'danger' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ show: true, message: 'New passwords do not match.', variant: 'danger' });
            return;
        }

        changePassword(user.id, newPassword);
        setFeedback({ show: true, message: 'Password updated successfully!', variant: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setFeedback({ ...feedback, show: false }), 4000);
    };

    const handleDeleteAccount = () => {
        deleteUser(user.id);
        navigate('/');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm({ ...profileForm, profilePic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return <Container className="py-5 text-center"><h5>Please log in to view your profile.</h5></Container>;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <div className="d-flex align-items-center gap-4 mb-4 text-theme">
                        <div className="position-relative">
                            <Image
                                src={profileForm.profilePic || 'https://placehold.co/150'}
                                roundedCircle
                                onError={(e) => { e.target.src = 'https://placehold.co/150'; }}
                                style={{ width: 120, height: 120, objectFit: 'cover', border: '3px solid var(--bs-primary)' }}
                            />
                            <Button
                                size="sm"
                                variant="primary"
                                className="position-absolute bottom-0 end-0 rounded-circle"
                                style={{ width: 32, height: 32, padding: 0 }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <i className="bi bi-camera"></i>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div>
                            <h2 className="mb-0">{user.username || 'User'}</h2>
                            <p className="text-muted mb-0">{user.email} • {user.role}</p>
                        </div>
                        <div className="ms-auto">
                            <Button variant="outline-danger" onClick={logout}>
                                <i className="bi bi-box-arrow-right me-2"></i>Logout
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="px-4 pt-3 border-bottom-0 custom-tabs"
                            >
                                <Tab eventKey="personal" title={<><i className="bi bi-person me-2"></i>Personal Details</>}>
                                    <div className="p-4">
                                        <Form onSubmit={handleProfileSubmit}>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Username</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.username}
                                                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email Address</Form.Label>
                                                        <Form.Control type="email" value={user.email} disabled />
                                                        <Form.Text className="text-muted">Contact admin to change email.</Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bio</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    placeholder="Tell us about yourself..."
                                                    value={profileForm.bio}
                                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                />
                                            </Form.Group>
                                            <Button type="submit" variant="primary">Save Changes</Button>
                                            {feedback.show && activeTab === 'personal' && (
                                                <Alert variant={feedback.variant} className="mt-3 d-flex align-items-center" dismissible onClose={() => setFeedback({ ...feedback, show: false })}>
                                                    <i className={`bi ${feedback.variant === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                                    {feedback.message}
                                                </Alert>
                                            )}
                                        </Form>
                                    </div>
                                </Tab>

                                <Tab eventKey="security" title={<><i className="bi bi-shield-lock me-2"></i>Security</>}>
                                    <div className="p-4">
                                        <Form onSubmit={handlePasswordSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Current Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    required
                                                    placeholder="Enter your current password"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirm New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                            <Button type="submit" variant="primary">Update Password</Button>
                                            {feedback.show && activeTab === 'security' && (
                                                <Alert variant={feedback.variant} className="mt-3 d-flex align-items-center" dismissible onClose={() => setFeedback({ ...feedback, show: false })}>
                                                    <i className={`bi ${feedback.variant === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                                    {feedback.message}
                                                </Alert>
                                            )}
                                        </Form>
                                    </div>
                                </Tab>

                                {user.email !== 'admin@gmail.com' && (
                                    <Tab eventKey="danger" title={<><i className="bi bi-exclamation-triangle me-2"></i>Account Management</>}>
                                        <div className="p-4">
                                            <div className="alert alert-danger d-flex align-items-center mb-4">
                                                <i className="bi bi-info-circle-fill me-2"></i>
                                                Once you delete your account, there is no going back. Please be certain.
                                            </div>
                                            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                                Delete My Account
                                            </Button>
                                        </div>
                                    </Tab>
                                )}
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">Permanently Delete Account?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete your account? All your course progress, enrollments, and personal data will be permanently removed.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>Yes, Delete Everything</Button>
                </Modal.Footer>
            </Modal>

            <style>{`
        .custom-tabs .nav-link {
          color: var(--bs-gray-600);
          border: none;
          padding: 1rem 1.5rem;
          font-weight: 500;
        }
        .custom-tabs .nav-link.active {
          color: var(--bs-primary);
          background: transparent;
          border-bottom: 3px solid var(--bs-primary);
        }
      `}</style>
        </Container>
    );
};

export default Profile;
