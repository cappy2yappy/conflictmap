"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { ConflictEvent } from "@/lib/types";
import { createConflictIcon } from "@/lib/marker-icons";
import "leaflet/dist/leaflet.css";

interface ConflictMapProps {
  conflicts: ConflictEvent[];
  selectedConflict: ConflictEvent | null;
  onSelectConflict: (conflict: ConflictEvent) => void;
}

function FlyToSelected({ conflict }: { conflict: ConflictEvent | null }) {
  const map = useMap();

  useEffect(() => {
    if (conflict) {
      map.flyTo([conflict.lat, conflict.lng], 6, { duration: 1.5 });
    }
  }, [conflict, map]);

  return null;
}

export default function ConflictMap({
  conflicts,
  selectedConflict,
  onSelectConflict,
}: ConflictMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      minZoom={2}
      maxZoom={18}
      className="w-full h-full"
      zoomControl={false}
      style={{ background: "#1a1a2e" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {conflicts.map((conflict) => (
        <Marker
          key={conflict.id}
          position={[conflict.lat, conflict.lng]}
          icon={createConflictIcon(conflict.severity)}
          eventHandlers={{
            click: () => onSelectConflict(conflict),
          }}
        />
      ))}
      <FlyToSelected conflict={selectedConflict} />
    </MapContainer>
  );
}
