// app/components/EventPin.tsx
"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
// We don't need to import the icons themselves anymore!

// Define the shape of your event data
interface EventData {
  title: string;
  category: "Food" | "Social" | "Study" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

interface EventPinProps {
  event: EventData;
}

// --- THIS IS THE SVG PATH DATA FOR HEROICONS (24x24) ---
const ICONS = {
  food: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  social: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.091-3.091c-.938-.03-1.844-.08-2.719-.153-1.135-.096-2.062-.903-2.062-2.008v-4.286c0-1.136.847-2.1 1.98-2.193.34-.027.68-.052 1.02-.072v-3.091l3.091 3.091c.938.03 1.844.08 2.719.153 1.135.096 2.062.903 2.062 2.008zM3.75 12.853c.03-.97.747-1.817 1.732-2.064v3.614c0 1.136.847 2.1 1.98 2.193.34.027.68.052 1.02.072v3.091l-3.091-3.091c-.938-.03-1.844-.08-2.719-.153-1.135-.096-2.062-.903-2.062-2.008v-4.286z',
  study: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z',
};
// ----------------------------------------------------

// Function to get the right color and icon HTML STRING
const getPinStyle = (category: string) => {
  let bgColor = "bg-gray-500";
  let iconPath = "?";

  switch (category) {
    case "Food":
      bgColor = "bg-red-500";
      iconPath = ICONS.food;
      break;
    case "Social":
      bgColor = "bg-blue-500";
      iconPath = ICONS.social;
      break;
    case "Study":
      bgColor = "bg-green-600";
      iconPath = ICONS.study;
      break;
  }

  // This builds the SVG string directly, which is much safer
  const iconHtml =
    iconPath === "?"
      ? '<div class="h-4 w-4 text-white">?</div>'
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="currentColor">
           <path d="${iconPath}" />
         </svg>`;

  return { bgColor, iconHtml };
};

export default function EventPin({ event }: EventPinProps) {
  const { bgColor, iconHtml } = getPinStyle(event.category);

  // This creates your custom HTML-based icon
  const customIcon = L.divIcon({
    className: "custom-pin", // This class is important for styling
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-3 w-3 ${bgColor} transform rotate-45 -bottom-1"></div>
        <div class="relative flex h-7 w-7 items-center justify-center rounded-full ${bgColor} border-2 border-white shadow-md">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [32, 40], // Size of the icon
    iconAnchor: [16, 40], // Point of the icon (bottom-center)
    popupAnchor: [0, -40], // Where the popup opens from
  });

  // A little helper to format the time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Marker position={event.coordinates} icon={customIcon}>
      {/* This is the popup when you click a pin */}
      <Popup>
        <div className="font-sans">
          <span
            className={`rounded-full px-2 py-0.5 text-xs text-white ${bgColor}`}
          >
            {event.category}
          </span>
          <h3 className="my-1 text-base font-bold text-gray-800">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600">{event.locationName}</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// We can DELETE the entire (L.Icon.Default.prototype) hack
// It is no longer needed!