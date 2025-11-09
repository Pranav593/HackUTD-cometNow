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
  events?: EventData[];
  activeFilter: MainFilter;
  // Support either a single selectedCategory (current usage) or legacy selectedCategories array
  selectedCategory?: string;
  selectedCategories?: string[];
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
  selectedCategory,
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

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    const now = new Date();
    let eventsToShow = [...safeEvents];

    // Normalize categories from either prop shape
    const categories: string[] = Array.isArray(selectedCategories)
      ? selectedCategories
      : selectedCategory && selectedCategory !== "All"
      ? [selectedCategory]
      : [];

    // Helper to parse event end datetime safely
    const getEventEnd = (e: EventData) =>
      e.endAtUtc ? new Date(e.endAtUtc) : new Date(`${e.date}T${e.endTime}`);

    if (activeFilter === "Past") {
      eventsToShow = eventsToShow.filter((event) => getEventEnd(event) < now);
    } else if (activeFilter === "Recommended") {
      // Show future events, sorted by 'going' count (trending)
      eventsToShow = eventsToShow
        .filter((event) => getEventEnd(event) >= now)
        .sort((a, b) => (b.going ?? 0) - (a.going ?? 0));
    } else {
      eventsToShow = eventsToShow.filter((event) => getEventEnd(event) >= now);
    }

    // Category filter (if any selected)
    if (categories.length > 0) {
      eventsToShow = eventsToShow.filter((event) =>
        categories.includes(event.category)
      );
    }

    // Exclude expired=true for safety
    eventsToShow = eventsToShow.filter(e => !e.expired);

    // Debug visibility for why items may not show
    try {
      console.log(
        `[Map] events in=${safeEvents.length}, after filter=${eventsToShow.length}, filter=${activeFilter}, categories=${categories.join(",") || "none"}`
      );
    } catch {}

    return eventsToShow;
  }, [events, activeFilter, selectedCategory, selectedCategories]); // Dependencies updated for stability

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