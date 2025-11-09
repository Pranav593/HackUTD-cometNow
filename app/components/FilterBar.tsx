"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { EventCategory } from "./EventListItem";
import { useState, useEffect } from "react";

// Your new categories (unchanged)
const categories: EventCategory[] = [
  "Social",
  "Food",
  "Study",
  "Academic",
  "Career",
  "Recreation",
  "Other",
];

export type MainFilter = "All" | "Recommended" | "Going" | "Past";

interface FilterBarProps {
  // Main filters
  activeFilter: MainFilter;
  onFilterChange: (filter: MainFilter) => void;
  // Category filter
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  // List view
  onListViewClick: () => void;
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  selectedCategories,
  onCategoryChange,
  onListViewClick,
}: FilterBarProps) {
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleCategoryCheckboxChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newCategories);
  };

  const isAllButtonActive = activeFilter === "All" && selectedCategories.length === 0;
  const isCategoryActive = selectedCategories.length > 0;

  // A helper sub-component for the main filter buttons
  const FilterButton = ({
    filterName,
  }: {
    filterName: MainFilter;
  }) => (
    <button
      onClick={() => onFilterChange(filterName)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap
        ${
          activeFilter === filterName
            ? "bg-gray-800 text-white" // Active
            : "bg-gray-200 text-gray-700" // Inactive
        }`}
    >
      {filterName}
    </button>
  );

  return (
    <div
      className="fixed top-16 left-0 right-0 z-10 overflow-x-auto bg-white/80 px-4 pt-2 pb-3 backdrop-blur-sm shadow-sm"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex space-x-2"> 
        {/* "All" Button  */}
        <button
          onClick={() => {
            onFilterChange("All");
            onCategoryChange([]);
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap
            ${
              isAllButtonActive
                ? "bg-gray-800 text-white" // Active
                : "bg-gray-200 text-gray-700" // Inactive
            }`}
        >
          All
        </button>

        {/* Other Main Filters */}
        <FilterButton filterName="Recommended" />
        <FilterButton filterName="Going" /> 
        <FilterButton filterName="Past" /> 

        {/* UPDATED Category Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 whitespace-nowrap
              ${
                isCategoryActive
                  ? "bg-gray-800 text-white" // Active
                  : "bg-gray-200 text-gray-700" // Inactive
              }`}
          >
            <span>{isCategoryActive ? `${selectedCategories.length} Selected` : "Categories"}</span>
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform
                ${isCategoryDropdownOpen ? "rotate-180" : ""}
                ${isCategoryActive ? "text-white" : "text-gray-500"}`}
            />
          </button>
          {isCategoryDropdownOpen && (
            <div className="absolute mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryCheckboxChange(cat)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-3">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List View Button */}
        <button
          onClick={onListViewClick}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap"
        >
          List View
        </button>
      </div>
    </div>
  );
}