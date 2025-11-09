// app/components/ClientMap.tsx
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

// 1. Accept `props`
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