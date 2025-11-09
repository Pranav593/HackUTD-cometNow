"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Passive check: do NOT redirect, just show banner if onboarding incomplete.
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!isLoading && user) {
        try {
          const res = await fetch('/api/onboarding-status', { cache: 'no-store' });
          if (active && res.ok) {
            const data = await res.json();
            if (data?.authenticated && data?.onboarded === false) {
              setNeedsOnboarding(true);
            }
          }
        } catch {/* ignore */}
      }
    };
    check();
    return () => { active = false; };
  }, [isLoading, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-start py-10 px-6">
        <header className="w-full flex items-center justify-between mb-10">
          <div className="text-2xl font-bold">cometNow</div>
          <div className="text-sm">
            {isLoading ? (
              <span>Loading...</span>
            ) : user ? (
              <>
                <span className="mr-4 text-gray-700">{user.name || user.email}</span>
                <a className="mr-4" href="/api/auth/logout?returnTo=%2F">
                  Logout
                </a>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/api/auth/login?returnTo=%2F"
                  className="rounded bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
                >
                  Login
                </a>
                <a
                  href="/api/auth/signup"
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </header>
        <section className="w-full space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to cometNow</h1>
          <p className="text-gray-600 max-w-xl">
            Discover and organize campus life—events, study sessions, and more. {user ? "You're logged in." : "Create an account to get started."}
          </p>
          {user && needsOnboarding && (
            <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 flex items-center justify-between">
              <span>Finish setting up your profile to personalize your experience.</span>
              <a
                href="/onboarding"
                className="ml-4 rounded bg-amber-600 px-3 py-1 text-white text-sm hover:bg-amber-500"
              >Complete Onboarding</a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
