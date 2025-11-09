import { handleAuth } from '@auth0/nextjs-auth0';

// Next.js Pages Router Auth0 handler providing:
// /api/auth/login, /api/auth/logout, /api/auth/callback, /api/auth/me
export default handleAuth();
