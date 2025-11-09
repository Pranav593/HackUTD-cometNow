"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { withPageAuthRequired, UserProfile } from '@auth0/nextjs-auth0/client';

const interestsList = ["Social", "Food", "Study", "Academic", "Career", "Recreation"];
const years = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const majors = [
  "Accounting", "Acting", "Aerospace Engineering", "African-American Studies", "American Studies", "Animation", "Anthropology", 
  "Art History", "Arts, Technology, and Emerging Communication", "Biochemistry", "Biology", "Biomedical Engineering", 
  "Business Administration", "Business Analytics", "Chemistry", "Child Learning and Development", "Cognitive Science", 
  "Communication", "Computer Engineering", "Computer Science", "Criminology", "Data Science", "Economics", 
  "Electrical Engineering", "Emerging Media and Communication", "Finance", "Geosciences", "Global Business", 
  "Healthcare Management", "Historical Studies", "Information Technology and Systems", "Interdisciplinary Studies", 
  "International Political Economy", "Literary Studies", "Marketing", "Mathematics", "Mechanical Engineering", 
  "Molecular Biology", "Neuroscience", "Philosophy", "Physics", "Political Science", "Psychology", "Public Affairs", 
  "Public Policy", "Software Engineering", "Sociology", "Speech, Language, and Hearing Sciences", "Supply Chain Management", 
  "Visual and Performing Arts"
];

function OnboardingPage({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [major, setMajor] = useState('');
  const [year, setYear] = useState(years[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
        const res = await fetch('/api/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ major, year, interests }),
        });
        if (res.ok) {
          router.push('/');
        } else {
          alert('Failed to save onboarding data: ' + (await res.text()));
        }
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {user.name}!</h1>
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
              {majors.map(m => <option key={m} value={m}>{m}</option>)}
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

export default withPageAuthRequired(OnboardingPage, {
  onRedirecting: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-gray-500">Loading session...</div>
    </div>
  ),
});