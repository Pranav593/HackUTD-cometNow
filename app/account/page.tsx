// app/account/page.tsx
"use client";

import BottomNav from "@/app/components/BottomNav";
import TopBar from "@/app/components/TopBar";
import AccountForm from "@/app/components/AccountForm";

export default function AccountPage() {
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <TopBar />

      {/* Page Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 pt-24">
        <AccountForm />
      </main>

      <BottomNav />
    </div>
  );
}