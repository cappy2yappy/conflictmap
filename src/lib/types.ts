export type ConflictType =
  | "armed_conflict"
  | "protest"
  | "civil_unrest"
  | "terrorism"
  | "political_violence"
  | "territorial_dispute"
  | "labor_strike";

export type Severity = "low" | "medium" | "high" | "critical";

export type ZoomLevel = "strategic" | "regional" | "local";

export interface ConflictEvent {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
  type: ConflictType;
  severity: Severity;
  casualties?: number;
  source: string;
  country: string;
  region: string;
  zoomLevel: ZoomLevel;
  parentId?: string; // Link to parent conflict (for sub-events)
  subEventCount?: number; // Number of child events
}
