// app/page.tsx
"use client";
import { useState } from "react"; // 1. Import useState
import ClientMap from "@/app/components/ClientMap";
import TopBar from "@/app/components/TopBar";
import FilterBar from "@/app/components/FilterBar";
import BottomNav from "@/app/components/BottomNav";
import DropPinButton from "@/app/components/DropPinButton";
import DropPinForm from "@/app/components/DropPinForm"; // 2. Import the new form

export default function Home() {
  // 3. Add state to manage the modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="relative h-screen overflow-hidden">
      {/* LAYER 0: THE MAP */}
      <div className="absolute inset-0 z-0">
        <ClientMap />
      </div>

      {/* LAYER 1: THE UI */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar />
          <FilterBar />
        </div>
        
        <div className="pointer-events-auto">
          {/* 4. Pass the onClick handler to the button */}
          <DropPinButton onClick={() => setIsFormOpen(true)} />
          <BottomNav />
        </div>
      </div>

      {/* LAYER 2: THE MODAL FORM */}
      {/* 5. Add the form, controlled by your state */}
      <DropPinForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </main>
  );
}