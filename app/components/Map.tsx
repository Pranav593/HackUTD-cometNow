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
  selectedCategory: string;
  onPinClick: (event: EventData) => void;
}

// Constants (unchanged)
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
  selectedCategory,
  onPinClick,
}: MapProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Fetch building data (unchanged)
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

    if (activeFilter === "Past") {
      eventsToShow = eventsToShow.filter(
        (event) => new Date(event.endTime) < now
      );
    } else if (activeFilter === "Recommended") {
      eventsToShow = eventsToShow
        .filter((event) => new Date(event.endTime) >= now)
        .sort((a, b) => b.going - a.going);
    } else {
      eventsToShow = eventsToShow.filter(
        (event) => new Date(event.endTime) >= now
      );
    }

    if (selectedCategory !== "All") {
      eventsToShow = eventsToShow.filter(
        (event) => event.category === selectedCategory
      );
    }

    return eventsToShow;
  }, [events, activeFilter, selectedCategory]);

  return (
    <MapContainer
      center={UTD_COORDINATES}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      maxBounds={UTD_BOUNDS}
      minZoom={14}
      maxZoom={18}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
    >
      
      {/* Tile Layer (unchanged) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* LAYER 2: Building Labels (unchanged) */}
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