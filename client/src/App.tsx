import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Tasks from "@/pages/Tasks";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import { Spinner, Container, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { LayoutDashboard, Users, CheckSquare, LogOut, User } from "lucide-react";

function AppNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const userName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.email || "Admin";

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm sticky-top">
      <Container fluid>
        <Navbar.Brand as={Link} href="/" className="fw-bold text-primary" data-testid="link-brand">
          <CheckSquare className="me-2" size={24} />
          Employee Task Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              href="/" 
              className={location === "/" ? "active fw-semibold" : ""}
              data-testid="link-dashboard"
            >
              <LayoutDashboard size={18} className="me-1" />
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/employees" 
              className={location === "/employees" ? "active fw-semibold" : ""}
              data-testid="link-employees"
            >
              <Users size={18} className="me-1" />
              Employees
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/tasks" 
              className={location === "/tasks" ? "active fw-semibold" : ""}
              data-testid="link-tasks"
            >
              <CheckSquare size={18} className="me-1" />
              Tasks
            </Nav.Link>
          </Nav>
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2" data-testid="dropdown-user">
              <User size={18} />
              {userName}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="/api/logout" data-testid="link-logout">
                <LogOut size={16} className="me-2" />
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function AuthenticatedApp() {
  return (
    <div className="min-vh-100 bg-light">
      <AppNavbar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/employees" component={Employees} />
        <Route path="/tasks" component={Tasks} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
