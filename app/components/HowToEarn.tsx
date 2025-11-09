"use client";

import { HandRaisedIcon, MapPinIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function HowToEarn() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-3 text-xl font-bold text-gray-800">
        Quick Start: Earn Points
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <HandRaisedIcon className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold text-gray-800">Post an Event (+50 Points)</p>
            <p className="text-sm text-gray-600">
              Use the "Drop a Pin" button to alert Comets to anything fun or useful happening now.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPinIcon className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold text-gray-800">Verify a Pin (+10 Points)</p>
            <p className="text-sm text-gray-600">
              Confirm that a community-posted event is still happening.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ChatBubbleLeftRightIcon className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold text-gray-800">Live Chat (+5 Points)</p>
            <p className="text-sm text-gray-600">
              Provide valuable information in the Live Chat section of an event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}