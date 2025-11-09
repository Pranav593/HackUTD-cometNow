"use client";

import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ReportModal from "./ReportModal";
import { EventData } from "./EventListItem"; 
import { useRewards } from "@/lib/rewardsContext"; // Retained

// Use EventData from EventListItem to avoid type conflicts

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
}

interface EventDetailSheetProps {
  event: EventData | null;
  onClose: () => void;
}

// --- UTILITIES (Kept the same) ---
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

const EventIcon = ({ category }: { category: string }) => {
  const emoji = getCategoryEmoji(category);
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 border border-orange-200">
      <span className="text-3xl">{emoji}</span>
    </div>
  );
};

// --- TIME UTILITIES (Kept the same) ---
const formatHhMm = (time: string) => {
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const formatRemainingTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds <= 0) return "Event Ended";
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};
// --- END UTILITIES ---


export default function EventDetailSheet({
  event,
  onClose,
}: EventDetailSheetProps) {
  
  // Ref now points to the inner chat message area for scrolling
  const chatMessagesRef = useRef<HTMLDivElement>(null); 
  const { user } = useAuth();
  const { awardChatPoints } = useRewards();
  
  const [goingCount, setGoingCount] = useState(event?.going || 0);
  const [isGoing, setIsGoing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  const [timeRemaining, setTimeRemaining] = useState("Calculating...");

  // --- ATTENDANCE CHECK EFFECT (Unchanged) ---
  useEffect(() => {
    if (!event || !user) return;
    const goingRef = doc(db, "going", `${user.uid}_${event.id}`);
    getDoc(goingRef).then((docSnap) => {
      if (docSnap.exists()) {
        setIsGoing(true);
      } else {
        setIsGoing(false);
      }
    });
    setGoingCount(event.going || 0);
  }, [event, user]);

  // --- LIVE CHAT LISTENER EFFECT (Unchanged) ---
  useEffect(() => {
    if (!event || !event.id) {
        setMessages([]);
        return;
    }

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
  }, [event?.id]);

  // Auto-scroll on new message, targeting the inner chat messages area
  useEffect(() => {
    if (isChatOpen) {
      chatMessagesRef.current?.scrollTo({ 
          top: chatMessagesRef.current.scrollHeight, 
          behavior: 'smooth' 
      });
    }
  }, [messages, isChatOpen]);
  
  // Timer for Ends In (Unchanged)
  useEffect(() => {
    if (!event) return;
    const calculateTime = () => {
      const endMs = (event.endAtUtc
        ? new Date(event.endAtUtc)
        : new Date(`${event.date}T${event.endTime}`)
      ).getTime();
      const diff = endMs - Date.now();
      setTimeRemaining(formatRemainingTime(diff));
    };
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [event]);


  if (!event) return null;

  // --- ATTENDANCE INCREMENT/DECREMENT LOGIC (Unchanged) ---
  const handleGoingClick = async () => {
    if (!user || !event) {
        console.error("User not authenticated or event data missing.");
        return;
    }

    const eventRef = doc(db, "events", event.id);
    const goingRef = doc(db, "going", `${user.uid}_${event.id}`);

    try {
      if (isGoing) {
        await deleteDoc(goingRef);
        await updateDoc(eventRef, { going: increment(-1) });
        setGoingCount(prev => prev - 1);
        setIsGoing(false);
      } else {
        await setDoc(goingRef, { userId: user.uid, eventId: event.id });
        await updateDoc(eventRef, { going: increment(1) });
        setGoingCount(prev => prev + 1);
        setIsGoing(true);
      }
    } catch (error) {
        console.error("Attendance update failed:", error);
    }
  };
  // --- END ATTENDANCE LOGIC ---


  // --- CHAT SUBMISSION LOGIC (Retained rewards logic) ---
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

    // Attempt to award chat points (10 pts every 10 minutes)
    try {
      const { awarded, nextEligibleAt } = awardChatPoints();
      if (awarded) {
        console.log('[Rewards] Chat points awarded (+10). Next at:', new Date(nextEligibleAt).toLocaleTimeString());
      } else {
        console.log('[Rewards] Chat points cooldown active. Next eligible at:', new Date(nextEligibleAt).toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[Rewards] Failed to award chat points', err);
    }
  };
  // --- END CHAT SUBMISSION LOGIC ---


  const handleClose = () => {
    onClose();
    setTimeout(() => {
      // Reset local state when modal closes
      setIsGoing(false);
      setGoingCount(0);
      setIsChatOpen(false);
      setChatMessage("");
      setMessages([]); 
      setIsReportModalOpen(false); 
    }, 300);
  };
  
  const isMainContentScrollable = !isChatOpen;

  return (
    // Main modal wrapper (JSX layout starts here)
    <div
      className={`
        fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out
        ${event ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div
        // Use flex-col and justify-between for sheet structure
        className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl"
        style={{ pointerEvents: "auto" }}
      >
        
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          {/* Logo */}
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
        
        {/* Scrollable Content/Chat Area */}
        <div 
          className={`flex-1 ${isMainContentScrollable ? 'overflow-y-auto' : 'overflow-hidden'} ${isChatOpen ? 'flex flex-col' : ''}`}
        >
          
          {/* Main Event Details (Non-Chat) - Hidden when Chat is Fullscreen */}
          <div className={`p-6 ${isChatOpen ? 'hidden' : 'block'}`}>
            {/* Event Header */}
            <div className="flex items-center gap-4">
              <EventIcon category={event.category} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                  {capitalize(event.category)}
                </span>
              </div>
            </div>
            
            {/* Location & Ends In (Using previous optimized layout) */}
            <div className="mt-4 flex justify-between rounded-lg bg-gray-50 p-4">
              {/* Location Block */}
              <div className="flex flex-col text-center flex-1 pr-2"> 
                  <span className="text-sm text-gray-500">Location</span>
                  <p className="font-semibold text-gray-800 whitespace-normal">
                      {event.location}
                  </p>
              </div>

              {/* Vertical Separator */}
              <div className="border-r border-gray-200 mx-2"></div> 

              {/* Ends In Block */}
              <div className="flex flex-col text-center flex-none pl-2">
                  <span className="text-sm text-gray-500">Ends In</span>
                  <p className="font-semibold text-gray-800">{timeRemaining}</p>
              </div>
            </div>


            {/* AI Vibe Summary */}
            <div className="mt-6 rounded-lg border border-orange-300 bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">AI Vibe Summary</h3>
              </div>
              <p className="mt-2 text-sm text-orange-700">
                  Vibe: 🔥 Going fast! They just brought out more cheese.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <UsersIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{goingCount} going</span>
              </div>
              <button
                onClick={handleGoingClick}
                disabled={isGoing || !user}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white transition-colors
                  ${
                    isGoing
                      ? "flex items-center justify-center gap-2 bg-green-600"
                      : "bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
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
          </div> 
          
          {/* Live Chat Section */}
          <div className={`p-6 ${isChatOpen ? 'flex flex-col flex-1 pt-0' : 'block'}`}>
            <div className={`rounded-lg bg-gray-50 p-4 ${isChatOpen ? 'flex flex-col flex-1' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">Live Chat</h3>
                </div>
                {/* Back button for full chat view */}
                {isChatOpen && (
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
                  >
                    Close Chat
                  </button>
                )}
              </div>
              
                {!isChatOpen ? (
                <>
                  {/* Chat Preview */}
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    {messages.length === 0 && <p className="italic">Start the conversation!</p>}
                      {messages.slice(-2).map((msg) => (
                      <p key={msg.id}><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Join Live Chat ({messages.length})
                  </button>
                </>
              ) : (
                <>
                  {/* Full Chat View - Uses flex-1 and overflow-y-auto to fill available space */}
                  <div 
                    ref={chatMessagesRef} 
                    className="mt-4 flex-1 overflow-y-auto rounded-lg border bg-white p-2 space-y-1 min-h-32"
                  >
                      {messages.length === 0 && <p className="text-center italic text-gray-400 py-4">No messages yet. Start the chat!</p>}
                    {messages.map((msg) => (
                      <p key={msg.id} className="text-sm text-gray-600 break-words"><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Report Pin Link - Remains in scrollable content unless chat is full screen */}
          <div className={`p-6 pt-0 text-center ${isChatOpen ? 'hidden' : 'block'}`}>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-sm text-gray-500 hover:text-red-600 hover:underline"
            >
              Report Pin
            </button>
          </div>
          
        </div> {/* End Scrollable Content/Chat Area */}
        
        {/* Chat Input Footer - Fixed at bottom when chat is open */}
        {isChatOpen && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={handleChatSubmit}
              className="flex gap-2"
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
                disabled={!user || chatMessage.trim() === ""} 
                className="rounded-lg bg-orange-600 p-2 text-white disabled:opacity-50 hover:bg-orange-700"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* RENDER THE REPORT MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}