"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext'; 
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // If user is already logged in, go to home
      router.replace('/');
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    

    try {
      if (mode === 'login') {
        await login(email, password);
        router.replace('/');
      } else {
        await signup(email, password, displayName.trim());
        router.replace('/onboarding');
      }
    } catch (err: any) {
      // Safely access the error message
      setError(err?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* LOGO SECTION - Centered and Branded */}
        <div className="flex flex-col items-center mb-10">
          <Image src="/hacklogo.png" alt="Logo" width={70}height={70}className="object-contain" />
          <h1 className="text-3xl font-extrabold text-gray-900">CometNow</h1>
        </div>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
          {mode === 'login' ? 'Log in with your UTD Email' : 'Create your Comet Account'}
        </h2>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">UTD Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="temoc@utdallas.edu"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>
          
          {/* DISPLAY NAME (SIGNUP ONLY) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                placeholder="Temoc Comet"
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>
          )}
          
          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>
          
          {/* SUBMIT BUTTON - Branded Orange */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition duration-150 disabled:bg-orange-300 shadow-md"
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* MODE TOGGLE  */}
        <p className="text-center text-sm text-gray-600 mt-8">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button 
                type="button" 
                className="text-orange-600 font-medium hover:underline" 
                onClick={() => setMode('signup')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                type="button" 
                className="text-orange-600 font-medium hover:underline" 
                onClick={() => setMode('login')}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
