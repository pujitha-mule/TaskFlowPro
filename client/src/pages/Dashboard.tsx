import * as React from "react";
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckSquare, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Failed to load dashboard data.</Alert>
      </Container>
    );
  }

  const priorityColors = {
    high: "#EF4444",
    medium: "#F59E0B", 
    low: "#6B7280",
  };

  return (
    <Container fluid className="py-4 px-4" style={{ maxWidth: "1400px" }}>
      <div className="mb-4">
        <h2 className="mb-1" data-testid="text-page-title">Dashboard</h2>
        <p className="text-muted mb-0">Overview of tasks and employees</p>
      </div>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "#EFF6FF" }}>
                  <CheckSquare size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-muted small mb-0">Total Tasks</p>
                  <h3 className="mb-0" data-testid="text-total-tasks">{stats?.totalTasks || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "#ECFDF5" }}>
                  <CheckCircle size={24} className="text-success" />
                </div>
                <div>
                  <p className="text-muted small mb-0">Completed</p>
                  <h3 className="mb-0" data-testid="text-completed-tasks">{stats?.completedTasks || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "#FEF3C7" }}>
                  <Clock size={24} className="text-warning" />
                </div>
                <div>
                  <p className="text-muted small mb-0">In Progress</p>
                  <h3 className="mb-0" data-testid="text-inprogress-tasks">{stats?.inProgressTasks || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "#F3F4F6" }}>
                  <Users size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-muted small mb-0">Employees</p>
                  <h3 className="mb-0" data-testid="text-total-employees">{stats?.totalEmployees || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <TrendingUp size={20} className="me-2 text-primary" />
                Completion Rate
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <h1 className="display-4 text-primary mb-0" data-testid="text-completion-rate">
                  {stats?.completionRate || 0}%
                </h1>
                <p className="text-muted">Tasks Completed</p>
              </div>
              <ProgressBar 
                now={stats?.completionRate || 0} 
                variant="primary"
                style={{ height: "12px" }}
                data-testid="progress-completion"
              />
              <div className="d-flex justify-content-between mt-3 text-muted small">
                <span>{stats?.completedTasks || 0} completed</span>
                <span>{stats?.totalTasks || 0} total</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <AlertCircle size={20} className="me-2 text-primary" />
                Tasks by Priority
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: priorityColors.high }}></span>
                    High Priority
                  </span>
                  <strong data-testid="text-high-priority">{stats?.tasksByPriority?.high || 0}</strong>
                </div>
                <ProgressBar 
                  now={stats?.totalTasks ? ((stats.tasksByPriority?.high || 0) / stats.totalTasks * 100) : 0}
                  style={{ height: "8px", backgroundColor: "#FEE2E2" }}
                  variant="danger"
                />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: priorityColors.medium }}></span>
                    Medium Priority
                  </span>
                  <strong data-testid="text-medium-priority">{stats?.tasksByPriority?.medium || 0}</strong>
                </div>
                <ProgressBar 
                  now={stats?.totalTasks ? ((stats.tasksByPriority?.medium || 0) / stats.totalTasks * 100) : 0}
                  style={{ height: "8px", backgroundColor: "#FEF3C7" }}
                  variant="warning"
                />
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: priorityColors.low }}></span>
                    Low Priority
                  </span>
                  <strong data-testid="text-low-priority">{stats?.tasksByPriority?.low || 0}</strong>
                </div>
                <ProgressBar 
                  now={stats?.totalTasks ? ((stats.tasksByPriority?.low || 0) / stats.totalTasks * 100) : 0}
                  style={{ height: "8px", backgroundColor: "#F3F4F6" }}
                  variant="secondary"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {stats?.tasksByEmployee && stats.tasksByEmployee.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <Users size={20} className="me-2 text-primary" />
                  Tasks by Employee
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 py-3 px-4">Employee</th>
                        <th className="border-0 py-3 px-4 text-end">Tasks Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.tasksByEmployee.map((emp) => (
                        <tr key={emp.employeeId} data-testid={`row-employee-${emp.employeeId}`}>
                          <td className="py-3 px-4">{emp.employeeName}</td>
                          <td className="py-3 px-4 text-end">
                            <span className="badge bg-primary rounded-pill">
                              {emp.taskCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {(!stats?.totalEmployees || stats.totalEmployees === 0) && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Users size={48} className="text-muted mb-3" />
                <h5>No Employees Yet</h5>
                <p className="text-muted mb-0">
                  Add employees to start assigning tasks.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
