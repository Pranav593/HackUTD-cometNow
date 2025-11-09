"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { EventData } from "./EventListItem";

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
}

interface EventWithDescription extends EventData {
  description?: string;
}

interface EventDetailSheetProps {
  event: EventWithDescription | null;
  onClose: () => void;
}

// --- EMOJI MAPPING  ---
const getCategoryEmoji = (category: string) => {
  switch (category) {
    case "Food": return "🍔";
    case "Social": return "🥳";
    case "Study": return "🧠";
    case "Academic": return "📚";
    case "Career": return "💼";
    case "Recreation": return "⚽";
    default: return "🌟";
  }
};

// --- EMOJI ICON COMPONENT ---
const EventIcon = ({ category }: { category: string }) => {
  const emoji = getCategoryEmoji(category);
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 border border-orange-200">
      <span className="text-3xl">{emoji}</span>
    </div>
  );
};

// --- TIME UTILITIES ---
const formatHhMm = (time: string) => {
  // Converts "HH:MM" 24h to 12h display
  const [h, m] = time.split(":");
  const hour = parseInt(h || "0", 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m?.padStart(2, "0") ?? "00"} ${ampm}`;
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to format remaining time
const formatRemainingTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (totalSeconds <= 0) return "Event Ended";

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
}


export default function EventDetailSheet({
  event,
  onClose,
}: EventDetailSheetProps) {
  const [goingCount, setGoingCount] = useState(event?.going || 0);
  const [isGoing, setIsGoing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  const [timeRemaining, setTimeRemaining] = useState("Calculating..."); // New state for timer
  
  const { user } = useAuth();
  const eventId = event?.id;

  // Effect to check if user is going and set initial count
  useEffect(() => {
    if (!event || !user) return;
    const goingRef = doc(db, "going", `${user.uid}_${event.id}`);
    getDoc(goingRef).then((docSnap) => {
      setIsGoing(docSnap.exists());
    });
    setGoingCount(event.going || 0);
  }, [event, user]);

  // Effect to manage time remaining timer
  useEffect(() => {
    if (!event) return;

    const calculateTime = () => {
        const endTime = (event.endAtUtc
          ? new Date(event.endAtUtc)
          : new Date(`${event.date}T${event.endTime}`)
        ).getTime();
        const now = new Date().getTime();
        const diff = endTime - now;
        setTimeRemaining(formatRemainingTime(diff));
    };

    calculateTime(); // Initial calculation
    const timer = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(timer);
  }, [event]);


  // Effect to listen for live chat messages
  useEffect(() => {
    if (!event || !isChatOpen) return;

    const q = query(
      collection(db, "messages"),
      where("eventId", "==", event.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userName: doc.data().userName,
        text: doc.data().text,
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [event, isChatOpen]);


  if (!event) return null;

  const handleGoingClick = async () => {
    if (!user || !event) return;

    const eventRef = doc(db, "events", event.id);
    const goingRef = doc(db, "going", `${user.uid}_${event.id}`);

    if (isGoing) {
      // User is already going, so remove them
      await deleteDoc(goingRef);
      await updateDoc(eventRef, {
        going: increment(-1),
      });
      setGoingCount(goingCount - 1);
      setIsGoing(false);
    } else {
      // User is not going, so add them
      await setDoc(goingRef, {
        userId: user.uid,
        eventId: event.id,
      });
      await updateDoc(eventRef, {
        going: increment(1),
      });
      setGoingCount(goingCount + 1);
      setIsGoing(true);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !user || !event) return;

    await addDoc(collection(db, "messages"), {
      eventId: event.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      text: chatMessage,
      timestamp: serverTimestamp(),
    });

    setChatMessage("");
  };

  const handleClose = () => {
    onClose();
    // Reset state after the transition completes
    setTimeout(() => {
      setIsGoing(false);
      setGoingCount(0);
      setIsChatOpen(false);
      setChatMessage("");
      setIsReportModalOpen(false); 
      setMessages([]);
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
        {/* Header: Logo + Close Button */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
          <Image src="/hacklogo.png" alt="Logo" width={32} height={32} className="object-contain" /> 
            <span className="text-sm font-semibold text-gray-800">CometNow</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Event Header */}
          <div className="flex items-center gap-4">
            <EventIcon category={event.category} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>
          </div>
          
          {/* Details Bar */}
          <div className="mt-4 grid grid-cols-3 rounded-lg bg-gray-50 p-4 divide-x divide-gray-200">
            <div className="text-center">
              <span className="text-xs text-gray-500">Location</span>
              <p className="font-semibold text-gray-800 text-sm">
                {event.location}
              </p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Time</span>
              <p className="font-semibold text-gray-800 text-sm">
                {event.startAtUtc
                  ? new Date(event.startAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : formatHhMm(event.startTime)}
                {" "}-{" "}
                {event.endAtUtc
                  ? new Date(event.endAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : formatHhMm(event.endTime)}
              </p>
            </div>
            <div className="text-center">
                <span className="text-xs text-gray-500">Ends In</span>
                <p className={`font-semibold text-sm ${timeRemaining === "Event Ended" ? "text-red-600" : "text-gray-800"}`}>
                    {timeRemaining}
                </p>
            </div>
          </div>

          {/* AI Vibe Summary  */}
          <div className="mt-6 rounded-lg border border-orange-300 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">AI Vibe Summary</h3>
            </div>
            <p className="mt-2 text-sm text-orange-700">
                Vibe: 🔥 Going fast! They just brought out more cheese.
            </p>
          </div>
          
          {/* Description (Added) */}
          {event.description && (
             <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Details</h3>
                <p className="text-gray-600 text-sm">{event.description}</p>
             </div>
          )}


          {/* Action Buttons  */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <UsersIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{goingCount} going</span>
            </div>
            <button
              onClick={handleGoingClick}
              disabled={timeRemaining === "Event Ended"} // Disable if event ended
              className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white transition-colors
                ${
                  isGoing
                    ? "flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    : timeRemaining === "Event Ended"
                        ? "bg-gray-400 cursor-not-allowed" // Gray out if ended
                        : "bg-orange-600 hover:bg-orange-700"
                }`}
            >
              {timeRemaining === "Event Ended" ? (
                  "Event Ended"
              ) : isGoing ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  You're Coming!
                </>
              ) : (
                "I'm Coming!"
              )}
            </button>
          </div>

          {/* Live Chat */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Live Chat</h3>
            </div>
             {!isChatOpen ? (
              <>
                <div className="mt-3 text-sm text-gray-600">
                  {messages.length > 0 ? (
                    messages.slice(-2).map((msg) => (
                      <p key={msg.id}><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                    ))
                  ) : (
                    <p className="italic text-gray-500">No messages yet. Be the first!</p>
                  )}
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
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <p key={msg.id} className="text-sm text-gray-600"><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                    ))
                  ) : (
                    <p className="italic text-gray-500 text-center py-4">Start the conversation!</p>
                  )}
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
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="rounded-lg bg-orange-600 p-2 text-white disabled:bg-gray-400"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </div>
          
          {/* Report Pin Link */}
          <div className="mt-6 text-center pb-8">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-sm text-gray-500 hover:text-red-600 hover:underline"
            >
              Report Pin
            </button>
          </div>
        </div>
      </div>

      {/* Render the Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}