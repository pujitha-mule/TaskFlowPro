import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Plus } from "lucide-react";
import type { Priority } from "./TaskCard";

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
}

interface TaskDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  mode?: "create" | "edit";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TaskDialog({ 
  trigger, 
  onSubmit, 
  initialData, 
  mode = "create",
  isOpen,
  onClose 
}: TaskDialogProps) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    priority: initialData?.priority || "medium",
  });

  // Sync with controlled isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setShow(isOpen);
    }
  }, [isOpen]);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        dueDate: initialData.dueDate || "",
        priority: initialData.priority || "medium",
      });
    }
  }, [initialData]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  const handleShow = () => setShow(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    handleClose();
    if (mode === "create") {
      setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
    }
  };

  // For controlled mode (edit), don't render trigger
  if (isOpen !== undefined) {
    return (
      <Modal show={show} onHide={handleClose} centered data-testid="dialog-task-edit">
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
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
                data-testid="input-edit-title"
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
                data-testid="input-edit-description"
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    data-testid="input-edit-duedate"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Priority *</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    data-testid="select-edit-priority"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button variant="secondary" onClick={handleClose} data-testid="button-edit-cancel">
                Cancel
              </Button>
              <Button variant="primary" type="submit" data-testid="button-edit-submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      {trigger ? (
        <div onClick={handleShow}>{trigger}</div>
      ) : (
        <Button variant="primary" onClick={handleShow} data-testid="button-add-task">
          <Plus size={18} className="me-2" />
          Add Task
        </Button>
      )}

      <Modal show={show} onHide={handleClose} centered data-testid="dialog-task">
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
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

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    data-testid="input-duedate"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Priority *</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    data-testid="select-priority"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button variant="secondary" onClick={handleClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button variant="primary" type="submit" data-testid="button-submit">
                Create Task
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
