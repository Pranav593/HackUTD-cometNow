// app/components/EventDetailSheet.tsx
"use client";

import {
  XMarkIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid"; 

// Define the shape of your event data
interface EventData {
  title: string;
  category: "Food" | "Social" | "Study" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

interface EventDetailSheetProps {
  event: EventData | null; // It can be null when closed
  onClose: () => void;
}

// Placeholder for Burger icon
const BurgerIcon = () => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
    <span className="text-3xl">🍔</span>
  </div>
);

export default function EventDetailSheet({
  event,
  onClose,
}: EventDetailSheetProps) {
  if (!event) return null; // If no event is selected, render nothing

  // A little helper to format the time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    // Main modal wrapper
    <div
      className={`
        absolute inset-0 z-20 transform transition-transform duration-300 ease-in-out
        ${event ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* The white form "sheet" */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col rounded-t-2xl bg-white p-6 shadow-xl"
        style={{ pointerEvents: "auto" }}
      >
        {/* Header: Logo + Close Button */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-orange-600"></div>
            <span className="text-lg font-semibold text-gray-800">CometNow</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* Event Header */}
          <div className="flex items-center gap-4">
            <BurgerIcon />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                {event.category} Event
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="mt-4 flex justify-around rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-semibold text-gray-800">
                {event.locationName}
              </p>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">Ends In</span>
              <p className="font-semibold text-gray-800">45 min</p>
            </div>
          </div>

          {/* AI Vibe Summary */}
          <div className="mt-6 rounded-lg border border-orange-300 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">
                AI Vibe Summary
              </h3>
            </div>
            <p className="mt-2 text-sm text-orange-700">
              Vibe: 🔥 Going fast! They just brought out more cheese.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <UsersIcon className="h-5 w-5" />
              <span className="text-sm font-medium">5 going</span>
            </div>
            <button className="flex-1 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white">
              I'm Coming!
            </button>
            <button className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700">
              Still Happening?
            </button>
          </div>

          {/* Live Chat */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Live Chat</h3>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Uwer123:</span> Is any veggie
                left????
              </p>
              <p>
                <span className="font-semibold">Temoc:</span> but going fast!
              </p>
            </div>
            <button className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white">
              Join Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}