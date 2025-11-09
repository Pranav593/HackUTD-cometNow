"use client";

import { useState, useEffect } from "react";
import ClientMap from "@/app/components/ClientMap";
import TopBar from "@/app/components/TopBar";
import FilterBar, { MainFilter } from "@/app/components/FilterBar"; 
import BottomNav from "@/app/components/BottomNav";
import DropPinButton from "@/app/components/DropPinButton";
import DropPinForm from "@/app/components/DropPinForm";
import EventDetailSheet from "@/app/components/EventDetailSheet";
import EventListView from "@/app/components/EventListView"; 
import { EventData } from "@/app/components/EventListItem"; 
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";

// MainFilter type is "All" | "Recommended" | "Past"
export default function Home() {
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isListViewOpen, setIsListViewOpen] = useState(false); 

  const [activeFilter, setActiveFilter] = useState<MainFilter>("All");
  // Removed: const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [displayEvents, setDisplayEvents] = useState<EventData[]>([]);
  const { user } = useAuth();

  // --- 1. Event Fetching ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const events = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          let coordinates: [number, number] = [0, 0];
          if (Array.isArray(data.coordinates) && data.coordinates.length === 2) {
            const [lat, lng] = data.coordinates;
            if (typeof lat === 'number' && typeof lng === 'number') {
              coordinates = [lat, lng];
            }
          }
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            category: data.category || 'Other',
            location: data.location || 'Unknown',
            date: data.date || '',
            startTime: data.startTime || '00:00',
            endTime: data.endTime || '00:00',
            coordinates,
            going: data.going || 0,
            creatorId: data.creatorId,
            startAtUtc: data.startAtUtc,
            endAtUtc: data.endAtUtc,
            expired: data.expired || false,
          } as EventData;
        });
        setAllEvents(events);
      } catch (err) {
        console.error("Error fetching events:", err)
      }
    };

    fetchEvents();
  }, []);

  // --- 2. Filtering Logic ---
  useEffect(() => {
    const filterEvents = async () => {
      let filtered = allEvents;
      const now = Date.now();

      // --- Past / Active filtering ---
      if (activeFilter === 'Past') {
        // Show only past events
        filtered = allEvents.filter(event => 
            event.endAtUtc && Date.parse(event.endAtUtc) < now
        );
      } else {
        // Exclude past events for All/Recommended views
        filtered = filtered.filter(event => 
            !(event.endAtUtc && Date.parse(event.endAtUtc) < now)
        );
      }
      
      // Recommended filter
      if (activeFilter === 'Recommended' && user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
         if (userSnap.exists()) {
             const userProfile = userSnap.data();
             try {
                const response = await fetch('/api/recommend', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    userProfile: { major: userProfile.major || '', year: userProfile.year || '', interests: userProfile.interests || [] }, 
                    events: allEvents
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  if (Array.isArray(data.recommendedEventIds)) {
                    filtered = filtered.filter(event => data.recommendedEventIds.includes(event.id));
                  } else {
                    console.error('Invalid recommendations format');
                  }
                } else {
                  const error = await response.json();
                  console.error('Failed to fetch recommendations:', error.message);
                }
             } catch (error) {
               console.error('Error calling recommendations API:', error);
             }
         }
      }

      // Removed: Logic for APPLY CATEGORY FILTER
      // With the category filter removed, no further filtering is needed here for 'All' view.

      setDisplayEvents(filtered);
    };

    filterEvents();
  }, [allEvents, activeFilter, user]); // Removed selectedCategories from dependency array

  // --- 3. Background Expiration Check ---
  useEffect(() => {
    const interval = setInterval(async () => {
      const nowMs = Date.now();
      let changed = false;
      const updated = await Promise.all(allEvents.map(async ev => {
        if (ev.endAtUtc && !ev.expired && Date.parse(ev.endAtUtc) < nowMs) {
          const newEv = { ...ev, expired: true };
          changed = true;
          try { if (ev.id) await updateDoc(doc(db, 'events', ev.id), { expired: true }); } catch {}
          return newEv;
        }
        return ev;
      }));
      if (changed) {
        setAllEvents(updated);
      }
    }, 60_000); // every minute
    return () => clearInterval(interval);
  }, [allEvents]);


  // --- 4. Handlers ---
  const handleFilterChange = (filter: MainFilter) => {
    setActiveFilter(filter);
    // Removed: setSelectedCategories([]);
    setIsListViewOpen(false); 
  };

  // Removed: const handleCategoryChange = (categories: string[]) => { ... }

  const handleListViewClick = () => {
    setIsListViewOpen(true);
  };

  const handleEventFromListClick = (event: EventData) => {
    setIsListViewOpen(false);
    setSelectedEvent(event);
  };
  // --------------------------------------------------

  const isModalOpen = isFormOpen || isListViewOpen || selectedEvent != null;

  return (
    // Main container uses flex-col for correct vertical stacking
    <main className="relative h-screen flex flex-col overflow-hidden">
      
      {/* 1. Top Bar */}
      <TopBar />

      {/* 2. Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        // Removed props: selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange}
        onListViewClick={handleListViewClick} 
      />
      
      {/* 3. MAP AREA - flex-1 ensures it fills the space */}
      <div 
        className={`relative flex-1 transition-all duration-300 ${isModalOpen ? "blur-sm" : ""}`}
      >
        {/* LAYER 0: THE MAP */}
        <div className="absolute inset-0 z-0">
          <ClientMap
            onPinClick={setSelectedEvent}
            events={displayEvents}
            activeFilter={activeFilter}
            selectedCategory={"All"} // Now hardcoded to "All" as category filter is gone
          />
        </div>

        {/* Floating elements over map */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Drop Pin Button */}
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <DropPinButton onClick={() => setIsFormOpen(true)} />
          </div>
        </div>
      </div>
      
      {/* 4. Bottom Nav */}
      <BottomNav />


      {/* MODALS (Outside the main flow) */}
      <DropPinForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(evt) => {
          setAllEvents((prev) => [evt, ...prev]);
        }}
      />
      <EventDetailSheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <EventListView
        isOpen={isListViewOpen}
        onClose={() => setIsListViewOpen(false)}
        events={displayEvents}
        onEventClick={handleEventFromListClick}
      />
    </main>
  );
}