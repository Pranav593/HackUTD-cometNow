// app/rewards/page.tsx
"use client";

import BottomNav from "@/app/components/BottomNav";
import {
  UserCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

// Placeholder component
const StarbucksLogo = () => (
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700">
    <StarIcon className="h-8 w-8 text-white" />
  </div>
);

export default function RewardsPage() {
  return (
    // The h-screen overflow-hidden from layout.tsx will fix the width
    <div className="flex h-full flex-col bg-gray-50">
      {/* --- Top Header --- */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-orange-600"></div>
          <span className="text-lg font-semibold text-gray-800">CometNow</span>
          <span className="text-lg font-medium text-orange-600">Rewards</span>
        </div>
        <button>
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
        </button>
      </header>

      {/* --- Page Content (Scrollable) --- */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* Hype Balance */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">
            Hype Balance:
          </span>
          <h1 className="text-2xl font-bold text-gray-900">100 Hype</h1>
        </div>

        {/* Raffle Card */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Comet-Catcher Raffle
          </h2>
          <div className="flex items-center gap-4">
            <StarbucksLogo />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                $20 Starbucks Gift Card
              </h3>
              <p className="text-sm text-gray-500">Ends: Wednesday 5 PM</p>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-700">
            Buy Tickets - 50 Hype/each
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Hype Store Card */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Hype Store</h2>
          <div className="flex flex-col gap-4">
            {/* Store Item 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BoltIcon className="h-6 w-6 text-orange-500" />
                <span className="font-medium text-gray-700">Pin Glow</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-orange-600">25 Hype</span>
                <button className="rounded-md bg-orange-600 px-5 py-1 text-sm font-semibold text-white hover:bg-orange-700">
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Bottom Nav --- */}
      <BottomNav />
    </div>
  );
}