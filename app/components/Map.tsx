"use client";

import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
// Ensure this package is installed: npm install react-leaflet-markercluster leaflet.markercluster
import MarkerClusterGroup from "react-leaflet-markercluster"; 
import EventPin from "./EventPin";
import { EventData } from "./EventListItem";
import { MainFilter } from "./FilterBar";

// Building interface (matches enriched_locations.json)
interface Building {
  name: string;
  abbreviation: string;
  coordinate: string;
  link: string;
}

interface MapProps {
  events: EventData[];
  activeFilter: MainFilter;
  selectedCategories: string[]; // support multi-select categories
  onPinClick: (event: EventData) => void;
}

// Helper to safely check optional `expired` flag on events
function hasExpired(e: unknown): e is { expired?: boolean } {
  return !!e && typeof e === "object" && "expired" in e;
}

// Constants 
const invisibleIcon = L.divIcon({
  className: "invisible-icon",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});
const UTD_COORDINATES: [number, number] = [32.9858, -96.7504];
const UTD_BOUNDS: L.LatLngBoundsExpression = [
  [32.950, -96.800],
  [33.020, -96.700],];
export default function Map({
  events,
  activeFilter,
  selectedCategories,
  onPinClick,
}: MapProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Fetch building data 
  useEffect(() => {
    fetch("/enriched_locations.json")
      .then((res) => res.json())
      .then((data) => {
        const allBuildings = [...data.buildings, ...data.university_housing];
        setBuildings(allBuildings);
      })
      .catch((err) => console.error("Error fetching building data:", err));
  }, []);

  // Filtering Logic (unchanged)
  const filteredEvents = useMemo(() => {
    const now = new Date();
    let eventsToShow = [...events];

    // --- 1. Filter by Active Filter (Past/Recommended/Upcoming) ---
    if (activeFilter === "Past") {
      // Show events that have already ended
      eventsToShow = eventsToShow.filter(
        (event) => new Date(event.endTime) < now
      );
    } else if (activeFilter === "Recommended") {
      // Show future events, sorted by 'going' count (trending)
      eventsToShow = eventsToShow
        .filter((event) => new Date(event.endTime) >= now)
        .sort((a, b) => (b.going ?? 0) - (a.going ?? 0));
    } else {
      eventsToShow = eventsToShow.filter(
        (event) => new Date(event.endTime) >= now
      );
    }

    if (selectedCategories.length > 0) {
      eventsToShow = eventsToShow.filter(
        (event) => new Date(event.endTime) >= now
      );
    }

    // --- 2. Filter by Selected Categories (if any) ---
    if (selectedCategories.length > 0) {
    // --- 3. Safety filter for expired flag ---
    // If the event data includes an `expired` property, ensure we exclude them
    eventsToShow = eventsToShow.filter((e) => !(hasExpired(e) && e.expired === true));
    }

    // --- 3. Safety filter for expired flag ---
    // If the event data includes an `expired` property, ensure we exclude them
    eventsToShow = eventsToShow.filter((e) => !(hasExpired(e) && e.expired));

    // [DEBUGGING LOG REMOVED] - Removed console.log for cleaner code submission

    return eventsToShow;
  }, [events, activeFilter, selectedCategories]); // Dependencies updated for stability

  return (
    <MapContainer
      center={UTD_COORDINATES}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
      maxBounds={UTD_BOUNDS}
      minZoom={14}
      maxZoom={18}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
    >
      
      {/* Tile Layer  */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* LAYER 2: Building Labels  */}
      {buildings.map((building) => {
        const coordsArray = building.coordinate.split(",").map(Number) as [number, number];
        if (isNaN(coordsArray[0]) || isNaN(coordsArray[1])) return null;
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
              offset={[0, -10]}
            >
              {building.abbreviation}
            </Tooltip>
          </Marker>
        );
      })}

      {/* LAYER 3: Event Pins with Clustering */}
      <MarkerClusterGroup>
        {filteredEvents.map((event, index) => (
          // Assumes EventPin handles event location existence checks
          <EventPin
            key={`${event.title}-${index}`}
            event={event}
            onPinClick={onPinClick}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}