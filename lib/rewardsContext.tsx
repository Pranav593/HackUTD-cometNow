/**
 * Rewards context: manages points, chat cooldown, raffle tickets.
 * Persists state in localStorage and resets on logout.
 */
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./authContext";

const POINTS_KEY = "rewards:points";
const LAST_CHAT_KEY = "rewards:lastChatAwardAt";
const TICKETS_KEY = "rewards:tickets";

const INITIAL_POINTS = 50;
const CHAT_COOLDOWN_MS = 10 * 60 * 1000; // ms

export type RewardsContextType = {
  points: number;
  lastChatAwardAt: number | null;
  tickets: number;
  addPoints: (amount: number, meta?: { source?: string }) => void;
  spendPoints: (amount: number) => boolean; // returns true if spent
  awardEventCreation: () => void; // +25
  awardChatPoints: () => { awarded: boolean; nextEligibleAt: number };
  resetPoints?: (value?: number) => void; // helper for debugging
  addTickets: (count?: number) => void;
};

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState<number>(INITIAL_POINTS);
  const [lastChatAwardAt, setLastChatAwardAt] = useState<number | null>(null);
  const [tickets, setTickets] = useState<number>(0);
  const { user, loading } = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POINTS_KEY);
      const storedPoints = stored !== null ? parseInt(stored, 10) : NaN;
      if (!Number.isFinite(storedPoints)) {
        localStorage.setItem(POINTS_KEY, String(INITIAL_POINTS));
        setPoints(INITIAL_POINTS);
      } else {
        setPoints(storedPoints);
      }

      const lastChat = localStorage.getItem(LAST_CHAT_KEY);
      if (lastChat) {
        const t = parseInt(lastChat, 10);
        setLastChatAwardAt(Number.isFinite(t) ? t : null);
      }

      const storedTickets = localStorage.getItem(TICKETS_KEY);
      if (storedTickets !== null) {
        const n = parseInt(storedTickets, 10);
        setTickets(Number.isFinite(n) ? n : 0);
      } else {
        localStorage.setItem(TICKETS_KEY, "0");
        setTickets(0);
      }
    } catch (e) {
      console.warn("[Rewards] Failed to read localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(POINTS_KEY, String(points));
    } catch {}
  }, [points]);

  useEffect(() => {
    try {
      if (lastChatAwardAt) localStorage.setItem(LAST_CHAT_KEY, String(lastChatAwardAt));
    } catch {}
  }, [lastChatAwardAt]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_KEY, String(tickets));
    } catch {}
  }, [tickets]);

  const addPoints = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setPoints((p) => p + Math.floor(amount));
  }, []);

  const spendPoints = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    let success = false;
    setPoints((p) => {
      if (p >= amount) {
        success = true;
        return p - Math.floor(amount);
      }
      return p;
    });
    return success;
  }, []);

  const awardEventCreation = useCallback(() => {
    addPoints(25);
  }, [addPoints]);

  const awardChatPoints = useCallback(() => {
    const now = Date.now();
    const last = lastChatAwardAt ?? (() => {
      try {
        const s = localStorage.getItem(LAST_CHAT_KEY);
        return s ? parseInt(s, 10) : 0;
      } catch {
        return 0;
      }
    })();

    if (!last || now - last >= CHAT_COOLDOWN_MS) {
      addPoints(10);
      setLastChatAwardAt(now);
      try {
        localStorage.setItem(LAST_CHAT_KEY, String(now));
      } catch {}
      return { awarded: true, nextEligibleAt: now + CHAT_COOLDOWN_MS };
    }

    return { awarded: false, nextEligibleAt: last + CHAT_COOLDOWN_MS };
  }, [addPoints, lastChatAwardAt]);

  const addTickets = useCallback((count: number = 1) => {
    if (!Number.isFinite(count) || count <= 0) return;
    setTickets((t) => t + Math.floor(count));
  }, []);

  const resetPoints = useCallback((value?: number) => {
    const v = Number.isFinite(value as number) ? (value as number) : INITIAL_POINTS;
    setPoints(v);
    try {
      localStorage.setItem(POINTS_KEY, String(v));
    } catch {}
  }, []);

  const value = useMemo<RewardsContextType>(() => ({
    points,
    lastChatAwardAt,
    tickets,
    addPoints,
    spendPoints,
    awardEventCreation,
    awardChatPoints,
    resetPoints,
    addTickets,
  }), [points, lastChatAwardAt, tickets, addPoints, spendPoints, awardEventCreation, awardChatPoints, resetPoints, addTickets]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      try {
        localStorage.removeItem(POINTS_KEY);
        localStorage.removeItem(LAST_CHAT_KEY);
        localStorage.removeItem(TICKETS_KEY);
      } catch {}
      setPoints(INITIAL_POINTS);
      setLastChatAwardAt(null);
      setTickets(0);
    }
  }, [user, loading]);

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used within a RewardsProvider");
  return ctx;
}
