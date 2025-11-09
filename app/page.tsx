// app/page.tsx
"use client"; // <-- Make page.tsx a client component to manage state

import { useState } from "react";
import ClientMap from "@/app/components/ClientMap";
import TopBar from "@/app/components/TopBar";
import FilterBar from "@/app/components/FilterBar";
import BottomNav from "@/app/components/BottomNav";
import DropPinButton from "@/app/components/DropPinButton";
import DropPinForm from "@/app/components/DropPinForm";
import EventDetailSheet from "@/app/components/EventDetailSheet"; // <-- 1. Import new sheet

// Define EventData shape here so this page knows about it
interface EventData {
  title: string;
  category: "Social" | "Food" | "Study" | "Academic" | "Career" | "Recreation" | "Other" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  // --- 2. ADD STATE FOR THE SELECTED EVENT ---
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  return (
    <main className="relative h-screen overflow-hidden">
      {/* BLURRED CONTENT WHEN FORM OPEN */}
  <div className={isFormOpen ? "relative h-full w-full blur-sm transition duration-200" : "relative h-full w-full transition duration-200"}>
        {/* LAYER 0: THE MAP */}
        <div className="absolute inset-0 z-0">
          {/* 3. Pass the "setter" function down to the map */}
          <ClientMap onPinClick={setSelectedEvent} />
        </div>

        {/* LAYER 1: THE UI */}
        <div className="relative z-10 h-full w-full pointer-events-none">
          <div className="pointer-events-auto">
            <TopBar />
            <FilterBar />
          </div>
          
          <div className="pointer-events-auto">
            <DropPinButton onClick={() => setIsFormOpen(true)} />
            <BottomNav />
          </div>
        </div>
      </div>

      {/* LAYER 2: THE MODALS */}
      <DropPinForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      
      {/* 4. Add the new Event Detail Sheet */}
      <EventDetailSheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </main>
  );
}