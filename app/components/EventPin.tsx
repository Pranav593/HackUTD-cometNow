/**
 * EventPin
 * Leaflet marker for an event. Pin color indicates timing:
 * - green: ongoing or starting within 1 hour
 * - gray: future (>1 hour)
 * - orange: past
 */
"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { EventData } from "./EventListItem";

interface EventPinProps {
  event: EventData;
  onPinClick: (event: EventData) => void;
}

const ICONS = {
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
};


const getPinStyle = (event: EventData) => {
  const now = new Date();
  const eventStart = event.startAtUtc
    ? new Date(event.startAtUtc)
    : new Date(`${event.date}T${event.startTime}`);
  const eventEnd = event.endAtUtc
    ? new Date(event.endAtUtc)
    : new Date(`${event.date}T${event.endTime}`);
  
  const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="currentColor"><path d="${ICONS.bolt}" /></svg>`;
  
  if (eventEnd < now) {
    return { bgColor: "bg-orange-600", iconHtml };
  }
  const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursDiff <= 1) {
    return { bgColor: "bg-green-600", iconHtml };
  }
  return { bgColor: "bg-gray-400", iconHtml };
};

export default function EventPin({ event, onPinClick }: EventPinProps) {
  if (!event.coordinates || event.coordinates[0] === 0) {
    try { console.warn('[EventPin] Skipping pin due to missing/zero coordinates', event.title, event.coordinates); } catch {}
    return null;
  }

  const { bgColor, iconHtml } = getPinStyle(event);

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
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <span className="text-xs font-semibold">{event.title}</span>
      </Tooltip>
    </Marker>
  );
}