"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { EventCategory } from "./EventListItem";
import { useState, useEffect } from "react";

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

export type MainFilter = "All" | "Recommended" | "Going" | "Past";

interface FilterBarProps {
  activeFilter: MainFilter;
  onFilterChange: (filter: MainFilter) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string[]) => void;
  onListViewClick: () => void;
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  selectedCategories,
  onListViewClick,
  onCategoryChange,
}: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newCategories);
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      onCategoryChange([]);
    } else {
      onCategoryChange(categories);
    }
  };

  const FilterButton = ({
    filterName,
  }: {
    filterName: "Recommended" | "Going" | "Past";
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
        {/* Category Dropdown */}
        <div className="relative category-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCategoryOpen(!isCategoryOpen);
            }}
            className="relative h-full appearance-none rounded-full bg-gray-200 px-4 py-1.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Events
            <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          </button>
          {isCategoryOpen && (
            <div 
              className="absolute mt-2 w-48 rounded-md bg-white shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <label className="flex items-center px-4 py-2">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedCategories.length === categories.length}
                    onChange={handleSelectAll}
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center px-4 py-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other Main Filters */}
        <FilterButton filterName="Recommended" />
        <FilterButton filterName="Going" />
        <FilterButton filterName="Past" />

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