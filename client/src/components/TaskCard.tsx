import { useState } from "react";
import { Card, Form, Badge, Button } from "react-bootstrap";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const priorityConfig = {
  high: {
    label: "High Priority",
    borderClass: "border-priority-high",
    badgeClass: "bg-priority-high",
  },
  medium: {
    label: "Medium Priority",
    borderClass: "border-priority-medium",
    badgeClass: "bg-priority-medium",
  },
  low: {
    label: "Low Priority",
    borderClass: "border-priority-low",
    badgeClass: "bg-priority-low",
  },
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = priorityConfig[task.priority];

  return (
    <Card
      className={`task-card border-start-4 ${config.borderClass} ${task.completed ? 'task-completed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-task-${task.id}`}
    >
      <Card.Body>
        <div className="d-flex align-items-start gap-3">
          <Form.Check
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle?.(task.id)}
            className="mt-1"
            data-testid={`checkbox-task-${task.id}`}
          />
          
          <div className="flex-grow-1 min-w-0">
            <h5
              className={`task-title mb-1 ${task.completed ? '' : 'fw-semibold'}`}
              data-testid={`text-title-${task.id}`}
            >
              {task.title}
            </h5>
            
            {task.description && (
              <p
                className="task-description text-muted small mb-2"
                data-testid={`text-description-${task.id}`}
              >
                {task.description}
              </p>
            )}

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {task.dueDate && (
                <div className="d-flex align-items-center gap-1 text-muted small">
                  <Calendar size={14} />
                  <span data-testid={`text-duedate-${task.id}`}>
                    {format(task.dueDate, "MMM d, yyyy")}
                  </span>
                </div>
              )}
              
              <Badge
                className={`${config.badgeClass} text-white`}
                data-testid={`badge-priority-${task.id}`}
              >
                {config.label}
              </Badge>
            </div>
          </div>

          {isHovered && (
            <div className="d-flex gap-1">
              <Button
                variant="light"
                size="sm"
                onClick={() => onEdit?.(task.id)}
                className="p-1"
                data-testid={`button-edit-${task.id}`}
              >
                <Edit2 size={16} />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => onDelete?.(task.id)}
                className="p-1 text-danger"
                data-testid={`button-delete-${task.id}`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
