import { handleLogin } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  try {
    await handleLogin(req, res, {
      authorizationParams: {
        screen_hint: 'signup'
      },
      returnTo: '/onboarding'
    });
  } catch (e: any) {
    console.error('Signup error', e);
    res.status(e.status || 500).end(e.message || 'Signup failed');
  }
}
