"use client";

import { ConflictType, Severity } from "@/lib/types";
import { useState } from "react";

const TYPE_OPTIONS: { value: ConflictType; label: string }[] = [
  { value: "armed_conflict", label: "Armed Conflict" },
  { value: "protest", label: "Protest" },
  { value: "civil_unrest", label: "Civil Unrest" },
  { value: "terrorism", label: "Terrorism" },
  { value: "political_violence", label: "Political Violence" },
  { value: "territorial_dispute", label: "Territorial Dispute" },
  { value: "labor_strike", label: "Labor Strike" },
];

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-red-700" },
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-orange-500" },
  { value: "low", label: "Low", color: "bg-yellow-500" },
];

export interface Filters {
  types: Set<ConflictType>;
  severities: Set<Severity>;
  region: string; // empty string = all regions
}

export const DEFAULT_FILTERS: Filters = {
  types: new Set<ConflictType>(),
  severities: new Set<Severity>(),
  region: "",
};

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  regions: string[]; // unique region list derived from data
  totalCount: number;
  filteredCount: number;
}

export default function FilterPanel({
  filters,
  onChange,
  regions,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters =
    filters.types.size > 0 ||
    filters.severities.size > 0 ||
    filters.region !== "";

  const toggleType = (type: ConflictType) => {
    const next = new Set(filters.types);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onChange({ ...filters, types: next });
  };

  const toggleSeverity = (sev: Severity) => {
    const next = new Set(filters.severities);
    if (next.has(sev)) next.delete(sev);
    else next.add(sev);
    onChange({ ...filters, severities: next });
  };

  const setRegion = (region: string) => {
    onChange({ ...filters, region });
  };

  const clearAll = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="border-b border-gray-800">
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Filters
          </span>
          {hasActiveFilters && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">
              {filteredCount}/{totalCount}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter content */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          {/* Severity */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">
              Severity
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITY_OPTIONS.map((opt) => {
                const active = filters.severities.has(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleSeverity(opt.value)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-colors ${
                      active
                        ? "border-gray-500 bg-gray-700 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                    }`}
                  >
                    <span className={`${opt.color} w-2 h-2 rounded-full`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">
              Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => {
                const active = filters.types.has(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleType(opt.value)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      active
                        ? "border-gray-500 bg-gray-700 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gray-500"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
