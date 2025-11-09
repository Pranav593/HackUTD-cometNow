// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from '@/lib/authContext';
import RouteGuard from './providers/RouteGuard';

export const metadata: Metadata = {
  title: "HackUTD CometNow",
  description: "HackUTD Competition Project",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CometNow",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF", // Changed to white for light theme
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add "light" to force light theme
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      {/*
       
      */}
      <body className="antialiased h-screen w-screen overflow-hidden">
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}