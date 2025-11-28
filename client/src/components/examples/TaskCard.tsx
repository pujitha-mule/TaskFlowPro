import TaskCard from "../TaskCard";

export default function TaskCardExample() {
  const sampleTask = {
    id: "1",
    title: "Complete project proposal",
    description: "Finalize the Q4 project proposal with budget estimates and timeline",
    dueDate: new Date("2025-11-15"),
    priority: "high" as const,
    completed: false,
  };

  return (
    <div className="p-3">
      <TaskCard
        task={sampleTask}
        onToggle={(id) => console.log("Toggle task:", id)}
        onEdit={(id) => console.log("Edit task:", id)}
        onDelete={(id) => console.log("Delete task:", id)}
      />
    </div>
  );
}
