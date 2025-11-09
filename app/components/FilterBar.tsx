"use client";

import { Bars3Icon } from "@heroicons/react/24/solid"; // Only need Bars3Icon now
import { EventCategory } from "./EventListItem";
// Removed ChevronDownIcon, useState, useEffect, useRef related to dropdown
import { useState } from "react"; 

// Categories are now internal/unused, but kept for context if needed elsewhere.
const categories: EventCategory[] = [
  "Social",
  "Food",
  "Study",
  "Academic",
  "Career",
  "Recreation",
  "Other",
];

// MainFilter type is now final: no "Going" or category complexity.
export type MainFilter = "All" | "Recommended" | "Past";

interface FilterBarProps {
  activeFilter: MainFilter;
  onFilterChange: (filter: MainFilter) => void;
  // selectedCategories and onCategoryChange props removed as they are unused
  onListViewClick: () => void;
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  // selectedCategories, // Removed
  // onCategoryChange,   // Removed
  onListViewClick,
}: FilterBarProps) {
  
  // Local state for the dropdown is removed, only logic for filters remains.

  // --- Filter Click Logic ---
  const handleFilterClick = (filterName: MainFilter) => {
    // No dropdown to close!
    onFilterChange(filterName);
  };

  // Simplified logic, as there are no categories to manage anymore.
  const isAllButtonActive = activeFilter === "All"; 
  const isCategoryActive = false; // Always false now

  // Renders the main filter buttons (Recommended, Past)
  const FilterButton = ({
    filterName,
  }: {
    filterName: MainFilter;
  }) => (
    <button
      onClick={() => handleFilterClick(filterName)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0
        ${
          (activeFilter === filterName) 
            ? "bg-gray-800 text-white" 
            : "bg-gray-200 text-gray-700"
        }`}
    >
      {filterName}
    </button>
  );

  return (
    // Outer Container
    <div
      className="z-30 bg-white/90 px-4 py-3 backdrop-blur-sm shadow-sm"
      style={{ pointerEvents: "auto" }}
    >
      {/* Horizontal scrolling container for the buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-1"> 
        
        {/* 1. "All Events" Button  */}
        <button
          onClick={() => handleFilterClick("All")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0
            ${
              isAllButtonActive
                ? "bg-gray-800 text-white" 
                : "bg-gray-200 text-gray-700"
            }`}
        >
          All Events
        </button>

        {/* 2. Recommended Filter */}
        <FilterButton filterName="Recommended" />

        {/* 3. Past Filter */}
        <FilterButton filterName="Past" /> 
        
        {/* 4. List View Button */}
        <button
          onClick={onListViewClick}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap flex items-center gap-1"
        >
          <Bars3Icon className="h-4 w-4"/>
          List View
        </button>
      </div>
    </div> 
  );
}