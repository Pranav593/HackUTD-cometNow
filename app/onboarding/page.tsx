"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const interestsList = ["Social", "Food", "Study", "Academic", "Career", "Recreation"];
const years = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
import { UTD_MAJORS } from '@/lib/majors';

function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [major, setMajor] = useState('');
  const [year, setYear] = useState(years[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // If user already has onboarding data, skip this page
  useEffect(() => {
    const checkOnboarded = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        const hasBasics = Boolean(data?.major) && Boolean(data?.year) && Array.isArray(data?.interests) && data.interests.length > 0;
        if (hasBasics) {
          router.replace('/');
        }
      }
    };
    if (user) {
      checkOnboarded();
    }
  }, [user, router]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (major && year && interests.length > 0) {
      setSaving(true);
      try {
        if (!user) throw new Error('User not authenticated');
        const userId = user.uid;
        await setDoc(doc(db, 'users', userId), {
          major,
          year,
          interests,
          email: user.email || null,
          name: user.displayName || null,
          updatedAt: serverTimestamp(),
          profileComplete: true,
        }, { merge: true });
        router.push('/');
      } catch (err) {
        console.error(err);
        alert('An error occurred while saving your data.');
      } finally {
        setSaving(false);
      }
    } else {
      alert('Please fill out all fields and select at least one interest.');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {user.displayName || user.email || 'Friend'}!</h1>
          <p className="mt-2 text-gray-600">Let's get your profile set up.</p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="major" className="text-sm font-medium text-gray-700">Major</label>
            <select
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="" disabled>Select your major</option>
              {UTD_MAJORS.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="text-sm font-medium text-gray-700">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Interests</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {interestsList.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    interests.includes(interest)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
          >
            {saving ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;