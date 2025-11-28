import EmptyState from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <div className="p-3">
      <EmptyState onCreateTask={(data) => console.log("Create task:", data)} />
    </div>
  );
}
