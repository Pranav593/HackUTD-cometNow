// app/components/Map.tsx
"use client";

import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// These imports are for your event pins and clustering
import MarkerClusterGroup from "react-leaflet-markercluster";
import EventPin from "./EventPin";

// --- INTERFACES ---

// This matches your enriched_locations.json file
interface Building {
  name: string;
  abbreviation: string;
  coordinate: string;
  link: string;
}

// This matches your mock-events.json file
interface EventData {
  title: string;
  category: "Food" | "Social" | "Study" | string;
  locationName: string;
  startTime: string;
  endTime: string;
  coordinates: [number, number];
}

// --- PROPS FOR THIS COMPONENT ---
// This prop comes from page.tsx and is passed to EventPin.tsx
interface MapProps {
  onPinClick: (event: EventData) => void;
}

// --- CONSTANTS ---

// A "Transparent" Icon to anchor the building labels
const invisibleIcon = L.divIcon({
  className: "invisible-icon",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Map boundaries and center
const UTD_COORDINATES: [number, number] = [32.9858, -96.7504];
const UTD_BOUNDS: L.LatLngBoundsExpression = [
  [32.980, -96.758], // Southwest
  [32.995, -96.745], // Northeast
];

// --- COMPONENT ---

export default function Map({ onPinClick }: MapProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);

  // Fetch all data on component mount
  useEffect(() => {
    // Fetch real building data
    fetch("/enriched_locations.json")
      .then((res) => res.json())
      .then((data) => {
        // Combine both building arrays into one
        const allBuildings = [...data.buildings, ...data.university_housing];
        setBuildings(allBuildings);
      })
      .catch((err) => console.error("Error fetching building data:", err));

    // Fetch fake event data
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
      {/* LAYER 1: The "no-label" base map from CartoDB */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />

      {/* LAYER 2: Your Custom Building Labels (using abbreviations) */}
      {buildings.map((building) => {
        // Parse the coordinate string "lat,lng" into [lat, lng]
        const coordsArray = building.coordinate
          .split(",")
          .map(Number) as [number, number];

        // Safety check if coordinates are valid
        if (isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
          return null;
        }

        return (
          <Marker
            key={building.abbreviation}
            position={coordsArray}
            icon={invisibleIcon}
          >
            <Tooltip
              permanent
              direction="center"
              className="utd-building-label"
              offset={[0, -10]} // Shifts label up to look cleaner
            >
              {building.abbreviation}
            </Tooltip>
          </Marker>
        );
      })}

      {/* LAYER 3: vent Pins (with clustering) */}
      <MarkerClusterGroup>
        {events.map((event, index) => (
          <EventPin
            key={`${event.title}-${index}`}
            event={event}
            onPinClick={onPinClick} // This wires up the slide-up modal
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}