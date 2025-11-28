import { useState } from "react";
import FilterBar, { FilterStatus, SortOption } from "../FilterBar";

export default function FilterBarExample() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");

  return (
    <div className="p-3">
      <FilterBar
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        taskCounts={{ all: 12, active: 8, completed: 4 }}
      />
    </div>
  );
}
