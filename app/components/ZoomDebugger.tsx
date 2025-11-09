"use client";

import { useMapEvents } from 'react-leaflet';
import { useState } from 'react';

export default function ZoomDebugger() {
  const [zoomLevel, setZoomLevel] = useState(15); // Start with your default zoom

  const map = useMapEvents({
    zoomend: () => {
      // This is called every time the user finishes zooming
      setZoomLevel(map.getZoom());
      // Log the zoom level to the browser console for manual tracking
      console.log('Current Leaflet Zoom Level:', map.getZoom());
    },
  });

  return (
    <div 
      className="absolute top-28 left-4 z-50 rounded-lg bg-red-600 p-2 text-white font-bold shadow-lg pointer-events-none"
      style={{ pointerEvents: 'none' }}
    >
      DEBUG: Z{zoomLevel}
    </div>
  );
}