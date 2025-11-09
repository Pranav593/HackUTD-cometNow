"use client";
/**
 * RecommendedEvents
 * Fetches user profile + all events from Firestore, calls /api/recommend
 * to get an ordered list of 5 event IDs, then displays them using EventListItem.
 * Falls back to top 5 closest by start time if API fails or gives invalid output.
 */
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import EventListItem, { EventData } from './EventListItem';

interface RecommendedEventsProps {
  onEventClick?: (event: EventData) => void;
}

export default function RecommendedEvents({ onEventClick }: RecommendedEventsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<EventData[]>([]);
  const [allEvents, setAllEvents] = useState<EventData[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data();
      let interests: string[] = [];
      if (Array.isArray(data.interests)) {
        interests = data.interests as string[];
      } else if (data.interests && typeof data.interests === 'object') {
        interests = Object.keys(data.interests).filter(k => !!data.interests[k]);
      }
      return { major: data.major || null, year: data.year || null, interests };
    } catch (e) {
      console.warn('[RecommendedEvents] Failed to load profile', e);
      return null;
    }
  }, [user]);

  const fetchEvents = useCallback(async () => {
    try {
      // Basic query: upcoming/unexpired events; if expired flag exists filter by it
      const coll = collection(db, 'events');
      // We'll just get all and filter client-side for now (could be optimized)
      const snap = await getDocs(coll);
      const events: EventData[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(e => e && e.title && e.category && e.startTime && e.endTime)
        .map(e => ({
          ...e,
          going: e.going || 0,
          coordinates: Array.isArray(e.coordinates) ? e.coordinates : [0,0],
        }));
      return events;
    } catch (e) {
      console.error('[RecommendedEvents] Failed to fetch events', e);
      return [];
    }
  }, []);

  // Fallback: pick next 5 closest upcoming events by startAtUtc or date+startTime
  const fallbackEvents = (events: EventData[]) => {
    const now = Date.now();
    const scored = events.map(ev => {
      const startMs = ev.startAtUtc
        ? Date.parse(ev.startAtUtc)
        : Date.parse(`${ev.date}T${ev.startTime}`);
      return { ev, startMs };
    }).filter(x => x.startMs && x.startMs > now);
    return scored.sort((a,b) => a.startMs - b.startMs).slice(0,5).map(x => x.ev);
  };

  const runRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await fetchProfile();
      const events = await fetchEvents();
      setAllEvents(events);
      if (!profile || events.length === 0) {
        setRecommended(fallbackEvents(events));
        return;
      }

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: profile, events }),
      });
      const ctype = response.headers.get('content-type') || '';
      if (!response.ok || !ctype.includes('application/json')) {
        console.warn('[RecommendedEvents] recommend API failed status', response.status);
        setRecommended(fallbackEvents(events));
        return;
      }
      const data = await response.json();
      const ids: string[] = Array.isArray(data.recommendedEventIds) ? data.recommendedEventIds : [];
      if (ids.length !== 5) {
        console.warn('[RecommendedEvents] Expected 5 IDs, got', ids.length);
        setRecommended(fallbackEvents(events));
        return;
      }
      const mapById = new Map(events.map(e => [e.id, e]));
      const resolved = ids.map(id => mapById.get(id)).filter(Boolean) as EventData[];
      // If any missing, fallback
      if (resolved.length !== 5) {
        console.warn('[RecommendedEvents] Missing events for some IDs. Falling back.');
        setRecommended(fallbackEvents(events));
        return;
      }
      setRecommended(resolved);
    } catch (e:any) {
      setError(e?.message || 'Failed to load recommendations');
      setRecommended(fallbackEvents(allEvents));
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchEvents, allEvents]);

  useEffect(() => {
    runRecommendation();
  }, [runRecommendation]);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Recommended For You</h2>
        <p className="mt-2 text-sm text-gray-500">Finding the best events...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Recommended For You</h2>
        <button
          onClick={() => runRecommendation()}
          className="text-sm text-orange-600 hover:underline"
        >Refresh</button>
      </div>
      {error && (
        <div className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {recommended.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">No upcoming events found.</p>
      )}
      <div className="mt-4 flex flex-col gap-4">
        {recommended.map(ev => (
          <EventListItem key={ev.id} event={ev} onClick={() => onEventClick?.(ev)} />
        ))}
      </div>
      {recommended.length === 5 && (
        <p className="mt-4 text-xs text-gray-400">AI-selected based on your profile. Fallback uses nearest upcoming events.</p>
      )}
    </div>
  );
}