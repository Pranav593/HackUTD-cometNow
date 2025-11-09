/**
 * OnboardingPage
 * Multi-step profile setup (welcome -> major/year -> interests). Ensures
 * user profile completeness before granting full app access.
 */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { UTD_MAJORS } from '@/lib/majors';

const interestsList = ["Social", "Food", "Study", "Academic", "Career", "Recreation"];
const years = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [major, setMajor] = useState('');
  const [year, setYear] = useState(years[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

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
    setError(null);
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
        setError('An error occurred while saving your data.');
      } finally {
        setSaving(false);
      }
    } else {
      setError('Please fill out all fields and select at least one interest.');
    }
  };


  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }
  
  const progressPercent = (step / 3) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 text-center">
            Comet Profile Setup
          </h1>
          <div className="mt-4 flex justify-between text-sm font-medium text-gray-500">
            <span>Step {step} of 3</span>
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                className="text-orange-600 hover:underline"
              >
                Back
              </button>
            )}
          </div>
          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-600 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={submit}>
          
          {step === 1 && (
            <div className="animate-fadeIn space-y-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800">Hi, {user.displayName || user.email || 'Comet'}!</h2>
                <p className="text-gray-600 text-lg">
                    We just need a few details to give you the best event recommendations.
                </p>
                <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">Account Details</p>
                    <p className="text-sm text-gray-500">Name: {user.displayName || 'Not Set'}</p>
                    <p className="text-sm text-gray-500">Email: {user.email}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                  Next: Major & Year
                </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Your Academic Path</h2>
              
              <section className="space-y-6">
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Major
                  </label>
                  <select
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      major ? 'border-gray-400 text-gray-900' : 'border-gray-300 text-gray-500'
                    }`}
                    required
                  >
                    <option value="" disabled>Select your major</option>
                    {UTD_MAJORS.map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Year
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </section>
              
              <button 
                type="button" 
                onClick={() => setStep(3)}
                disabled={!major || !year}
                className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition-colors disabled:bg-gray-400"
              >
                Next: Choose Interests
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">What are you interested in?</h2>
              
              <section className="space-y-4">
                <p className="text-gray-600">
                    Select at least one category to see pins on the map.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {interestsList.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`flex items-center justify-center h-16 sm:h-20 text-center text-sm font-medium rounded-xl border-2 transition-all duration-200 shadow-sm
                        ${
                          interests.includes(interest)
                            ? 'bg-green-100 border-green-600 text-green-800 scale-105 shadow-lg'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:scale-[1.02]'
                        }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>

              {interests.length === 0 && (
                  <p className="mt-4 text-sm text-red-500 font-medium">
                      Please select at least one interest.
                  </p>
              )}
              
              <button
                type="submit"
                disabled={saving || interests.length === 0}
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:shadow-none"
              >
                {saving ? 'Saving Profile...' : 'Complete Profile & Launch Map'}
              </button>
            </div>
          )}
          
        </form>
        
        {/* Footer for scrolling fix */}
        <style jsx global>{`
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
