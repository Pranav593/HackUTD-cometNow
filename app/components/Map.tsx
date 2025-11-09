"use client";

import { MapContainer, TileLayer, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
import MarkerClusterGroup from "react-leaflet-markercluster";
import EventPin from "./EventPin";
import { EventData } from "./EventListItem";
import { MainFilter } from "./FilterBar";

// Building interface 
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
  selectedCategory,
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

  const filteredEvents = useMemo(() => {
    
    
    if (!Array.isArray(events)) {
      return [];
    }

    const now = new Date();
    let eventsToShow = [...events];

    // Filter by Main Filter 
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

    // Filter by Category 
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
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      maxBounds={UTD_BOUNDS}
      minZoom={15}
      maxZoom={18}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
    >
      {/* LAYER 1: Base Map  */}
      <TileLayer
        attribution='&copy; <a href="https{s}://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https{s}://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
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

      {/* LAYER 3: Renders the new `filteredEvents`  */}
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