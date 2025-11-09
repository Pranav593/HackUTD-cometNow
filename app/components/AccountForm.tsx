/**
 * AccountForm
 * - Displays and saves the user's profile (name, email) and preferences.
 * - Loads/saves data from Firestore and provides a searchable UTD majors input,
 *   academic year selector, and interest toggles.
 */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { UTD_MAJORS } from "@/lib/majors";

export default function AccountForm() {
  const { user, logout } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialMajorLoaded, setInitialMajorLoaded] = useState(false);

  const [selectedMajor, setSelectedMajor] = useState("");
  const [year, setYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifySocial, setNotifySocial] = useState(true);
  const [notifyFood, setNotifyFood] = useState(true);
  const [notifyStudy, setNotifyStudy] = useState(false);
  const [notifyAcademic, setNotifyAcademic] = useState(false);
  const [notifyCareer, setNotifyCareer] = useState(false);
  const [notifyRecreation, setNotifyRecreation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [majorError, setMajorError] = useState<string | null>(null);

  const academicYears = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

  const filteredMajors = useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    return UTD_MAJORS.filter((major) =>
      major.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setEmail(user.email || "");
      setName(user.displayName || "");
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setName(data.name || user.displayName || "");
          if (data.major) {
            setSelectedMajor(data.major);
            setInitialMajorLoaded(true);
            setSearchQuery(data.major);
          }
          if (data.year) {
            setYear(data.year);
          }
          if (data.interests) {
            setNotifySocial(Boolean(data.interests.social));
            setNotifyFood(Boolean(data.interests.food));
            setNotifyStudy(Boolean(data.interests.study));
            setNotifyAcademic(Boolean(data.interests.academic));
            setNotifyCareer(Boolean(data.interests.career));
            setNotifyRecreation(Boolean(data.interests.recreation));
          }
        } else {
          setName(user.displayName || "");
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setIsSaved(false);

    const interests = {
      social: notifySocial,
      food: notifyFood,
      study: notifyStudy,
      academic: notifyAcademic,
      career: notifyCareer,
      recreation: notifyRecreation,
    };

    const payload = {
      name: name || null,
      major: selectedMajor || null,
      year: year || null,
      interests: interests,
      email: email || null,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", user.uid), payload, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences", err);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Account</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-500">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-md border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-500">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="mt-1 w-full rounded-md border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">
          This helps us recommend events you'll care about.
        </p>

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
          {filteredMajors.length > 0 && (
            <div className="mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              {filteredMajors.map((major) => (
                <button
                  type="button"
                  key={major}
                  onClick={() => {
                    setSelectedMajor(major);
                    setSearchQuery(major);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                >
                  {major}
                </button>
              ))}
            </div>
          )}
          {selectedMajor && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-semibold text-orange-600">{selectedMajor}</span>
            </p>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="academic-year" className="block text-sm font-medium text-gray-700">
            Your Year
          </label>
          <select
            id="academic-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="" disabled>Select your year</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

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
        onClick={() => logout()}
        className="mt-4 w-full rounded-md bg-gray-200 px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-300"
      >
        Log Out
      </button>
    </form>
  );
}

/**
 * Checkbox
 * Simple labeled checkbox used in AccountForm's interests section.
 */
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