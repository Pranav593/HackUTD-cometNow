/**
 * EventListView
 * Slide-up list of events. Highlights trending (happening within ~1 hour,
 * sorted by going) and groups upcoming events by category.
 */
"use client";

import { XMarkIcon, FireIcon, TagIcon } from "@heroicons/react/24/solid";
import EventListItem, { EventData } from "./EventListItem";
import { useMemo } from "react";

interface EventListViewProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventData[];
  onEventClick: (event: EventData) => void;
}

export default function EventListView({
  isOpen,
  onClose,
  events,
  onEventClick,
}: EventListViewProps) {
  
  const { trendingEvents, categorizedEvents } = useMemo(() => {
    
    if (!Array.isArray(events)) {
      return { trendingEvents: [], categorizedEvents: {} };
    }

    const now = new Date();
    
    const nowEvents = events.filter(event => {
      const eventStart = event.startAtUtc
        ? new Date(event.startAtUtc)
        : new Date(`${event.date}T${event.startTime}`);
      const eventEnd = event.endAtUtc
        ? new Date(event.endAtUtc)
        : new Date(`${event.date}T${event.endTime}`);
      const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 1 && eventEnd > now;
    });

    const trendingEvents = [...nowEvents].sort(
      (a, b) => (b.going ?? 0) - (a.going ?? 0)
    );

    const categorizedEvents = events.reduce((acc, event) => {
      const eventEnd = event.endAtUtc
        ? new Date(event.endAtUtc)
        : new Date(`${event.date}T${event.endTime}`);
      if (eventEnd < now) return acc;
      
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, EventData[]>);

    return { trendingEvents, categorizedEvents };
  }, [events]);

  return (
    <div
      className={`
        absolute inset-0 z-20 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col rounded-t-2xl bg-gray-100 shadow-xl"
        style={{ pointerEvents: "auto" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-4">
          <h2 className="text-2xl font-bold text-gray-800">All Events</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
              <FireIcon className="h-6 w-6 text-orange-600" />
              Trending Now
            </h3>
            <div className="flex flex-col gap-4">
              {trendingEvents.length > 0 ? (
                trendingEvents.map((event, i) => (
                  <EventListItem
                    key={`trending-${i}`}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-gray-500">
                  No events happening right now.
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
              <TagIcon className="h-6 w-6 text-gray-500" />
              Categories
            </h3>
            <div className="flex flex-col gap-6">
              {Object.entries(categorizedEvents).map(([category, events]) => (
                <div key={category}>
                  <h4 className="mb-3 text-lg font-semibold text-gray-700">
                    {category}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {events.map((event, i) => (
                      <EventListItem
                        key={`${category}-${i}`}
                        event={event}
                        onClick={() => onEventClick(event)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}