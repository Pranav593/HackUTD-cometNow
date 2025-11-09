// app/components/DropPinButton.tsx
"use client";
import { PlusIcon } from "@heroicons/react/24/solid";

// 1. Define props for the onClick handler
interface DropPinButtonProps {
  onClick: () => void;
}

export default function DropPinButton({ onClick }: DropPinButtonProps) {
  return (
    <button
      onClick={onClick} // 2. Use the passed-in onClick prop
      className="absolute right-6 bottom-24 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-transform hover:scale-105"
      // Add pointer-events-auto here to override the parent div
      style={{ pointerEvents: "auto" }} 
    >
      <PlusIcon className="h-8 w-8" />
      <span className="sr-only">Drop a Pin</span>
    </button>
  );
}