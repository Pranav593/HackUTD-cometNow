// app/components/Map.tsx
"use client";

// We are using react-leaflet (which IS Leaflet.js)
import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Define the shape of your building data
interface Building {
  name: string;
  abbr: string;
  coords: [number, number];
  url: string;
}

// --- NEW: A "Transparent" Icon ---
// We need a Marker to "anchor" our label, but we make it invisible.
const invisibleIcon = L.divIcon({
  className: "invisible-icon",
  iconSize: [0, 0], // Zero size
  iconAnchor: [0, 0],
});
// ------------------------------------

const UTD_COORDINATES: [number, number] = [32.9858, -96.7504];
const UTD_BOUNDS: L.LatLngBoundsExpression = [
  [32.980, -96.758], // Southwest
  [32.995, -96.745], // Northeast
];

export default function Map() {
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    fetch("/buildings.json") // Fetches from 'public/buildings.json'
      .then((res) => res.json())
      .then((data) => {
        setBuildings(data);
      })
      .catch((err) => console.error("Error fetching building data:", err));
  }, []);

  return (
    <MapContainer
      center={UTD_COORDINATES}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100vw" }}
      maxBounds={UTD_BOUNDS}
      minZoom={15}
      maxZoom={18}
      maxBoundsViscosity={1.0}
    >
      {/* LAYER 1: The Modern, No-Label Base Map (from CartoDB) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        // This is the "Positron No-Labels" style. Perfect for you.
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />

      {/* LAYER 2: Your Custom Building Labels */}
      {buildings.map((building) => (
        <Marker
          key={building.abbr}
          position={building.coords}
          icon={invisibleIcon} // Use the invisible icon
        >
          <Tooltip
            permanent // Makes the label always visible
            direction="center"
            className="utd-building-label" // Custom class for styling
          >
            {building.abbr}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}