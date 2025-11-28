import { useState } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert, Badge, ButtonGroup } from "react-bootstrap";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, CheckSquare, Calendar, User, Filter } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Task, Employee } from "@shared/schema";

interface TaskFormData {
  title: string;
  description: string;
  employeeId: number | "";
  dueDate: string;
  priority: string;
  status: string;
}

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  employeeId: "",
  dueDate: "",
  priority: "medium",
  status: "pending",
};

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" },
  "in-progress": { label: "In Progress", variant: "primary" },
  completed: { label: "Completed", variant: "success" },
};

const priorityConfig = {
  high: { label: "High", color: "#EF4444", bgColor: "#FEE2E2" },
  medium: { label: "Medium", color: "#F59E0B", bgColor: "#FEF3C7" },
  low: { label: "Low", color: "#6B7280", bgColor: "#F3F4F6" },
};

export default function Tasks() {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", filterEmployee, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterEmployee) params.append("employeeId", filterEmployee);
      if (filterStatus) params.append("status", filterStatus);
      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDeleteConfirm(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      employeeId: task.employeeId || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      priority: task.priority,
      status: task.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      employeeId: formData.employeeId ? Number(formData.employeeId) : null,
      dueDate: formData.dueDate || null,
    };
    
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateMutation.mutate({
      id: task.id,
      data: { status: newStatus },
    });
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  if (tasksLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4" style={{ maxWidth: "1400px" }}>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1" data-testid="text-page-title">Tasks</h2>
          <p className="text-muted mb-0">Manage and track employee tasks</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} data-testid="button-add-task">
          <Plus size={18} className="me-2" />
          Add Task
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="py-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} sm={6} md={4}>
              <div className="d-flex align-items-center gap-2">
                <Filter size={18} className="text-muted" />
                <Form.Select 
                  size="sm"
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  data-testid="select-filter-employee"
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Select
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                data-testid="select-filter-status"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={4} className="text-md-end">
              <span className="text-muted small" data-testid="text-task-count">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {tasks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <CheckSquare size={48} className="text-muted mb-3" />
            <h5>No Tasks Found</h5>
            <p className="text-muted mb-3">
              {filterEmployee || filterStatus 
                ? "No tasks match your filters." 
                : "Get started by creating your first task."}
            </p>
            {!filterEmployee && !filterStatus && (
              <Button variant="primary" onClick={handleOpenCreate}>
                <Plus size={18} className="me-2" />
                Add Task
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 px-4">Task</th>
                  <th className="border-0 py-3 px-4">Assigned To</th>
                  <th className="border-0 py-3 px-4">Due Date</th>
                  <th className="border-0 py-3 px-4">Priority</th>
                  <th className="border-0 py-3 px-4">Status</th>
                  <th className="border-0 py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
                  
                  return (
                    <tr key={task.id} data-testid={`row-task-${task.id}`}>
                      <td className="py-3 px-4">
                        <div>
                          <span 
                            className="fw-medium d-block" 
                            style={{ 
                              textDecoration: task.status === "completed" ? "line-through" : "none",
                              opacity: task.status === "completed" ? 0.7 : 1 
                            }}
                            data-testid={`text-title-${task.id}`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <small className="text-muted" data-testid={`text-desc-${task.id}`}>
                              {task.description.length > 50 
                                ? task.description.substring(0, 50) + "..." 
                                : task.description}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                          <User size={16} className="text-muted" />
                          <span data-testid={`text-assignee-${task.id}`}>
                            {task.employeeId ? getEmployeeName(task.employeeId) : "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {task.dueDate ? (
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <Calendar size={16} />
                            <span data-testid={`text-duedate-${task.id}`}>
                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          style={{ backgroundColor: priority.bgColor, color: priority.color }}
                          data-testid={`badge-priority-${task.id}`}
                        >
                          {priority.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Form.Select
                          size="sm"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          style={{ width: "130px" }}
                          data-testid={`select-status-${task.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Form.Select>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <Button
                          variant="light"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEdit(task)}
                          data-testid={`button-edit-${task.id}`}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="text-danger"
                          onClick={() => setDeleteConfirm(task.id)}
                          data-testid={`button-delete-${task.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" data-testid="modal-task">
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? "Edit Task" : "Add Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
                data-testid="input-title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add task description (optional)"
                data-testid="input-description"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Assign to Employee</Form.Label>
                  <Form.Select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value ? Number(e.target.value) : "" })}
                    data-testid="select-employee"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    data-testid="input-duedate"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority *</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    data-testid="select-priority"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    data-testid="select-status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button variant="secondary" onClick={handleCloseModal} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Spinner size="sm" className="me-2" />
                )}
                {editingTask ? "Save Changes" : "Add Task"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered data-testid="modal-delete-confirm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this task?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending && <Spinner size="sm" className="me-2" />}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
