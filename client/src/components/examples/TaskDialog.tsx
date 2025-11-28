import TaskDialog from "../TaskDialog";

export default function TaskDialogExample() {
  return (
    <div className="p-3">
      <TaskDialog
        onSubmit={(data) => console.log("Task submitted:", data)}
      />
    </div>
  );
}
