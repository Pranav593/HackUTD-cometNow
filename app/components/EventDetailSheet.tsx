// app/components/EventDetailSheet.tsx
"use client";

// --- 1. IMPORT useState and new components ---
import { useState } from "react";
import {
  XMarkIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import ReportModal from "./ReportModal"; 

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
  event: EventData | null;
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
  // --- 2. ADD STATE FOR INTERACTIVITY ---
  const [goingCount, setGoingCount] = useState(5);
  const [isGoing, setIsGoing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 

  if (!event) return null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGoingClick = () => {
    if (!isGoing) {
      setIsGoing(true);
      setGoingCount(goingCount + 1);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    console.log("New chat message:", chatMessage);
    setChatMessage("");
  };

  // Reset all local state when the modal closes
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsGoing(false);
      setGoingCount(5);
      setIsChatOpen(false);
      setChatMessage("");
      setIsReportModalOpen(false); 
    }, 300);
  };

  return (
    // Main modal wrapper
    <div
      className={`
        absolute inset-0 z-20 transform transition-transform duration-300 ease-in-out
        ${event ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col rounded-t-2xl bg-white p-6 shadow-xl"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-orange-600"></div>
            <span className="text-lg font-semibold text-gray-800">CometNow</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-6">
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

          {/* AI Vibe Summary  */}
          <div className="mt-6 rounded-lg border border-orange-300 bg-orange-50 p-4">
          </div>

          {/*  3. UPDATED Action Buttons  */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <UsersIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{goingCount} going</span>
            </div>
            <button
              onClick={handleGoingClick}
              disabled={isGoing}
              className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white transition-colors
                ${
                  isGoing
                    ? "flex items-center justify-center gap-2 bg-green-600"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
            >
              {isGoing ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  You're Coming!
                </>
              ) : (
                "I'm Coming!"
              )}
            </button>
          </div>

          {/*  Live Chat ()  */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
             {!isChatOpen ? (
              <>
                <div className="mt-3 text-sm text-gray-600">
                  <p><span className="font-semibold">Uwer123:</span> Is any veggie left????</p>
                  <p><span className="font-semibold">Temoc:</span> but going fast!</p>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Join Live Chat
                </button>
              </>
            ) : (
              <>
                <div className="mt-4 h-32 overflow-y-auto rounded-lg border bg-white p-2">
                  <p className="text-sm text-gray-600"><span className="font-semibold">Uwer123:</span> Is any veggie left????</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Temoc:</span> but going fast!</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">User88:</span> on my way!</p>
                </div>
                <form
                  onSubmit={handleChatSubmit}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-600 p-2 text-white"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </div>
          
          {/*  4. Report Pin Link  */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsReportModalOpen(true)} // <-- Opens the new modal
              className="text-sm text-gray-500 hover:text-red-600 hover:underline"
            >
              Report Pin
            </button>
          </div>
        </div>
      </div>

      {/*  5. RENDER THE REPORT MODAL  */}
\      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}