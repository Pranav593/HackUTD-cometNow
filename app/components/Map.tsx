"use client";

import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
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

// Constants 
const invisibleIcon = L.divIcon({
  className: "invisible-icon",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});
const UTD_COORDINATES: [number, number] = [32.9858, -96.7504];
const UTD_BOUNDS: L.LatLngBoundsExpression = [ [32.980, -96.758], [32.995, -96.745] ];

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

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    const now = new Date();
    let eventsToShow = [...events];

    // Helper to parse event end datetime safely
    const getEventEnd = (e: EventData) => e.endAtUtc ? new Date(e.endAtUtc) : new Date(`${e.date}T${e.endTime}`);

    if (activeFilter === "Past") {
      eventsToShow = eventsToShow.filter((event) => getEventEnd(event) < now);
    } else if (activeFilter === "Recommended") {
      eventsToShow = eventsToShow
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        .filter((event) => new Date(event.endTime) >= now)
=======
        .filter((event) => getEventEnd(event) >= now)
>>>>>>> Stashed changes
=======
        .filter((event) => getEventEnd(event) >= now)
>>>>>>> Stashed changes
        .sort((a, b) => (b.going ?? 0) - (a.going ?? 0));
    } else {
      eventsToShow = eventsToShow.filter((event) => getEventEnd(event) >= now);
    }

    if (selectedCategories.length > 0) {
      eventsToShow = eventsToShow.filter(
        (event) => selectedCategories.includes(event.category)
      );
=======
        .filter((event) => getEventEnd(event) >= now)
        .sort((a, b) => (b.going ?? 0) - (a.going ?? 0));
    } else {
      eventsToShow = eventsToShow.filter((event) => getEventEnd(event) >= now);
>>>>>>> Stashed changes
    }

    // Exclude expired=true for safety
    eventsToShow = eventsToShow.filter(e => !e.expired);

    // Debug visibility for why items may not show
    try {
      console.log(
        `[Map] events in=${events.length}, after filter=${eventsToShow.length}, filter=${activeFilter}, category=${selectedCategory}`
      );
    } catch {}

<<<<<<< Updated upstream
    // Exclude expired=true for safety
    eventsToShow = eventsToShow.filter(e => !e.expired);

    // Debug visibility for why items may not show
    try {
      console.log(
        `[Map] events in=${events.length}, after filter=${eventsToShow.length}, filter=${activeFilter}, category=${selectedCategory}`
      );
    } catch {}

=======
>>>>>>> Stashed changes
    return eventsToShow;
  }, [events, activeFilter, selectedCategories]);

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