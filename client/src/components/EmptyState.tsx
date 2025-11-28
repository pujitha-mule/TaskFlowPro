import { CheckCircle2 } from "lucide-react";
import TaskDialog from "./TaskDialog";

interface EmptyStateProps {
  onCreateTask?: (data: any) => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3" data-testid="empty-state">
      <div className="d-inline-flex rounded-circle bg-light p-4 mb-3">
        <CheckCircle2 size={48} className="text-muted" />
      </div>
      <h3 className="mb-2">No tasks yet</h3>
      <p className="text-muted mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
        Get started by creating your first task. Stay organized and boost your productivity!
      </p>
      <TaskDialog onSubmit={onCreateTask} />
    </div>
  );
}
