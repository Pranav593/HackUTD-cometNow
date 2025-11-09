"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/app/components/BottomNav";
import TopBar from "@/app/components/TopBar";
import HowToEarn from "@/app/components/HowToEarn";
import {
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

// --- NEW COMPONENT: Dynamic Points Bar ---
const PointsBar = ({ currentPoints, maxPoints = 1000 }: { currentPoints: number, maxPoints?: number }) => {
  const [width, setWidth] = useState(0);
  // Calculate percentage, capping at 100% just in case of overage
  const percentage = Math.min(100, (currentPoints / maxPoints) * 100);
  
  useEffect(() => {
    // Animate the bar filling up on mount/point change
    setWidth(percentage);
  }, [percentage]);

  return (
    <div className="mt-2 h-3 rounded-full bg-gray-200 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${width}%`,
          // Gradient from orange-500 to red-500
          background: "linear-gradient(to right, #f97316, #ef4444)" 
        }}
      />
    </div>
  );
}
// ------------------------------------------

// Placeholder component for the Gift Icon
const GiftPlaceholder = () => (
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700">
    <StarIcon className="h-8 w-8 text-white" />
  </div>
);

// Mock raffle data
const RAFFLE = {
  prize: "$20 Starbucks Gift Card",
  cost: 50,
  ends: "Wednesday 5 PM",
};

export default function RewardsPage() {
  // Renamed the state for clarity
  const [currentPoints, setCurrentPoints] = useState(100); 
  const [ticketsBought, setTicketsBought] = useState(0);

  const handleBuyTicket = () => {
    if (currentPoints >= RAFFLE.cost) {
      setCurrentPoints(currentPoints - RAFFLE.cost);
      setTicketsBought(ticketsBought + 1);
    } else {
      alert("Not enough Points!");
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <TopBar />

      {/* --- Page Content (Scrollable) --- */}
      <main className="flex-1 overflow-y-auto p-4 pt-24">
        
        {/* Point Balance with Animation */}
        <div className="mb-8">
          <span className="text-sm font-medium text-gray-500">
            Current Balance:
          </span>
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            {currentPoints} Points
          </h1>
          <PointsBar currentPoints={currentPoints} />
        </div>

        {/* --- Raffle Card --- */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Comet Raffle
          </h2>
          <div className="flex items-center gap-4">
            <GiftPlaceholder />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {RAFFLE.prize}
              </h3>
              <p className="text-sm text-gray-500">
                Ends: {RAFFLE.ends}
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-medium">
              You currently hold: <span className="font-bold text-orange-600">{ticketsBought} Tickets</span>
            </p>
          </div>

          <button
            onClick={handleBuyTicket}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-700 disabled:bg-gray-400"
            disabled={currentPoints < RAFFLE.cost}
          >
            Buy Ticket - {RAFFLE.cost} Points/each
            <InformationCircleIcon className="h-5 w-5" />
          </button>
          
          {currentPoints < RAFFLE.cost && (
            <p className="mt-2 text-center text-sm text-red-600">
              Insufficient Points.
            </p>
          )}
        </div>
        
        {/* --- How to Earn Section --- */}
        <HowToEarn />
      </main>

      {/* --- Bottom Nav --- */}
      <BottomNav />
    </div>
  );
}