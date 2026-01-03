import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import {
  Badge,
  Button,
  Container,
  Modal,
  Nav,
  Navbar,
  Form,
  InputGroup,
  Row,
  Col,
  Toast,
  ToastContainer,
  Offcanvas,
  Stack,
  NavDropdown,
  Spinner
} from 'react-bootstrap';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { UIProvider, useUI } from './contexts/UIContext.jsx';
import { DataProvider, useData } from './contexts/DataContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Footer from './components/Footer.jsx';

// Lazy load page components for better performance
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Catalog = lazy(() => import('./pages/Catalog.jsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.jsx'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const CertificateView = lazy(() => import('./pages/CertificateView.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

const AppShell = () => (
  <ThemeProvider>
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  </ThemeProvider>
);

const Layout = () => {
  const { user, logout, login, register } = useAuth();
  const { getNotificationsForUser, markNotificationAsRead, clearNotifications, addNotification } = useData();
  const { theme, toggleTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar, closeSidebar, sidebarConfig, showNotifications, setShowNotifications } = useUI();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const notifications = useMemo(() => user ? getNotificationsForUser(user.id) : [], [user, getNotificationsForUser]);

  useEffect(() => {
    if (user && notifications.length === 0) {
      addNotification(
        user.id,
        'Welcome to E-Learn Pro!',
        'Start your journey by exploring the course catalog or setting up your profile.',
        'primary'
      );
    }
  }, [user, notifications.length, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const redirectToDashboard = (userRole) => {
    if (userRole === 'Instructor') {
      navigate('/instructor/dashboard');
    } else if (userRole === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'Instructor') return '/instructor/dashboard';
    if (user.role === 'Admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleLogin = (payload) => {
    const result = login(payload);
    if (result.success) {
      setShowLogin(false);
      setToast({ show: true, message: result.message, variant: 'success' });
      redirectToDashboard(result.user?.role || payload.role);
    } else {
      setToast({ show: true, message: result.message, variant: 'danger' });
    }
  };

  const handleRegister = (payload) => {
    const result = register(payload);
    if (result.success) {
      setShowRegister(false);
      setToast({ show: true, message: result.message, variant: 'success' });
      redirectToDashboard(result.user?.role || payload.role);
    } else {
      setToast({ show: true, message: result.message, variant: 'danger' });
    }
  };

  return (
    <div className="bg-body text-body min-vh-100 transition-theme">
      <Navbar
        expand="lg"
        className="shadow-sm sticky-top"
        bg={theme === 'dark' ? 'dark' : 'light'}
        data-bs-theme={theme === 'dark' ? 'dark' : 'light'}
      >
        <Container fluid>
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
            className="me-2"
            onClick={toggleSidebar}
            style={{ width: 40, height: 40, padding: 0, borderRadius: '8px' }}
            aria-label="Toggle Sidebar"
          >
            <i className="bi bi-list fs-4"></i>
          </Button>
          <Navbar.Toggle aria-controls="main-nav" className="me-2" />
          <Navbar.Brand as={Link} to="/">
            E-Learn Pro
          </Navbar.Brand>
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="nav-link-hover">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/catalog" className="nav-link-hover">
                Catalog
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="nav-link-hover">
                About
              </Nav.Link>
              {user && (
                <Nav.Link as={Link} to={getDashboardPath()} className="nav-link-hover fw-bold text-primary">
                  Dashboard
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/pricing" className="nav-link-hover">
                Pricing
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" className="nav-link-hover">
                Contact
              </Nav.Link>
            </Nav>
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="link"
                className="nav-link round-icon-btn d-flex align-items-center justify-content-center me-2"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--lumina-surface)' }}
              >
                {theme === 'dark' ? (
                  <i className="bi bi-moon-fill text-primary"></i>
                ) : (
                  <i className="bi bi-sun-fill text-warning"></i>
                )}
              </Button>
              {user ? (
                <>
                  <Button
                    variant="link"
                    className="p-0 border-0 me-3 position-relative text-primary"
                    onClick={() => setShowNotifications(true)}
                    title="Notifications"
                  >
                    <i className="bi bi-bell-fill fs-4"></i>
                    {unreadCount > 0 && (
                      <Badge
                        pill
                        bg="danger"
                        className="position-absolute translate-middle"
                        style={{ top: '10px', right: '-10px', fontSize: '0.6rem', border: '2px solid white' }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <NavDropdown
                    title={
                      <div className="d-inline-flex align-items-center">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt="Profile"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--bs-primary)'
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'var(--lumina-surface)',
                              color: 'var(--bs-primary)'
                            }}
                          >
                            <i className="bi bi-person-circle fs-5"></i>
                          </div>
                        )}
                        <span className="ms-2 d-none d-lg-inline fw-semibold" style={{ color: 'var(--lumina-text)' }}>
                          {user.username || user.email.split('@')[0]}
                        </span>
                      </div>
                    }
                    id="user-nav-dropdown"
                    align="end"
                    className="profile-dropdown"
                  >
                    <NavDropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person-gear me-2"></i> Profile Settings
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Button size="sm" variant="primary" onClick={() => setShowLogin(true)}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => setShowRegister(true)}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="Student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/certificate/:id" element={<CertificateView />} />
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute role="Instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      {/* Global Notifications Modal */}
      <Modal show={showNotifications} onHide={() => setShowNotifications(false)} centered scrollable>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Your Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash fs-1 text-muted opacity-50 mb-3 d-block"></i>
              <p className="text-muted">No notifications yet.</p>
            </div>
          ) : (
            <Stack gap={2}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-3 border-start border-4 shadow-sm transition-all ${n.read ? 'bg-light border-secondary' : `bg-white border-${n.type || 'info'}`}`}
                  style={{ cursor: 'pointer', opacity: n.read ? 0.7 : 1 }}
                  onClick={() => markNotificationAsRead(n.id)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <strong className={`text-${n.type || 'primary'}`}>{n.title}</strong>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="small text-secondary">{n.message}</div>
                </div>
              ))}
            </Stack>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="link" size="sm" className="text-muted me-auto" onClick={() => clearNotifications(user.id)}>
            Clear All
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowNotifications(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <AuthModal
        show={showLogin}
        onHide={() => setShowLogin(false)}
        title="Login"
        onSubmit={handleLogin}
        onSwitch={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <AuthModal
        show={showRegister}
        onHide={() => setShowRegister(false)}
        title="Register"
        onSubmit={handleRegister}
        onSwitch={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 2000 }}>
        <Toast
          bg={toast.variant}
          show={toast.show}
          autohide
          delay={5000}
          onClose={() => setToast({ ...toast, show: false })}
        >
          <Toast.Body className="text-white">
            <div className="d-flex align-items-center gap-2">
              <i className={`bi ${toast.variant === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              {toast.message}
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />

      <Offcanvas
        show={isSidebarOpen}
        onHide={closeSidebar}
        backdrop
        data-bs-theme={theme === 'dark' ? 'dark' : 'light'}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{sidebarConfig?.title || 'E-Learn Pro Navigation'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-2">
            {sidebarConfig ? (
              sidebarConfig.navItems.map((item) => (
                <Nav.Link key={item.to} as={Link} to={item.to} onClick={closeSidebar}>
                  {item.label}
                </Nav.Link>
              ))
            ) : (
              <>
                {user && (
                  <>
                    <div className="text-muted small fw-bold text-uppercase px-3 mb-2">My Workspace</div>
                    {user.role === 'Student' && (
                      <>
                        <Nav.Link as={Link} to="/student/dashboard" onClick={closeSidebar}>
                          <i className="bi bi-speedometer2 me-2"></i>Dashboard
                        </Nav.Link>
                      </>
                    )}
                    {user.role === 'Instructor' && (
                      <Nav.Link as={Link} to="/instructor/dashboard" onClick={closeSidebar}>
                        <i className="bi bi-speedometer2 me-2"></i>Instructor Workspace
                      </Nav.Link>
                    )}
                    {user.role === 'Admin' && (
                      <Nav.Link as={Link} to="/admin/dashboard" onClick={closeSidebar}>
                        <i className="bi bi-shield-check me-2"></i>Admin Dashboard
                      </Nav.Link>
                    )}
                    <Nav.Link as={Link} to="/profile" onClick={closeSidebar}>
                      <i className="bi bi-person-gear me-2"></i>Profile Settings
                    </Nav.Link>
                    <hr className="my-2" />
                  </>
                )}
                <div className="text-muted small fw-bold text-uppercase px-3 mb-2">Explore</div>
                <Nav.Link as={Link} to="/" onClick={closeSidebar}>Home</Nav.Link>
                <Nav.Link as={Link} to="/catalog" onClick={closeSidebar}>Catalog</Nav.Link>
                <Nav.Link as={Link} to="/about" onClick={closeSidebar}>About</Nav.Link>
                <Nav.Link as={Link} to="/pricing" onClick={closeSidebar}>Pricing</Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={closeSidebar}>Contact</Nav.Link>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

const AuthModal = ({ show, onHide, title, onSubmit, onSwitch }) => {
  const isRegister = title === 'Register';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Student');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (isRegister) {
      if (!username || username.length < 3 || username.length > 20) {
        nextErrors.username = 'Username must be between 3 and 20 characters.';
      }
      if (!email) {
        nextErrors.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = 'Please enter a valid email address.';
      }
      if (!password) {
        nextErrors.password = 'Password is required.';
      } else {
        if (password.length < 8) {
          nextErrors.password = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(password)) {
          nextErrors.password = 'Password must include an uppercase letter.';
        } else if (!/[a-z]/.test(password)) {
          nextErrors.password = 'Password must include a lowercase letter.';
        } else if (!/[0-9]/.test(password)) {
          nextErrors.password = 'Password must include a number.';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          nextErrors.password = 'Password must include a special character.';
        }
      }
      if (confirmPassword !== password) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    } else {
      if (!email) {
        nextErrors.email = 'Email is required.';
      }
      if (!password) {
        nextErrors.password = 'Password is required.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ email, role, password, username: username || undefined });
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {isRegister && (
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                isInvalid={!!errors.username}
              />
              {errors.username && (
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              )}
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              isInvalid={!!errors.email}
            />
            {errors.email && <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Strong password" : "Enter password"}
                isInvalid={!!errors.password}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}>👁‍🗨</i>
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {isRegister && (
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  isInvalid={!!errors.confirmPassword}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}>👁‍🗨</i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          )}
          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Student</option>
              <option>Instructor</option>
              {!isRegister && <option>Admin</option>}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="flex-column gap-3">
          <div className="d-flex w-100 gap-2 justify-content-end">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </div>
          <div className="text-center small">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <a
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitch();
                  }}
                  className="text-decoration-none fw-bold"
                >
                  Login
                </a>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <a
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitch();
                  }}
                  className="text-decoration-none fw-bold"
                >
                  Register
                </a>
              </span>
            )}
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AppShell;

