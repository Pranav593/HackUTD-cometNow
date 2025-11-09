// app/components/AccountForm.tsx
"use client";

import { useState, useMemo } from "react";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const UTD_MAJORS = [
  "Computer Science", "Software Engineering", "Business Administration",
  "Marketing", "Finance", "Accounting", "Arts, Tech, & Emerging Comm.",
  "Psychology", "Biology", "Neuroscience", "Mechanical Engineering",
  "Electrical Engineering", "Biomedical Engineering", "History",
  "Political Science", "Economics", "Healthcare Studies", "Physics",
];

export default function AccountForm() {
  // --- MOCK DATA ---
  const mockUser = {
    name: "Temoc",
    email: "temoc@utdallas.edu",
  };

  // --- FORM STATE ---
  const [selectedMajor, setSelectedMajor] = useState("Computer Science");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifySocial, setNotifySocial] = useState(true);
  const [notifyFood, setNotifyFood] = useState(true);
  const [notifyStudy, setNotifyStudy] = useState(false);
  const [notifyAcademic, setNotifyAcademic] = useState(false);
  const [notifyCareer, setNotifyCareer] = useState(false);
  const [notifyRecreation, setNotifyRecreation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // This filters the major list in real-time
  const filteredMajors = useMemo(() => {
    if (!searchQuery) {
      return []; // Don't show any majors unless searching
    }
    return UTD_MAJORS.filter((major) =>
      major.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Only show top 5 results
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = {
      major: selectedMajor,
      interests: {
        social: notifySocial,
        food: notifyFood,
        study: notifyStudy,
        academic: notifyAcademic,
        career: notifyCareer,
        recreation: notifyRecreation,
      },
    };
    console.log("Saving preferences:", preferences);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* --- Account Info Card --- */}
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Account</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-500">Name</label>
            <input
              type="text"
              id="name"
              value={mockUser.name}
              disabled
              className="mt-1 w-full rounded-md border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-500">Email</label>
            <input
              type="email"
              id="email"
              value={mockUser.email}
              disabled
              className="mt-1 w-full rounded-md border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* --- Preferences Card --- */}
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">
          This helps us recommend events you'll care about.
        </p>
        
        {/* Searchable Major Input */}
        <div className="mt-6">
          <label htmlFor="major-search" className="block text-sm font-medium text-gray-700">
            Your Major
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="major-search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMajor(""); 
              }}
              placeholder="Search for your major..."
              className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          {/* --- Search Results --- */}
          {filteredMajors.length > 0 && (
            <div className="mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              {filteredMajors.map((major) => (
                <button
                  type="button"
                  key={major}
                  onClick={() => {
                    setSelectedMajor(major);
                    setSearchQuery(major); // Set input text to the selection
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                >
                  {major}
                </button>
              ))}
            </div>
          )}
          {/* Display the selected major */}
          {selectedMajor && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-semibold text-orange-600">{selectedMajor}</span>
            </p>
          )}
        </div>

        {/* Event Type Interests */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            I'm interested in...
          </label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Checkbox label="Social" checked={notifySocial} onChange={setNotifySocial} />
            <Checkbox label="Food" checked={notifyFood} onChange={setNotifyFood} />
            <Checkbox label="Study" checked={notifyStudy} onChange={setNotifyStudy} />
            <Checkbox label="Academic" checked={notifyAcademic} onChange={setNotifyAcademic} />
            <Checkbox label="Career" checked={notifyCareer} onChange={setNotifyCareer} />
            <Checkbox label="Recreation" checked={notifyRecreation} onChange={setNotifyRecreation} />
          </div>
        </div>
      </section>

      {/* --- Save Button --- */}
      <div className="flex items-center gap-4 px-2">
        <button
          type="submit"
          className="rounded-md bg-orange-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-orange-700"
        >
          Save Preferences
        </button>
        {isSaved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckIcon className="h-5 w-5" />
            <span className="font-medium">Saved!</span>
          </div>
        )}
      </div>

      <button
        type="button" 
        className="mt-4 w-full rounded-md bg-gray-200 px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-300"
      >
        Log Out
      </button>
    </form>
  );
}

// --- Helper Checkbox Component ---
function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-orange-600 shadow-sm focus:ring-orange-500"
      />
      <span className="font-medium text-gray-700">{label}</span>
    </label>
  );
}