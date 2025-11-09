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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Use the unified EventData definition
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import { EventData } from "./EventListItem";

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
}

interface EventDetailSheetProps {
  event: EventData | null;
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



export default function EventDetailSheet({
  event,
  onClose,
}: EventDetailSheetProps) {
  // --- 2. ADD STATE FOR INTERACTIVITY ---
  const [goingCount, setGoingCount] = useState(event?.going || 0);
  const [isGoing, setIsGoing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  const { user } = useAuth();

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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        {/* Header: Logo + Close Button (Updated) */}
        <div className="flex items-center justify-between pb-4">
          {/* --- 1. LOGO INTEGRATION --- */}
          <div className="flex items-center gap-2">
          <Image src="/hacklogo.png" alt="Logo" width={32} height={32} className="object-contain" /> 
            <span className="text-sm font-semibold text-gray-800">CometNow</span>
          </div>
          {/* --------------------------- */}
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
            {/* --- 2. DYNAMIC EMOJI ICON --- */}
            <EventIcon category={event.category} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex justify-around rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-semibold text-gray-800">
                {event.location}
              </p>
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Ends In</span>
                <p className="font-semibold text-gray-800">45 min</p>
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

          {/* Action Buttons  */}
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

          {/* Live Chat */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Live Chat</h3>
            </div>
             {!isChatOpen ? (
              <>
                <div className="mt-3 text-sm text-gray-600">
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
                <div className="mt-4 h-32 overflow-y-auto rounded-lg border bg-white p-2">
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
                    className="rounded-lg bg-orange-600 p-2 text-white"
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

      {/*  5. RENDER THE REPORT MODAL  */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}