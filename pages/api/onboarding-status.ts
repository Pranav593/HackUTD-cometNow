import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getSession(req, res);
  if (!session || !session.user) {
    return res.status(200).json({ onboarded: false, authenticated: false });
  }

  try {
    const userId = session.user.sub;
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return res.status(200).json({ onboarded: false, authenticated: true });
    }

    const data = snap.data() as any;
    const hasBasics = Boolean(data?.major) && Boolean(data?.year) && Array.isArray(data?.interests) && data.interests.length > 0;

    return res.status(200).json({ onboarded: hasBasics, authenticated: true });
  } catch (err) {
    console.error('onboarding-status error', err);
    return res.status(200).json({ onboarded: false, authenticated: true });
  }
}
