import { Container, Button, Row, Col, Card } from "react-bootstrap";
import { CheckSquare, Users, LayoutDashboard, Shield, ArrowRight, BarChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="app-header sticky-top py-3">
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <CheckSquare size={28} className="text-primary" />
              <span className="fw-bold fs-4">Employee Task Tracker</span>
            </div>
            <Button
              variant="primary"
              href="/api/login"
              className="d-flex align-items-center gap-2"
              data-testid="button-login"
            >
              Sign In
              <ArrowRight size={18} />
            </Button>
          </div>
        </Container>
      </nav>

      <main className="flex-grow-1">
        <Container className="py-5">
          <Row className="align-items-center mb-5 py-4">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">
                Manage Your Team's Tasks{" "}
                <span className="text-primary">Effortlessly</span>
              </h1>
              <p className="lead text-muted mb-4">
                A complete internal tool for managing tasks within your company.
                Track employee assignments, monitor progress, and boost team productivity.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  href="/api/login"
                  className="d-flex align-items-center gap-2"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="bg-light rounded-4 p-4">
                <div className="d-flex flex-column gap-3">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="py-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            JD
                          </div>
                          <div>
                            <h6 className="mb-0">Complete project proposal</h6>
                            <small className="text-muted">John Doe - Due: Nov 28</small>
                          </div>
                        </div>
                        <span className="badge" style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}>High</span>
                      </div>
                    </Card.Body>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="py-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            JS
                          </div>
                          <div>
                            <h6 className="mb-0 text-decoration-line-through opacity-50">Review team feedback</h6>
                            <small className="text-muted">Jane Smith - Completed</small>
                          </div>
                        </div>
                        <span className="badge bg-success">Done</span>
                      </div>
                    </Card.Body>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="py-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            MJ
                          </div>
                          <div>
                            <h6 className="mb-0">Update documentation</h6>
                            <small className="text-muted">Mike Johnson - In Progress</small>
                          </div>
                        </div>
                        <span className="badge" style={{ backgroundColor: "#FEF3C7", color: "#F59E0B" }}>Medium</span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="g-4 py-5">
            <Col md={4}>
              <Card className="h-100 text-center p-4 border-0 bg-light">
                <Card.Body>
                  <div className="d-inline-flex rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <Users size={28} className="text-primary" />
                  </div>
                  <h5 className="mb-2">Employee Management</h5>
                  <p className="text-muted mb-0">
                    Add and manage your team members with departments and positions
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center p-4 border-0 bg-light">
                <Card.Body>
                  <div className="d-inline-flex rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <CheckSquare size={28} className="text-primary" />
                  </div>
                  <h5 className="mb-2">Task Assignment</h5>
                  <p className="text-muted mb-0">
                    Assign tasks to employees with priority levels and due dates
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center p-4 border-0 bg-light">
                <Card.Body>
                  <div className="d-inline-flex rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <BarChart size={28} className="text-primary" />
                  </div>
                  <h5 className="mb-2">Dashboard Analytics</h5>
                  <p className="text-muted mb-0">
                    View completion rates, task distribution, and team performance
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="py-5">
            <Col>
              <Card className="border-0 bg-primary text-white p-5 text-center">
                <Card.Body>
                  <h2 className="mb-3">Ready to boost your team's productivity?</h2>
                  <p className="lead mb-4 opacity-75">
                    Start managing employee tasks today with our intuitive interface.
                  </p>
                  <Button 
                    variant="light" 
                    size="lg"
                    href="/api/login"
                    className="d-inline-flex align-items-center gap-2"
                    data-testid="button-cta"
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="py-4 border-top">
        <Container>
          <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
            <CheckSquare size={20} />
            <span>Employee Task Tracker - Team Task Management Made Simple</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
