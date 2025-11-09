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

export type MainFilter = "All" | "Recommended" | "Attending" | "Past";

interface FilterBarProps {
  // Main filters
  activeFilter: MainFilter;
  onFilterChange: (filter: MainFilter) => void;
  // Category filter
  selectedCategory: string;
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
  
  const isAllButtonActive = activeFilter === "All" && selectedCategory === "All";
  const isCategoryActive = selectedCategory !== "All";

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
          onClick={() => onFilterChange("All")}
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
        <FilterButton filterName="Attending" /> 
        <FilterButton filterName="Past" /> 

        {/* UPDATED Category Dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`h-full appearance-none rounded-md px-3 py-1.5 pr-8 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 whitespace-nowrap
              ${
                isCategoryActive
                  ? "bg-gray-800 text-white" // Active
                  : "bg-gray-200 text-gray-700" // Inactive
              }`}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className={`pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2
              ${
                isCategoryActive ? "text-white" : "text-gray-500" 
              }`}
          />
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