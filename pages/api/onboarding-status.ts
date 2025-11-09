import type { NextApiRequest, NextApiResponse } from 'next';

// Deprecated endpoint: use client-side checks against Firestore as needed.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }
  return res.status(410).json({ error: 'Deprecated. Onboarding status is determined client-side.' });
}
