/**
 * ReportModal
 * Simple modal for reporting an event with a reason and optional details.
 */
"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const reportReasons = [
  "Event is Over",
  "Harmful or Inappropriate",
  "Incorrect Information",
  "Spam / Ad",
];

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [moreInfo, setMoreInfo] = useState("");

  if (!isOpen) return null;

  
  const handleSubmit = () => {
    console.log("Submitting report:", { reason, moreInfo });
    onClose(); 
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Report Event</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {reportReasons.map((r) => (
            <label key={r} className="flex items-center gap-3">
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"/>
              <span className="text-gray-700">{r}</span>
            </label>
          ))}
          
          <textarea
            value={moreInfo}
            onChange={(e) => setMoreInfo(e.target.value)}
            placeholder="More info (optional)..."
            className="mt-2 w-full rounded-md border-gray-300 p-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            rows={3}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}