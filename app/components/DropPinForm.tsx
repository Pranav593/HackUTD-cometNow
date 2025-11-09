// app/components/DropPinForm.tsx
"use client";

import { useEffect, useState } from "react";
import { EventData } from "./EventListItem";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { containsInappropriateContent } from "../utils/content-filter";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { toZonedTime } from 'date-fns-tz';
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";

interface DropPinFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (event: EventData) => void;
}

export default function DropPinForm({ isOpen, onClose, onCreated }: DropPinFormProps) {
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  setFormError("");
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
  console.log("[DropPinForm] Loaded location options:", unique.length);
        setLocationOptions(unique);
      } catch (e) {
        // Silently ignore; allow free-text entry
        console.error("[DropPinForm] Failed to load location options", e);
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

  // Lightweight cache for location data to avoid refetching inside submit
  const [locationData, setLocationData] = useState<any | null>(null);

  useEffect(() => {
    // Preload enriched locations for lookup
    fetch("/enriched_locations.json")
      .then(r => r.json())
      .then(data => {
        setLocationData(data);
  console.log("[DropPinForm] Preloaded enriched_locations.json");
      })
      .catch((err) => {
        console.warn("[DropPinForm] Could not preload enriched_locations.json", err);
      });
  }, []);

  const lookupCoordinates = (locName: string): [number, number] | null => {
    if (!locationData) return null;
    const pools: any[] = [
      ...(Array.isArray(locationData.buildings) ? locationData.buildings : []),
      ...(Array.isArray(locationData.university_housing) ? locationData.university_housing : []),
    ];
    // Exact name match first
    let match = pools.find(b => b.name === locName);
    if (!match) {
      // Case-insensitive name match
      match = pools.find(b => typeof b.name === 'string' && b.name.toLowerCase() === locName.toLowerCase());
    }
    if (!match) {
      // Try abbreviation containment (user may type abbreviation)
      match = pools.find(b => typeof b.abbreviation === 'string' && b.abbreviation.toLowerCase() === locName.toLowerCase());
    }
    if (!match || !match.coordinate) return null;
    const parts = String(match.coordinate).split(',').map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    return [parts[0], parts[1]];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
  console.log("[DropPinForm] handleSubmit start");

    // Check for inappropriate content
    const { isInappropriate } = containsInappropriateContent(description);
    if (isInappropriate) {
      setDescriptionError("Please remove inappropriate content before submitting.");
      console.warn("[DropPinForm] Content flagged as inappropriate");
      setIsSubmitting(false);
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
      console.error("[DropPinForm] User not authenticated");
      setIsSubmitting(false);
      return;
    }

    // Ensure location data is available, fetch inline if not yet loaded
    let coords = lookupCoordinates(location);
    if (!coords) {
      try {
        if (!locationData) {
          console.log("[DropPinForm] Loading locations inline for lookup...");
          const res = await fetch("/enriched_locations.json");
          const data = await res.json();
          setLocationData(data);
        }
        coords = lookupCoordinates(location);
      } catch (err) {
        console.warn("[DropPinForm] Inline location load failed", err);
      }
    }
    if (!coords) {
      console.warn("[DropPinForm] Could not resolve coordinates for:", location, "- defaulting to [0,0]");
      coords = [0, 0];
    }

    // Build UTC timestamps
    let startAtUtc: string | undefined;
    let endAtUtc: string | undefined;
    if (fullDate) {
      // Convert naive local Dallas time to UTC manually (date-fns-tz helper fallback)
      const toUtcFromDallas = (hhmm: string) => {
        const base = new Date(`${fullDate}T${hhmm}:00`); // interpreted in local runtime TZ
        // Adjust if runtime TZ differs from Dallas by deriving Dallas zoned time then diff
  const zonedDallas = toZonedTime(base, 'America/Chicago');
        // We want the wall-clock time in Dallas as UTC: construct UTC using its components
        const utcDate = new Date(Date.UTC(
          zonedDallas.getFullYear(),
          zonedDallas.getMonth(),
          zonedDallas.getDate(),
          zonedDallas.getHours(),
          zonedDallas.getMinutes(),
          0, 0
        ));
        return utcDate.toISOString();
      };
      startAtUtc = toUtcFromDallas(to24Hour(startTime, startTimeAmPm));
      endAtUtc = toUtcFromDallas(to24Hour(endTime, endTimeAmPm));
    }

    // Prevent past scheduling (startAt must be in future by at least 1 minute)
    if (startAtUtc) {
      const startMs = Date.parse(startAtUtc);
      const nowMs = Date.now();
      if (startMs < nowMs - 30_000) { // allow slight clock drift
        console.warn('[DropPinForm] Attempted to schedule event in the past');
        setFormError('Start time is in the past.');
        setIsSubmitting(false);
        return;
      }
    }

    if (startAtUtc && endAtUtc && Date.parse(endAtUtc) <= Date.parse(startAtUtc)) {
      console.warn('[DropPinForm] End time must be after start time');
      setFormError('End time must be after start time.');
      setIsSubmitting(false);
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
      coordinates: coords, // Resolved from enriched_locations.json
      startAtUtc,
      endAtUtc,
      expired: false,
    };
  console.log("[DropPinForm] Payload ready:", payload);
    try {
      const coll = collection(db, "events");
  console.log("[DropPinForm] Adding document to 'events'...");
      const docRef = await addDoc(coll, payload);
  console.log("[DropPinForm] addDoc success, id:", docRef.id);

      const created: EventData = { ...payload, id: docRef.id } as EventData;
      // Optimistically update parent before updateDoc to avoid UI feeling stuck
      onCreated?.(created);

      try {
        await updateDoc(docRef, { id: docRef.id });
        console.log("[DropPinForm] updateDoc(id) success");
      } catch (updErr) {
        console.warn("[DropPinForm] updateDoc(id) failed — proceeding anyway", updErr);
      }

      onClose(); // Close form on successful submission
      resetForm();
    } catch (error) {
      console.error("[DropPinForm] Error adding document:", error);
      setFormError('Failed to save event. Please retry.');
    } finally {
      setIsSubmitting(false);
  console.log("[DropPinForm] handleSubmit end");
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
            {formError && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
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
              disabled={isSubmitting}
              className={`w-full rounded-md px-5 py-3 text-lg font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Drop Pin!"}
            </button>
          </form>
        </div>

        {/* Mobile home bar */}
        <div className="mt-4 h-1 w-32 self-center rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>
  );
}