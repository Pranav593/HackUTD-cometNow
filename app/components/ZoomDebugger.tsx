/**
 * ZoomDebugger
 * Dev overlay that displays current Leaflet zoom level. Useful while tuning
 * zoom-dependent UI behavior. Not interactive (pointer-events: none).
 */
"use client";

import { useMapEvents } from 'react-leaflet';
import { useState } from 'react';

export default function ZoomDebugger() {
  const [zoomLevel, setZoomLevel] = useState(15);

  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
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