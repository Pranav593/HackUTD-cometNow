"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";
import { EventData } from "./EventListItem"; // Import EventData

interface EventPinProps {
  event: EventData;
  onPinClick: (event: EventData) => void;
}

// Icon path (unchanged)
const ICONS = {
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
};


const getPinStyle = (startTime: string, endTime: string) => {
  const now = new Date();
  const eventStart = new Date(startTime);
  const eventEnd = new Date(endTime);
  
  const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="currentColor"><path d="${ICONS.bolt}" /></svg>`;
  
  // 1. Check for "Past" first. 
  if (eventEnd < now) {
    return { bgColor: "bg-orange-600", iconHtml }; // "Past" is Orange
  }

  // If it's not past, check for future events
  const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff <= 1) { // 1 hour threshold for "Now"
    return { bgColor: "bg-green-600", iconHtml }; // "Now" is Green
  } else if (hoursDiff <= 3) {
    return { bgColor: "bg-orange-500", iconHtml }; // "Soon" is light Orange
  } else {
    return { bgColor: "bg-red-500", iconHtml }; // "Later" is Red
  }
};

export default function EventPin({ event, onPinClick }: EventPinProps) {
  
  const { bgColor, iconHtml } = getPinStyle(event.startTime, event.endTime);

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
      eventHandlers={{
        click: () => {
          onPinClick(event);
        },
      }}
    />
  );
}