import { useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import FilterBar, { FilterStatus, SortOption } from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";
import TaskDialog from "@/components/TaskDialog";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data);
  };

  const handleUpdateTask = (data: any) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    }
  };

  const handleToggleTask = (id: string) => {
    toggleTaskMutation.mutate(id);
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setEditingTask(task);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleCloseEditDialog = () => {
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "active") return !task.completed;
    if (filterStatus === "completed") return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "created") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    return 0;
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const userName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.email || "User";

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100">
        <Header userName={userName} />
        <Container className="py-4">
          <Alert variant="danger">
            Failed to load tasks. Please try refreshing the page.
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Header userName={userName} />
      
      <Container fluid className="py-4 px-3 px-sm-4" style={{ maxWidth: "1400px" }}>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="mb-1">My Tasks</h2>
            <p className="text-muted mb-0">
              Manage and organize your daily tasks
            </p>
          </div>
          <TaskDialog onSubmit={handleCreateTask} />
        </div>

        <div className="mb-4">
          <FilterBar
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            taskCounts={taskCounts}
          />
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyState onCreateTask={handleCreateTask} />
        ) : (
          <Row xs={1} md={2} lg={3} className="g-3">
            {sortedTasks.map((task) => (
              <Col key={task.id}>
                <TaskCard
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description || undefined,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    priority: task.priority as "high" | "medium" | "low",
                    completed: task.completed,
                  }}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {editingTask && (
        <TaskDialog
          mode="edit"
          isOpen={true}
          onClose={handleCloseEditDialog}
          onSubmit={handleUpdateTask}
          initialData={{
            title: editingTask.title,
            description: editingTask.description || "",
            dueDate: editingTask.dueDate 
              ? new Date(editingTask.dueDate).toISOString().split('T')[0] 
              : "",
            priority: editingTask.priority as "high" | "medium" | "low",
          }}
        />
      )}
    </div>
  );
}
