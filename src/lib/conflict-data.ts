import { ConflictEvent } from "./types";

// Helper function to filter conflicts based on zoom level
export function getConflictsForZoom(conflicts: ConflictEvent[], zoom: number): ConflictEvent[] {
  if (zoom <= 4) {
    const strategic = conflicts.filter((conflict) => conflict.zoomLevel === "strategic");
    return strategic.length > 0 ? strategic : conflicts.slice(0, Math.min(conflicts.length, 15));
  }

  if (zoom <= 8) {
    const regional = conflicts.filter((conflict) => conflict.zoomLevel !== "local");
    return regional.length > 0 ? regional : conflicts;
  }

  return conflicts;
}
