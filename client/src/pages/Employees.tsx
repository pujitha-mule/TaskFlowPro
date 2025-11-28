import { useState } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert, Badge } from "react-bootstrap";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Users, Mail, Briefcase, Building } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Employee } from "@shared/schema";

interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
}

const emptyForm: EmployeeFormData = {
  name: "",
  email: "",
  department: "",
  position: "",
};

export default function Employees() {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: employees = [], isLoading, error } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeFormData }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDeleteConfirm(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department || "",
      position: employee.position || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

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
        <Alert variant="danger">Failed to load employees.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4" style={{ maxWidth: "1400px" }}>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1" data-testid="text-page-title">Employees</h2>
          <p className="text-muted mb-0">Manage your team members</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} data-testid="button-add-employee">
          <Plus size={18} className="me-2" />
          Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Users size={48} className="text-muted mb-3" />
            <h5>No Employees Yet</h5>
            <p className="text-muted mb-3">
              Get started by adding your first team member.
            </p>
            <Button variant="primary" onClick={handleOpenCreate}>
              <Plus size={18} className="me-2" />
              Add Employee
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 px-4">Name</th>
                  <th className="border-0 py-3 px-4">Email</th>
                  <th className="border-0 py-3 px-4">Department</th>
                  <th className="border-0 py-3 px-4">Position</th>
                  <th className="border-0 py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} data-testid={`row-employee-${employee.id}`}>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, fontSize: "14px" }}>
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-medium" data-testid={`text-name-${employee.id}`}>{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-muted" data-testid={`text-email-${employee.id}`}>{employee.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      {employee.department ? (
                        <Badge bg="light" text="dark" className="fw-normal" data-testid={`badge-dept-${employee.id}`}>
                          <Building size={12} className="me-1" />
                          {employee.department}
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {employee.position ? (
                        <span data-testid={`text-position-${employee.id}`}>{employee.position}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <Button
                        variant="light"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenEdit(employee)}
                        data-testid={`button-edit-${employee.id}`}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger"
                        onClick={() => setDeleteConfirm(employee.id)}
                        data-testid={`button-delete-${employee.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered data-testid="modal-employee">
        <Modal.Header closeButton>
          <Modal.Title>{editingEmployee ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter employee name"
                required
                data-testid="input-name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
                data-testid="input-email"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering"
                    data-testid="input-department"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Software Developer"
                    data-testid="input-position"
                  />
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
                {editingEmployee ? "Save Changes" : "Add Employee"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered data-testid="modal-delete-confirm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this employee? This will also delete all tasks assigned to them.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
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
