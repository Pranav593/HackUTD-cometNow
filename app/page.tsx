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
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";

export default function Home() {
  // --- All app state now lives here ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isListViewOpen, setIsListViewOpen] = useState(false);

  // New state for new filters
  const [activeFilter, setActiveFilter] = useState<MainFilter>("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [displayEvents, setDisplayEvents] = useState<EventData[]>([]);
  const { user } = useAuth();

  // Fetch events ONCE when the page loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const events = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          // Normalize coordinates: ensure we always have a tuple.
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
          } as EventData;
        });
        setAllEvents(events);
      } catch (err) {
        console.error("Error fetching events:", err)
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filterEvents = async () => {
      let filtered = allEvents;

      // Past events filter
      if (activeFilter === 'Past') {
        const now = new Date();
        // Assuming endTime is a string that can be parsed into a Date
        filtered = filtered.filter(event => {
          const endDate = new Date(event.date + 'T' + event.endTime);
          return endDate < now;
        });
      } else {
        const now = new Date();
        // Filter out past events unless the 'Past' filter is active
        filtered = filtered.filter(event => {
          const endDate = new Date(event.date + 'T' + event.endTime);
          return endDate >= now;
        });
      }

      // Category filter
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(event => selectedCategories.includes(event.category));
      }

      // Going filter
      if (activeFilter === 'Going' && user) {
        const goingQuery = query(collection(db, "going"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(goingQuery);
        const eventIds = querySnapshot.docs.map(doc => doc.data().eventId);
        
        filtered = filtered.filter(event => eventIds.includes(event.id) || event.creatorId === user.uid);
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
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userProfile: {
                  major: userProfile.major || '',
                  year: userProfile.year || '',
                  interests: userProfile.interests || []
                }, 
                events: allEvents 
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data.recommendedEventIds)) {
                filtered = allEvents.filter(event => data.recommendedEventIds.includes(event.id));
              } else {
                console.error('Invalid recommendations format');
                filtered = allEvents; // Fall back to showing all events
              }
            } else {
              const error = await response.json();
              console.error('Failed to fetch recommendations:', error.message);
              filtered = allEvents; // Fall back to showing all events
            }
          } catch (error) {
            console.error('Error calling recommendations API:', error);
            filtered = allEvents; // Fall back to showing all events
          }
        } else {
          // Handle case where user profile doesn't exist
          filtered = [];
        }
      }

      setDisplayEvents(filtered);
    };

    filterEvents();
  }, [allEvents, activeFilter, selectedCategories, user]);


  // --- Handlers for the FilterBar ---
  const handleFilterChange = (filter: MainFilter) => {
    setActiveFilter(filter);
    setIsListViewOpen(false); 
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setActiveFilter("All"); 
    setIsListViewOpen(false);
  };

  const handleListViewClick = () => {
    setIsListViewOpen(true);
  };

  // --- THIS IS THE NEW HANDLER THAT FIXES THE BUG ---
  // This function is passed to the List View
  const handleEventFromListClick = (event: EventData) => {
    setIsListViewOpen(false); // Close the list
    setSelectedEvent(event); // Open the detail sheet
  };
  // --------------------------------------------------

  // This variable controls the blur
  const isModalOpen = isFormOpen || isListViewOpen || selectedEvent != null;

  return (
    <main className="relative h-screen overflow-hidden">
      
      {/* --- This is your dev's Blur Wrapper --- */}
      <div
        className={`relative h-full w-full transition-all duration-300
          ${isModalOpen ? "blur-sm" : ""}
        `}
      >
        {/* LAYER 0: THE MAP */}
        <div className="absolute inset-0 z-0">
          <ClientMap
            onPinClick={setSelectedEvent}
            events={displayEvents}
            activeFilter={activeFilter}
            selectedCategories={selectedCategories}
          />
        </div>

        {/* LAYER 1: THE UI */}
        <div className="relative z-10 h-full w-full pointer-events-none">
          <div className="pointer-events-auto">
            <TopBar />
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              onListViewClick={handleListViewClick}
            />
          </div>

          <div className="pointer-events-auto">
            <DropPinButton onClick={() => setIsFormOpen(true)} />
            <BottomNav />
          </div>
        </div>
        
      </div>
      {/* END OF BLURRED CONTENT WRAPPER */}


      {/* LAYER 2: THE MODALS (Remain outside the blur wrapper) */}
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
        events={displayEvents}
        onEventClick={handleEventFromListClick} // <-- THIS IS THE FIX
      />
    </main>
  );
}