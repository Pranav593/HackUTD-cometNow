import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Derive a display name that avoids using the raw email unless no other info exists.
function deriveDisplayName(user: any): string | null {
  if (!user) return null;
  const { given_name, family_name, nickname, name, email } = user;
  const full = [given_name, family_name].filter(Boolean).join(' ').trim();
  if (full.length >= 2) return full; // both parts or at least one non-empty
  if (nickname && nickname !== email) return nickname;
  if (name && name !== email) return name;
  return null; // store null instead of duplicating email in name field
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getSession(req, res);
  if (!session || !session.user) {
    return res.status(401).end('Not authenticated');
  }

  const { major, year, interests } = req.body;
  if (!major || !year || !interests || !Array.isArray(interests) || interests.length === 0) {
    return res.status(400).end('Missing or invalid onboarding data');
  }

  try {
    const userId = session.user.sub; // e.g., 'auth0|12345'
    if (!userId) {
      throw new Error('User ID not found in session');
    }
    
    await setDoc(doc(db, 'users', userId), {
      major,
      year,
      interests,
      email: session.user.email || null,
      name: deriveDisplayName(session.user),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Onboard save error', err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return res.status(500).end(`Failed to save onboarding data: ${message}`);
  }
}
