import L from "leaflet";
import { Severity } from "./types";

const severityColors: Record<Severity, string> = {
  low: "#facc15",
  medium: "#f97316",
  high: "#ef4444",
  critical: "#dc2626",
};

export function createConflictIcon(severity: Severity): L.DivIcon {
  const color = severityColors[severity];
  const size = severity === "critical" ? 16 : severity === "high" ? 14 : 12;

  return L.divIcon({
    className: "conflict-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 6px ${color}, 0 0 12px ${color}80;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
