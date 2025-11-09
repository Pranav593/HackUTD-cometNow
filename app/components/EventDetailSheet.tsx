"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
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

interface EventData {
  [x: string]: ReactNode;
  id: any;
  title: string;
  category: "Food" | "Social" | "Study" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
  going?: number;
}

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
}

interface EventDetailSheetProps {
  event: EventData | null;
  onClose: () => void;
}

// --- UTILITIES ---
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
// --- END UTILITIES ---


export default function EventDetailSheet({
  event,
  onClose,
}: EventDetailSheetProps) {
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [goingCount, setGoingCount] = useState(event?.going || 0);
  const [isGoing, setIsGoing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 

  // --- ATTENDANCE CHECK EFFECT ---
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

  // --- LIVE CHAT LISTENER EFFECT ---
  useEffect(() => {
    // Listener runs as soon as event data is available
    if (!event || !event.id) {
        setMessages([]);
        return;
    }

    const q = query(
      collection(db, "messages"),
      where("eventId", "==", event.id),
      orderBy("timestamp", "asc")
    );

    // This listener streams data continuously while the sheet is open
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

  // Auto-scroll on new message
  useEffect(() => {
    if (isChatOpen) {
      chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isChatOpen]);


  if (!event) return null;

  // --- ATTENDANCE INCREMENT/DECREMENT LOGIC ---
  const handleGoingClick = async () => {
    if (!user || !event) {
        console.error("User not authenticated or event data missing.");
        return;
    }

    const eventRef = doc(db, "events", event.id);
    const goingRef = doc(db, "going", `${user.uid}_${event.id}`);

    try {
      if (isGoing) {
        // 1. Delete attendance record
        await deleteDoc(goingRef);
        // 2. Atomically decrement 'going' count
        await updateDoc(eventRef, {
          going: increment(-1), 
        });
        setGoingCount(prev => prev - 1);
        setIsGoing(false);
      } else {
        // 1. Create attendance record
        await setDoc(goingRef, {
          userId: user.uid,
          eventId: event.id,
        });
        // 2. Atomically increment 'going' count
        await updateDoc(eventRef, {
          going: increment(1),
        });
        setGoingCount(prev => prev + 1);
        setIsGoing(true);
      }
    } catch (error) {
        console.error("Attendance update failed:", error);
    }
  };
  // --- END ATTENDANCE LOGIC ---


  // --- CHAT SUBMISSION LOGIC ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !user || !event) return;

    // Add new message document to the 'messages' collection
    await addDoc(collection(db, "messages"), {
      eventId: event.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      text: chatMessage,
      timestamp: serverTimestamp(), // Use server time for accurate sorting
    });

    setChatMessage("");
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
      setMessages([]); // Clear chat history from state
      setIsReportModalOpen(false); 
    }, 300);
  };

  return (
    // Main modal wrapper (JSX layout starts here)
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
        <div className="flex items-center justify-between pb-4">
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
        

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-6">
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
          <div className="mt-4 flex justify-around rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-semibold text-gray-800">
                {event.locationName}
              </p>
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Ends In</span>
                <p className="font-semibold text-gray-800">45 min</p>
            </div>
          </div>

          {/* AI Vibe Summary  (Existing) */}
          <div className="mt-6 rounded-lg border border-orange-300 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">AI Vibe Summary</h3>
            </div>
            <p className="mt-2 text-sm text-orange-700">
                Vibe: 🔥 Going fast! They just brought out more cheese.
            </p>
          </div>

          {/* Action Buttons  (Existing) */}
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

          {/* Live Chat */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Live Chat</h3>
            </div>
            
             {!isChatOpen ? (
              <>
                {/* Chat Preview */}
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                    {/* Show last 2 messages */}
                  {messages.length === 0 && <p className="italic">Start the conversation!</p>}
                    {messages.slice(-2).map((msg) => (
                    <p key={msg.id}><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                  ))}
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
                {/* Full Chat View */}
                <div ref={chatContainerRef} className="mt-4 h-32 overflow-y-auto rounded-lg border bg-white p-2 space-y-1">
                    {messages.length === 0 && <p className="text-center italic text-gray-400">No messages yet. Start the chat!</p>}
                  {messages.map((msg) => (
                    <p key={msg.id} className="text-sm text-gray-600"><span className="font-semibold">{msg.userName}:</span> {msg.text}</p>
                  ))}
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
                    disabled={!user}
                    className="rounded-lg bg-orange-600 p-2 text-white disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </div>
          
          {/* Report Pin Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsReportModalOpen(true)} // Opens the modal (if added)
              className="text-sm text-gray-500 hover:text-red-600 hover:underline"
            >
              Report Pin
            </button>
          </div>
        </div>
      </div>

      {/* RENDER THE REPORT MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}