"use client";

// Deprecated: This used to wrap the app with Auth0. It's now a no-op wrapper kept for backward compatibility.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}