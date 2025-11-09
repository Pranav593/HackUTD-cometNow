// app/components/BottomNav.tsx
"use client";
import {
  MapIcon,
  GiftIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white/80 py-3 backdrop-blur-sm"
      // Add pointer-events-auto so it's clickable
      style={{ pointerEvents: "auto" }}
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