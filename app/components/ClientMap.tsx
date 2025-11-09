/**
 * ClientMap
 * Dynamically loads the Map component client-side only (no SSR) to
 * avoid Leaflet SSR issues and show a lightweight loading fallback.
 */
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

export default function ClientMap(props: any) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/components/Map"), {
        loading: () => <p>Map is loading...</p>,
        ssr: false,
      }),
    []
  );

  return <Map {...props} />;
}