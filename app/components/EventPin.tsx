// app/components/EventPin.tsx
"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";

// Define the shape of your event data
interface EventData {
  title: string;
  category: "Social" | "Food" | "Study" | "Academic"| "Career"|" Recreation" | "Other" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

// --- NEW PROPS ---
// We need the onPinClick function to be passed in
interface EventPinProps {
  event: EventData;
  onPinClick: (event: EventData) => void;
}

// --- ICON ---
const ICONS = {
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
};

// --- TIME-BASED STYLE LOGIC ---
const getPinStyle = (startTime: string) => {
  const now = new Date();
  const eventStart = new Date(startTime);
  const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  let bgColor = "bg-gray-500";
  const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="currentColor"><path d="${ICONS.bolt}" /></svg>`;

  if (hoursDiff <= 0) {
    bgColor = "bg-green-600"; // Happening Now
  } else if (hoursDiff <= 3) {
    bgColor = "bg-orange-500"; // Soon
  } else {
    bgColor = "bg-red-500"; // Later
  }

  return { bgColor, iconHtml };
};

export default function EventPin({ event, onPinClick }: EventPinProps) {
  const { bgColor, iconHtml } = getPinStyle(event.startTime);

  const customIcon = L.divIcon({
    className: "custom-pin",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-3 w-3 ${bgColor} transform rotate-45 -bottom-1"></div>
        <div class="relative flex h-7 w-7 items-center justify-center rounded-full ${bgColor} border-2 border-white shadow-md">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

  return (
    <Marker
      position={event.coordinates}
      icon={customIcon}
      // --- THIS IS THE FIX ---
      // This tells the marker to call your function when clicked
      eventHandlers={{
        click: () => {
          onPinClick(event);
        },
      }}
    >
    </Marker>
  );
}