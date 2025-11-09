// app/components/TopBar.tsx
"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function TopBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">CometNow</h1>
      <button>
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      </button>
    </div>
  );
}