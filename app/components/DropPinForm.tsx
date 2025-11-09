// app/components/DropPinForm.tsx
"use client";

import { useState } from "react";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface DropPinFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DropPinForm({ isOpen, onClose }: DropPinFormProps) {
  const [description, setDescription] = useState("");
  const [showInfo, setShowInfo] = useState(false); // <-- 1. ADD STATE

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", description);
  };

  return (
    // Main modal wrapper
    <div
      className={`
        absolute inset-0 z-20 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          onClose();
          setShowInfo(false); // Close info bubble when modal closes
        }}
      ></div>

      {/* The white form "sheet" */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[85vh] flex-col rounded-t-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
        style={{ pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-orange-600"></div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              CometNow
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              setShowInfo(false); // Close info bubble when modal closes
            }}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto pt-6">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            What's Happening, Comets?
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Input Field */}
            <div className="relative">
              {/* --- 3. ADD THE INFO BUBBLE --- */}
              {showInfo && (
                <div className="absolute right-0 -top-14 w-full max-w-xs rounded-lg bg-gray-700 p-2 text-xs text-white shadow-lg dark:bg-gray-900">
                    <p> Just type out what's happening! Be sure to mention the location and time-sensitive details so others know where and when to join in. </p>
                  <div className="absolute right-4 -bottom-2 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-700 dark:border-t-gray-900"></div>
                </div>
              )}

              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Free pizza in SU 2.104 by 5pm"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {/* --- 2. ADD ONCLICK TO THE ICON --- */}
              <InformationCircleIcon
                onClick={() => setShowInfo(!showInfo)}
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              />
            </div>

            {/* AI Suggestion Section (Empty for now) */}
            <div></div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-md bg-green-600 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Drop Pin!
            </button>
          </form>
        </div>

        {/* Mobile home bar */}
        <div className="mt-4 h-1 w-32 self-center rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>
  );
}