import { Button, Form, ButtonGroup } from "react-bootstrap";
import { CheckCircle2, Circle, ListTodo } from "lucide-react";

export type FilterStatus = "all" | "active" | "completed";
export type SortOption = "priority" | "dueDate" | "created";

interface FilterBarProps {
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  taskCounts?: {
    all: number;
    active: number;
    completed: number;
  };
}

export default function FilterBar({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  taskCounts,
}: FilterBarProps) {
  const filters: Array<{ value: FilterStatus; label: string; icon: React.ReactNode }> = [
    { value: "all", label: "All Tasks", icon: <ListTodo size={16} /> },
    { value: "active", label: "Active", icon: <Circle size={16} /> },
    { value: "completed", label: "Completed", icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="d-flex flex-column flex-sm-row gap-3 align-items-start align-items-sm-center justify-content-between">
      <ButtonGroup>
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={filterStatus === filter.value ? "primary" : "outline-secondary"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="d-flex align-items-center gap-2"
            data-testid={`button-filter-${filter.value}`}
          >
            {filter.icon}
            {filter.label}
            {taskCounts && (
              <span className="ms-1 small opacity-75">
                ({taskCounts[filter.value]})
              </span>
            )}
          </Button>
        ))}
      </ButtonGroup>

      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Sort by:</span>
        <Form.Select
          size="sm"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          style={{ width: "160px" }}
          data-testid="select-sort"
        >
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="created">Created Date</option>
        </Form.Select>
      </div>
    </div>
  );
}
