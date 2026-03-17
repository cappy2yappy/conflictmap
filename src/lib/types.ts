export type ConflictType =
  | "armed_conflict"
  | "protest"
  | "terrorism"
  | "political_violence"
  | "territorial_dispute";

export type Severity = "low" | "medium" | "high" | "critical";

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
}
