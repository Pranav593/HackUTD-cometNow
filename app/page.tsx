// app/page.tsx
"use client";

// Imports from both branches
import { useState, useEffect } from "react";
import { useUser } from '@auth0/nextjs-auth0/client'; // <-- From AuthBack
import ClientMap from "@/app/components/ClientMap";
import TopBar from "@/app/components/TopBar";
import FilterBar from "@/app/components/FilterBar";
import BottomNav from "@/app/components/BottomNav";
import DropPinButton from "@/app/components/DropPinButton";
import DropPinForm from "@/app/components/DropPinForm";
import EventDetailSheet from "@/app/components/EventDetailSheet";

// Interface from 'main'
interface EventData {
  title: string;
  category: "Social" | "Food" | "Study" | "Academic"| "Career"|" Recreation" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

export default function Home() {
  // State from 'main'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // Hooks from 'AuthBack'
  const { user, error, isLoading } = useUser();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Passive check from 'AuthBack': do NOT redirect, just show banner.
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!isLoading && user) {
        try {
          const res = await fetch('/api/onboarding-status', { cache: 'no-store' });
          if (active && res.ok) {
            const data = await res.json();
            if (data?.authenticated && data?.onboarded === false) {
              setNeedsOnboarding(true);
            }
          }
        } catch {/* ignore */}
      }
    };
    check();
    return () => { active = false; };
  }, [isLoading, user]);

  return (
    <main className="relative h-screen overflow-hidden">
      {/* LAYER 0: THE MAP */}
      <div className="absolute inset-0 z-0">
        <ClientMap onPinClick={setSelectedEvent} />
      </div>

      {/* LAYER 1: THE UI */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        <div className="pointer-events-auto">
          {/*
            Auth state is passed to TopBar.
            You'll need to update TopBar.tsx to use these props
            to show the Login/Logout buttons and user email.
          */}
          <TopBar user={user} isLoading={isLoading} />
          <FilterBar />

          {/* Onboarding Banner from 'AuthBack' */}
          {user && needsOnboarding && (
            <div className="px-4 pt-2"> {/* Wrapper for positioning */}
              <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 flex items-center justify-between">
                <span>Finish setting up your profile to personalize your experience.</span>
                <a
                  href="/onboarding"
                  className="ml-4 rounded bg-amber-600 px-3 py-1 text-white text-sm hover:bg-amber-500"
                >
                  Complete Onboarding
                </a>
              </div>
            </div>
          )}
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
    </main>
  );
}