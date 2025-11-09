"use client";

import { useState, useEffect } from "react";
import ClientMap from "@/app/components/ClientMap";
import TopBar from "@/app/components/TopBar";
import FilterBar, { MainFilter } from "@/app/components/FilterBar"; // Import MainFilter
import BottomNav from "@/app/components/BottomNav";
import DropPinButton from "@/app/components/DropPinButton";
import DropPinForm from "@/app/components/DropPinForm";
import EventDetailSheet from "@/app/components/EventDetailSheet";
import EventListView from "@/app/components/EventListView"; // Import List View
import { EventData } from "@/app/components/EventListItem"; // Import the single source of truth

export default function Home() {
  // --- All app state now lives here ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isListViewOpen, setIsListViewOpen] = useState(false);
  
  // New state for new filters
  const [activeFilter, setActiveFilter] = useState<MainFilter>("All");
  const [selectedCategory, setSelectedCategory] = useState("All"); // "All" or an EventCategory
  
  const [allEvents, setAllEvents] = useState<EventData[]>([]);

  // Fetch events ONCE when the page loads
  useEffect(() => {
    fetch("/mock-events.json")
      .then((res) => res.json())
      .then((data) => setAllEvents(data))
      .catch((err) => console.error("Error fetching mock events:", err));
  }, []);

  // --- Handlers for the FilterBar ---
  const handleFilterChange = (filter: MainFilter) => {
    setActiveFilter(filter);
    setIsListViewOpen(false); // Close list view if a map filter is clicked
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // When you pick a category, it makes sense to show "All" events in that category
    setActiveFilter("All"); 
    setIsListViewOpen(false);
  };

  const handleListViewClick = () => {
    setIsListViewOpen(true);
  };

  return (
    <main className="relative h-screen overflow-hidden">
      {/* LAYER 0: THE MAP */}
      <div className="absolute inset-0 z-0">
        <ClientMap
          onPinClick={setSelectedEvent}
          events={allEvents}
          activeFilter={activeFilter}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* LAYER 1: THE UI */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar />
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onListViewClick={handleListViewClick}
          />
        </div>

        <div className="pointer-events-auto">
          <DropPinButton onClick={() => setIsFormOpen(true)} />
          <BottomNav />
        </div>
      </div>

      {/* LAYER 2: THE MODALS */}
      <DropPinForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <EventDetailSheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <EventListView
        isOpen={isListViewOpen}
        onClose={() => setIsListViewOpen(false)}
        events={allEvents} // Pass all events to the list view
      />
    </main>
  );
}