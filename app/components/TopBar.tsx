"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function TopBar() {
  return (
    
    <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm shadow-sm z-20">
      <div className="flex items-center gap-2">
        {/* Placeholder image source needs to be verified or replaced */}
        <Image src="/hacklogo.png" alt="Logo" width={32} height={32} className="object-contain" />
        <h1 className="text-2xl font-bold text-gray-800">CometNow</h1>
      </div>
      <Link href="/account">
      <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      </button>
      </Link>
    </div>
  );
}