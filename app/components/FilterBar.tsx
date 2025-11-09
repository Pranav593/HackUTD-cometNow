"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { EventCategory } from "./EventListItem"; // Import your new type

// Your new categories
const categories: EventCategory[] = [
  "Social",
  "Food",
  "Study",
  "Academic",
  "Career",
  "Recreation",
  "Other",
];

export type MainFilter = "All" | "Recommended" | "Past";

interface FilterBarProps {
  // Main filters
  activeFilter: MainFilter;
  onFilterChange: (filter: MainFilter) => void;
  // Category filter
  selectedCategory: string; // Can be "All" or an EventCategory
  onCategoryChange: (category: string) => void;
  // List view
  onListViewClick: () => void;
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  onListViewClick,
}: FilterBarProps) {
  
  
  const FilterButton = ({
    filterName,
  }: {
    filterName: MainFilter;
  }) => (
    <button
      onClick={() => onFilterChange(filterName)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
        ${
          activeFilter === filterName
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
    >
      {filterName}
    </button>
  );

  return (
    <div
      className="fixed top-16 left-0 right-0 z-10 overflow-x-auto bg-white/80 px-4 pt-2 pb-3 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex space-x-3">
        {/* Main Filters */}
        <FilterButton filterName="All" />
        <FilterButton filterName="Recommended" />
        <FilterButton filterName="Past" />

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-full appearance-none rounded-full bg-gray-200 px-4 py-1.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        </div>

        {/* List View Button */}
        <button
          onClick={onListViewClick}
          className="rounded-full bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700"
        >
          List View
        </button>
      </div>
    </div>
  );
}