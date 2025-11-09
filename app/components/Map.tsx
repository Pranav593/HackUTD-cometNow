// app/components/Map.tsx
"use client";

import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import MarkerClusterGroup from "react-leaflet-markercluster";
import EventPin from "./EventPin";

// --- NEW: Updated Building interface to match your JSON ---
interface Building {
  name: string;
  abbreviation: string; // Changed from 'abbr'
  coordinate: string; // This is now a string "lat,lng"
  link: string;
}
// --------------------------------------------------------

// EventData interface (unchanged)
interface EventData {
  title: string;
  category: "Food" | "Social" | "Study" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

// invisibleIcon (unchanged)
const invisibleIcon = L.divIcon({
  className: "invisible-icon",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});
// Map constants (unchanged)
const UTD_COORDINATES: [number, number] = [32.9858, -96.7504];
const UTD_BOUNDS: L.LatLngBoundsExpression = [
  [32.980, -96.758],
  [32.995, -96.745],
];

export default function Map() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    // --- UPDATED: Fetch and parse  real building data ---
    fetch("/enriched_locations.json") // 1. Fetch the new file
      .then((res) => res.json())
      .then((data) => {
        // 2. Combine both arrays into one
        const allBuildings = [...data.buildings, ...data.university_housing];
        setBuildings(allBuildings);
      })
      .catch((err) => console.error("Error fetching building data:", err));
    // -----------------------------------------------------

    // Fetch mock events (unchanged)
    fetch("/mock-events.json")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching mock events:", err));
  }, []);

  return (
    <MapContainer
      center={UTD_COORDINATES}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      maxBounds={UTD_BOUNDS}
      minZoom={15}
      maxZoom={18}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
    >
      {/* LAYER 1: The Base Map (unchanged) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />

      {/* LAYER 2: Your Custom Building Labels */}
      {buildings.map((building) => {
        // --- NEW: Parse the coordinate string ---
        const coordsArray = building.coordinate
          .split(",")
          .map(Number) as [number, number];
        
        // Safety check
        if (isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
          return null;
        }

        return (
          <Marker
            key={building.name} // Use new key
            position={coordsArray} // Use new parsed coordinates
            icon={invisibleIcon}
          >
            <Tooltip
              permanent
              direction="center"
              className="utd-building-label"
            >
              {building.name} {/* Use new key */}
            </Tooltip>
          </Marker>
        );
      })}

      {/* LAYER 3: Your Event Pins  */}
      <MarkerClusterGroup>
        {events.map((event, index) => (
          <EventPin key={`${event.title}-${index}`} event={event} />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}