// app/components/ClientMap.tsx
"use client"; // This makes it a Client Component

import { useMemo } from "react";
import dynamic from "next/dynamic";

export default function ClientMap() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/components/Map"), {
        loading: () => <p>Map is loading...</p>,
        ssr: false, // This is allowed here!
      }),
    []
  );

  return <Map />;
}