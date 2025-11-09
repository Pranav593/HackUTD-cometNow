"use client";
import {
  MapIcon,
  GiftIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

// --- PROPS ARE NO LONGER NEEDED ---
// interface BottomNavProps {
//   onChatClick: () => void;
//   isChatOpen: boolean;
// }

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white/80 py-3 backdrop-blur-sm"
      style={{
        pointerEvents: "auto",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* --- Map Link --- */}
      <Link href="/" className="flex flex-col items-center gap-1">
        <MapIcon
          className={`h-7 w-7 ${
            pathname === "/" ? "text-orange-600" : "text-gray-500"
          }`}
        />
        <span
          className={`text-xs ${
            pathname === "/" ? "text-orange-600" : "text-gray-500"
          }`}
        >
          Map
        </span>
      </Link>

      {/* --- Rewards Link --- */}
      <Link href="/rewards" className="flex flex-col items-center gap-1">
        <GiftIcon
          className={`h-7 w-7 ${
            pathname === "/rewards" ? "text-orange-600" : "text-gray-500"
          }`}
        />
        <span
          className={`text-xs ${
            pathname === "/rewards" ? "text-orange-600" : "text-gray-500"
          }`}
        >
          Rewards
        </span>
      </Link>

      {/* --- 3. UPDATED: AI Chat Link --- */}
      <Link href="/advisor" className="flex flex-col items-center gap-1">
        <SparklesIcon
          className={`h-7 w-7 ${
            pathname === "/advisor" ? "text-orange-600" : "text-gray-500"
          }`}
        />
        <span
          className={`text-xs ${
            pathname === "/advisor" ? "text-orange-600" : "text-gray-500"
          }`}
        >
          Advisor
        </span>
      </Link>

      {/* --- Account Link --- */}
      <Link href="/account" className="flex flex-col items-center gap-1">
        <UserCircleIcon
          className={`h-7 w-7 ${
            pathname === "/account" ? "text-orange-600" : "text-gray-500"
          }`}
        />
        <span
          className={`text-xs ${
            pathname === "/account" ? "text-orange-600" : "text-gray-500"
          }`}
        >
          Account
        </span>
      </Link>
    </div>
  );
}