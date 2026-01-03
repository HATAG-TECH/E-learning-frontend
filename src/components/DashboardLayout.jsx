import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useUI } from '../contexts/UIContext.jsx';

const DashboardLayout = ({ title, children, navItems }) => {
  const { setSidebarConfig } = useUI();

  useEffect(() => {
    // Only update if the config actually changes to avoid infinite loops
    // JSON.stringify is a simple way to compare static navItems arrays
    setSidebarConfig(prev => {
      const next = { title, navItems };
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
    return () => setSidebarConfig(null);
  }, [title, navItems, setSidebarConfig]);

  return (
    <Container fluid className="py-4 transition-theme">
      {children}
    </Container>
  );
};

export default DashboardLayout;

