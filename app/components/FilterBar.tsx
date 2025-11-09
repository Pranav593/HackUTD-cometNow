// app/components/FilterBar.tsx
"use client";
import { useState } from "react";

const filters = ["All Events", "Social", "Food", "Study", "List View"];

export default function FilterBar() {
  const [activeFilter, setActiveFilter] = useState("All Events");

  return (
    <div className="absolute top-16 left-0 right-0 z-10 overflow-x-auto bg-white/80 px-4 pt-2 pb-3 backdrop-blur-sm">
      <div className="flex space-x-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors
              ${
                activeFilter === filter
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
          >
            {filter === "All Events" && (
              <span className="mr-2 h-2 w-2 rounded-full bg-orange-500"></span>
            )}
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}