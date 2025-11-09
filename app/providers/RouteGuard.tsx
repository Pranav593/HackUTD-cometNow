"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Authentication gate first
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isOnboarding = pathname?.startsWith('/onboarding');

    if (!user) {
      if (!isAuthPage) router.replace('/login');
      setProfileChecked(false);
      setProfileComplete(null);
      return;
    }

    // When authenticated, ensure we know if onboarding is complete
    const checkProfile = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          const hasBasics = Boolean(data?.major) && Boolean(data?.year) && Array.isArray(data?.interests) && data.interests.length > 0;
          setProfileComplete(Boolean(data?.profileComplete) || hasBasics);
        } else {
          setProfileComplete(false);
        }
      } catch {
        setProfileComplete(false);
      } finally {
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!user || !profileChecked) return;
    const isAuthPage = pathname === '/login';
    const isOnboarding = pathname?.startsWith('/onboarding');

    // If not complete, force to onboarding unless already there
    if (profileComplete === false && !isOnboarding) {
      router.replace('/onboarding');
      return;
    }
    // If complete and on onboarding, go to home
    if (profileComplete === true && isOnboarding) {
      router.replace('/');
      return;
    }
    // Prevent authenticated user on /login
    if (profileComplete !== null && isAuthPage) {
      router.replace('/');
    }
  }, [user, profileChecked, profileComplete, pathname, router]);

  // Loading states: either auth resolving or profile status resolving
  if (loading || (user && !profileChecked)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
