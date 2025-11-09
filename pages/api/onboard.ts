import type { NextApiRequest, NextApiResponse } from 'next';

// Deprecated endpoint: client now writes onboarding data directly to Firestore.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }
  return res.status(410).json({ error: 'Deprecated. Onboarding is handled on the client.' });
}
