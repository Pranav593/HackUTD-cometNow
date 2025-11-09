// app/components/DropPinForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface DropPinFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple iOS-like time wheel with hour (0-23) and minute (0-59)
function TimePicker({
  hour,
  minute,
  onChange,
}: {
  hour: number;
  minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const ITEM_H = 36; // px per row
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const hourScrollTimeout = useRef<number | null>(null);
  const minuteScrollTimeout = useRef<number | null>(null);

  // Scroll to current values when they change
  // Initialize scroll positions to selected values centered (using spacer rows)
  useEffect(() => {
    if (hourRef.current) hourRef.current.scrollTop = hour * ITEM_H;
    if (minuteRef.current) minuteRef.current.scrollTop = minute * ITEM_H;
  }, []);

  const finalizeHourScroll = () => {
    const el = hourRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(HOURS.length - 1, idx));
    el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    if (clamped !== hour) onChange(clamped, minute);
  };
  const finalizeMinuteScroll = () => {
    const el = minuteRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(MINUTES.length - 1, idx));
    el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    if (clamped !== minute) onChange(hour, clamped);
  };
  const handleHourScroll = () => {
    if (hourScrollTimeout.current) window.clearTimeout(hourScrollTimeout.current);
    hourScrollTimeout.current = window.setTimeout(finalizeHourScroll, 120);
  };
  const handleMinuteScroll = () => {
    if (minuteScrollTimeout.current) window.clearTimeout(minuteScrollTimeout.current);
    minuteScrollTimeout.current = window.setTimeout(finalizeMinuteScroll, 120);
  };

  const Column = ({ values, value, onPick, innerRef }: {
    values: number[];
    value: number;
    onPick: (v: number) => void;
    innerRef: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div className="relative w-full">
      <div
        ref={innerRef}
        onScroll={values.length === 24 ? handleHourScroll : handleMinuteScroll}
        className="overflow-y-auto rounded-md border border-gray-300 bg-transparent dark:border-gray-600 dark:bg-transparent scroll-smooth"
        style={{ scrollbarWidth: "none", height: ITEM_H * 3, touchAction: "pan-y" as any }}
      >
        {/* top spacer so first item can center */}
        <div style={{ height: ITEM_H }} />
        {values.map((v) => (
          <div
            key={v}
            className={`flex items-center justify-center px-3`}
            style={{ height: ITEM_H }}
          >
            <button
              type="button"
              onClick={() => {
                // Snap to item via scroll
                const el = innerRef.current;
                if (el) el.scrollTo({ top: v * ITEM_H, behavior: "smooth" });
                onPick(v);
              }}
              className={`w-full text-center text-base ${
                v === value
                  ? "font-semibold text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {String(v).padStart(2, "0")}
            </button>
          </div>
        ))}
        {/* bottom spacer so last item can center */}
        <div style={{ height: ITEM_H }} />
      </div>
      {/* highlight band */}
      <div
        className="pointer-events-none absolute left-0 right-0 rounded-md border border-orange-500/50"
        style={{ top: `calc(50% - ${ITEM_H / 2}px)`, height: ITEM_H }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/70 via-transparent to-white/70 dark:from-gray-800/70 dark:to-gray-800/70" />
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      <Column
        values={HOURS}
        value={hour}
        onPick={(v) => onChange(v, minute)}
        innerRef={hourRef}
      />
      <span className="select-none text-lg font-semibold text-gray-700 dark:text-gray-200">:</span>
      <Column
        values={MINUTES}
        value={minute}
        onPick={(v) => onChange(hour, v)}
        innerRef={minuteRef}
      />
    </div>
  );
}

export default function DropPinForm({ isOpen, onClose }: DropPinFormProps) {
  const [description, setDescription] = useState("");
  const [showInfo, setShowInfo] = useState(false); // <-- 1. ADD STATE
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("Other");
  // Keep year fixed to 2025; only allow editing month & day
  const YEAR = "2025";
  const [dateMD, setDateMD] = useState(""); // format MM-DD
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const pad2 = (n: number) => n.toString().padStart(2, "0");

  // Derive hour/min for custom pickers
  const [startHour, setStartHour] = useState<number>(0);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(0);
  const [endMinute, setEndMinute] = useState<number>(0);

  // Initialize times once
  useEffect(() => {
    const parse = (t?: string) => {
      const [h, m] = (t || "00:00").split(":");
      return [parseInt(h || "0", 10) || 0, parseInt(m || "0", 10) || 0] as [number, number];
    };
    const [sh, sm] = parse(startTime);
    const [eh, em] = parse(endTime);
    setStartHour(sh); setStartMinute(sm);
    setEndHour(eh); setEndMinute(em);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep string HH:MM in sync
  useEffect(() => {
    setStartTime(`${pad2(startHour)}:${pad2(startMinute)}`);
  }, [startHour, startMinute]);
  useEffect(() => {
    setEndTime(`${pad2(endHour)}:${pad2(endMinute)}`);
  }, [endHour, endMinute]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  const [mm, dd] = (dateMD || "").split("/");
    const fullDate = mm && dd ? `${YEAR}-${mm}-${dd}` : "";
    // Minimal payload; parent can wire this to map or storage
    const payload = {
      title: description,
      category,
      location,
      date: fullDate, // yyyy-mm-dd (year fixed to 2025)
      startTime, // HH:MM (24h)
      endTime, // HH:MM (24h)
    };
    console.log("Submitting:", payload);
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
              <input
                id="location"
                list="location-options"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Start typing or pick a place"
                className="w-full rounded-md border border-gray-300 px-5 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
              <datalist id="location-options">
                {locationOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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
                    // Accept digits only; format as MM/DD; cap length to 5 incl '/'
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const mm = digits.slice(0, 2);
                    const dd = digits.slice(2, 4);
                    const formatted = digits.length <= 2 ? mm : `${mm}/${dd}`;
                    setDateMD(formatted);
                  }}
                  pattern="^\\d{2}\/\\d{2}$"
                  className="w-full rounded-md border border-gray-300 px-5 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <span className="select-none rounded-md bg-gray-100 px-4 py-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {YEAR}
                </span>
              </div>
            </div>

            {/* Time range with iOS-like wheels for hours (0-23) and minutes (0-59) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Start time</label>
                <TimePicker
                  hour={startHour}
                  minute={startMinute}
                  onChange={(h, m) => { setStartHour(h); setStartMinute(m); }}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">End time</label>
                <TimePicker
                  hour={endHour}
                  minute={endMinute}
                  onChange={(h, m) => { setEndHour(h); setEndMinute(m); }}
                />
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