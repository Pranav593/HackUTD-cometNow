// app/components/DropPinForm.tsx
"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { containsInappropriateContent } from "../utils/content-filter";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";

interface DropPinFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DropPinForm({ isOpen, onClose }: DropPinFormProps) {
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("Other");
  // Keep year fixed to 2025; only allow editing month & day
  const YEAR = "2025";
  const [dateMD, setDateMD] = useState(""); // format MM-DD
  const [startTime, setStartTime] = useState("9:00");
  const [startTimeAmPm, setStartTimeAmPm] = useState<"AM" | "PM">("AM");
  const [endTime, setEndTime] = useState("10:00");
  const [endTimeAmPm, setEndTimeAmPm] = useState<"AM" | "PM">("AM");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const { user } = useAuth();

  const resetForm = () => {
    setDescription("");
    setDescriptionError("");
    setLocation("");
    setCategory("Other");
    setDateMD("");
    setStartTime("9:00");
    setStartTimeAmPm("AM");
    setEndTime("10:00");
    setEndTimeAmPm("AM");
    setShowInfo(false);
  };

  // Load location names from public/enriched_locations.json
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch("/enriched_locations.json", { cache: "force-cache" });
        if (!res.ok) return;
        const data = await res.json();
        const buildings = Array.isArray(data?.buildings) ? data.buildings : [];
        const housing = Array.isArray(data?.university_housing) ? data.university_housing : [];
        const names: string[] = [
          ...buildings.map((b: any) => b?.name).filter(Boolean),
          ...housing.map((h: any) => h?.name).filter(Boolean),
        ];
        // Deduplicate while preserving order
        const seen = new Set<string>();
        const unique = names.filter((n) => {
          if (seen.has(n)) return false;
          seen.add(n);
          return true;
        });
        setLocationOptions(unique);
      } catch (e) {
        // Silently ignore; allow free-text entry
        console.error("Failed to load location options", e);
      }
    };
    loadLocations();
  }, []);

  const handleTimeChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 2) {
      setter(digits);
    } else if (digits.length <= 4) {
      setter(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for inappropriate content
    const { isInappropriate } = containsInappropriateContent(description);
    if (isInappropriate) {
      setDescriptionError("Please remove inappropriate content before submitting.");
      return;
    }

    const [mm, dd] = (dateMD || "").split("/");
    const fullDate = mm && dd ? `${YEAR}-${mm}-${dd}` : "";

    // Convert 12-hour time to 24-hour format
    const to24Hour = (time: string, ampm: "AM" | "PM") => {
      let [hours, minutes] = time.split(":").map(Number);
      minutes = isNaN(minutes) ? 0 : minutes;
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      }
      if (ampm === "AM" && hours === 12) {
        hours = 0;
      }
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const payload = {
      id: '', // Will be set after creation
      title: description,
      category,
      location,
      date: fullDate, // yyyy-mm-dd (year fixed to 2025)
      startTime: to24Hour(startTime, startTimeAmPm), // HH:MM (24h)
      endTime: to24Hour(endTime, endTimeAmPm), // HH:MM (24h)
      creatorId: user.uid,
      going: 1, // Initialize with 1 (the creator)
      coordinates: [0, 0], // Default coordinates, you might want to add actual location selection
    };
    console.log("Submitting:", payload);
    try {
      const docRef = await addDoc(collection(db, "events"), payload);
      // Update the document with its ID
      await updateDoc(docRef, { id: docRef.id });
      console.log("Document written with ID: ", docRef.id);
      onClose(); // Close form on successful submission
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
      // Optionally, show an error to the user
    }
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
        className="absolute inset-0"
        onClick={() => {
          onClose();
          resetForm();
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
              resetForm();
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Description */}
            <div className="relative">
              {showInfo && (
                <div className="absolute right-0 -top-14 w-full max-w-xs rounded-lg bg-gray-700 p-2 text-xs text-white shadow-lg dark:bg-gray-900">
                  <p>Just type out what's happening! Mention the what, where, and when so others can join.</p>
                  <div className="absolute right-4 -bottom-2 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-700 dark:border-t-gray-900"></div>
                </div>
              )}
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Free pizza"
                  className="w-full rounded-md border border-gray-300 px-5 py-3 pr-10 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
                <InformationCircleIcon
                  onClick={() => setShowInfo(!showInfo)}
                  className="pointer-events-auto absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  aria-hidden
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-5 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {[
                  "Social",
                  "Food",
                  "Study",
                  "Academic",
                  "Career",
                  "Recreation",
                  "Other",
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Location (combobox using datalist) */}
            <div>
              <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-5 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select a location</option>
                {locationOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date (Year fixed to 2025; editable MM/DD with backspace removing last digit) */}
            <div>
              <label htmlFor="dateMD" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  id="dateMD"
                  placeholder="MM/DD"
                  value={dateMD}
                  onChange={(e) => {
                    // Accept digits and forward slash; validate month/day values
                    let value = e.target.value.replace(/[^\d\/]/g, '');
                    
                    // Handle backspace and deletion
                    if (value.length < dateMD.length) {
                      setDateMD(value);
                      return;
                    }

                    // Auto-add slash after month if user types two digits
                    if (value.length === 2 && !value.includes('/')) {
                      value += '/';
                    }

                    // Validate month and day
                    const [month, day] = value.split('/');
                    if (month && parseInt(month) > 12) {
                      return; // Don't update if month > 12
                    }
                    if (day && parseInt(day) > 31) {
                      return; // Don't update if day > 31
                    }

                    setDateMD(value);
                  }}
                  pattern="\d{1,2}\/\d{1,2}"
                  className="w-full rounded-md border border-gray-300 px-5 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <span className="select-none rounded-md bg-gray-100 px-4 py-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {YEAR}
                </span>
              </div>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start time
                </label>
                <input
                  type="text"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
                  placeholder="09:00"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-center text-lg text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  maxLength={5}
                />
                <div className="mt-2 flex justify-center rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setStartTimeAmPm("AM")}
                    className={`w-1/2 rounded-l-md border px-3 py-2 text-sm font-semibold ${
                      startTimeAmPm === "AM"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartTimeAmPm("PM")}
                    className={`-ml-px w-1/2 rounded-r-md border px-3 py-2 text-sm font-semibold ${
                      startTimeAmPm === "PM"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="endTime" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End time
                </label>
                <input
                  type="text"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
                  placeholder="10:00"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-center text-lg text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  maxLength={5}
                />
                <div className="mt-2 flex justify-center rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setEndTimeAmPm("AM")}
                    className={`w-1/2 rounded-l-md border px-3 py-2 text-sm font-semibold ${
                      endTimeAmPm === "AM"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndTimeAmPm("PM")}
                    className={`-ml-px w-1/2 rounded-r-md border px-3 py-2 text-sm font-semibold ${
                      endTimeAmPm === "PM"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-md bg-green-600 px-5 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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