"use client";

import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

// EventData type definition 
export type EventCategory =
  | "Social"
  | "Food"
  | "Study"
  | "Academic"
  | "Career"
  | "Recreation"
  | "Other"
  | string;

// Unified EventData interface – coordinates are required everywhere we use an event.
// If some legacy documents are missing coordinates, callers should normalize them when loading.
export interface EventData {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:MM 24h
  endTime: string;       // HH:MM 24h
  coordinates: [number, number];
  going?: number;
  creatorId?: string;
}


interface EventListItemProps {
  event: EventData;
  onClick: () => void; 
}

// getTimeStatus helper 
const getTimeStatus = (date: string, startTime: string, endTime: string) => {
  const now = new Date();
  const eventStart = new Date(`${date}T${startTime}`);
  const eventEnd = new Date(`${date}T${endTime}`);

  if (eventEnd < now) {
    return { text: "Event Ended", color: "text-gray-500" };
  }
  const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursDiff <= 1) { // 1 hour threshold for "Now"
    return { text: "Happening Now", color: "text-green-600" };
  } else if (hoursDiff <= 3) {
    return { text: `Starts in ${Math.round(hoursDiff)}h`, color: "text-orange-600" };
  } else {
    return { text: `Starts in ${Math.round(hoursDiff)}h`, color: "text-red-600" };
  }
};

export default function EventListItem({ event, onClick }: EventListItemProps) {
  const timeStatus = getTimeStatus(event.date, event.startTime, event.endTime);
  const formatTime = (time: string) => {
    // time is already in HH:MM format, just need to convert to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
   
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-white p-4 text-left shadow-md transition-transform hover:scale-[1.02]"
    >
      <div className="flex justify-between">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {event.category}
        </span>
        <span className={`text-sm font-bold ${timeStatus.color}`}>
          {timeStatus.text}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-gray-900">{event.title}</h3>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <MapPinIcon className="h-4 w-4" />
        <span>{event.location}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
        <ClockIcon className="h-4 w-4" />
        <span>
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-gray-700">
        {event.going || 0} people are going
      </p>
    </button>
  );
}