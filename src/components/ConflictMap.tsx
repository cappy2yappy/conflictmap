"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { getConflictsForZoom } from "@/lib/conflict-data";
import { createConflictIcon } from "@/lib/marker-icons";
import { ConflictEvent } from "@/lib/types";
import "leaflet/dist/leaflet.css";

interface ConflictMapProps {
  conflicts: ConflictEvent[];
  selectedConflict: ConflictEvent | null;
  onSelectConflict: (conflict: ConflictEvent) => void;
  onZoomChange?: (zoom: number, filteredConflicts: ConflictEvent[]) => void;
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

function ZoomTracker({
  conflicts,
  onZoomChange,
}: {
  conflicts: ConflictEvent[];
  onZoomChange?: (zoom: number, filteredConflicts: ConflictEvent[]) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const zoom = map.getZoom();
    onZoomChange?.(zoom, getConflictsForZoom(conflicts, zoom));
  }, [conflicts, map, onZoomChange]);

  useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      const filteredConflicts = getConflictsForZoom(conflicts, zoom);
      onZoomChange?.(zoom, filteredConflicts);
    },
  });

  return null;
}

export default function ConflictMap({
  conflicts,
  selectedConflict,
  onSelectConflict,
  onZoomChange,
}: ConflictMapProps) {
  const [mounted, setMounted] = useState(false);
  const [visibleConflicts, setVisibleConflicts] = useState<ConflictEvent[]>(conflicts);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisibleConflicts(conflicts);
  }, [conflicts]);

  const handleZoomChange = (zoom: number, filteredConflicts: ConflictEvent[]) => {
    setVisibleConflicts(filteredConflicts);
    onZoomChange?.(zoom, filteredConflicts);
  };

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
      {visibleConflicts.map((conflict) => (
        <Marker
          key={conflict.id}
          position={[conflict.lat, conflict.lng]}
          icon={createConflictIcon(conflict.severity)}
          eventHandlers={{
            click: () => onSelectConflict(conflict),
          }}
        />
      ))}
      <ZoomTracker conflicts={conflicts} onZoomChange={handleZoomChange} />
      <FlyToSelected conflict={selectedConflict} />
    </MapContainer>
  );
}
