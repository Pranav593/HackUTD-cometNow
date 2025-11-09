"use client";

import { useState, useRef, useEffect } from "react";
// Import all necessary modules, including Link and navigation hooks
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "@/app/components/TopBar";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  MapIcon,
  GiftIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function AdvisorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi! I'm Comet Advisor. Ask me anything about UTD events, buildings, or academics.",
    },
  ]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const pathname = usePathname();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

  const currentInput = input;
  const userMessage: Message = { sender: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const aiMessage: Message = { sender: "ai", text: `I'm a mock response for: "${currentInput}"` };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    // Main container
    <div className="flex h-full w-screen flex-col bg-gray-50">
      
      {/* 1. Top Bar (Fixed) */}
      <TopBar />

      {/* 2. Scrollable Chat Area  */}
      <main className="flex-1 overflow-y-auto p-4 pt-20 pb-36 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm
                ${
                  msg.sender === "user"
                    ? "bg-white text-gray-800 border border-gray-200"
                    : "bg-orange-600 text-white"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Fixed Bottom UI Container */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        
        {/* Input Form  */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-gray-200 p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about upcoming events, campus info, and more..."
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="rounded-full bg-orange-600 p-3 text-white transition-colors hover:bg-orange-700"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
        
        {/* 4. Bottom Nav  */}
        <div
          className="flex justify-around border-t border-gray-200 bg-white/80 py-3 backdrop-blur-sm"
          style={{
            pointerEvents: "auto",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          {/* Map Link */}
          <Link href="/" className="flex flex-col items-center gap-1">
            <MapIcon
              className={`h-7 w-7 ${
                pathname === "/" ? "text-orange-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs ${
                pathname === "/" ? "text-orange-600" : "text-gray-500"
              }`}
            >
              Map
            </span>
          </Link>

          {/* Rewards Link */}
          <Link href="/rewards" className="flex flex-col items-center gap-1">
            <GiftIcon
              className={`h-7 w-7 ${
                pathname === "/rewards" ? "text-orange-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs ${
                pathname === "/rewards" ? "text-orange-600" : "text-gray-500"
              }`}
            >
              Rewards
            </span>
          </Link>

          {/* AI Chat Link (Highlighted) */}
          <Link href="/advisor" className="flex flex-col items-center gap-1">
            <SparklesIcon
              className={`h-7 w-7 ${
                pathname === "/advisor" ? "text-orange-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs ${
                pathname === "/advisor" ? "text-orange-600" : "text-gray-500"
              }`}
            >
              Advisor
            </span>
          </Link>

          {/* Account Link */}
          <Link href="/account" className="flex flex-col items-center gap-1">
            <UserCircleIcon
              className={`h-7 w-7 ${
                pathname === "/account" ? "text-orange-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs ${
                pathname === "/account" ? "text-orange-600" : "text-gray-500"
              }`}
            >
              Account
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}