"use client";

import { ConflictEvent, ConflictType, Severity } from "@/lib/types";

const severityConfig: Record<Severity, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-yellow-500" },
  medium: { label: "Medium", color: "bg-orange-500" },
  high: { label: "High", color: "bg-red-500" },
  critical: { label: "Critical", color: "bg-red-700" },
};

const typeLabels: Record<ConflictType, string> = {
  armed_conflict: "Armed Conflict",
  protest: "Protest",
  terrorism: "Terrorism",
  political_violence: "Political Violence",
  territorial_dispute: "Territorial Dispute",
};

interface SidePanelProps {
  conflicts: ConflictEvent[];
  selectedConflict: ConflictEvent | null;
  onSelectConflict: (conflict: ConflictEvent) => void;
  onClose: () => void;
}

function ConflictDetail({
  conflict,
  onClose,
}: {
  conflict: ConflictEvent;
  onClose: () => void;
}) {
  const severity = severityConfig[conflict.severity];

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-lg font-semibold text-white leading-tight pr-2">
          {conflict.title}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white shrink-0 mt-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`${severity.color} text-white text-xs font-medium px-2 py-0.5 rounded`}>
          {severity.label}
        </span>
        <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
          {typeLabels[conflict.type]}
        </span>
        <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
          {conflict.country}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
        {conflict.description}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Date</span>
          <span className="text-gray-200">{new Date(conflict.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Region</span>
          <span className="text-gray-200">{conflict.region}</span>
        </div>
        {conflict.casualties !== undefined && (
          <div className="flex justify-between text-gray-400">
            <span>Reported Casualties</span>
            <span className="text-red-400 font-medium">{conflict.casualties}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-400">
          <span>Data Source</span>
          <span className="text-gray-200">{conflict.source}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Coordinates</span>
          <span className="text-gray-200 font-mono text-xs">
            {conflict.lat.toFixed(4)}, {conflict.lng.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConflictListItem({
  conflict,
  isSelected,
  onClick,
}: {
  conflict: ConflictEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  const severity = severityConfig[conflict.severity];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
        isSelected ? "bg-gray-800/70 border-l-2 border-l-red-500" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`${severity.color} w-2 h-2 rounded-full mt-1.5 shrink-0`} />
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {conflict.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">{conflict.country}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">{conflict.date}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SidePanel({
  conflicts,
  selectedConflict,
  onSelectConflict,
  onClose,
}: SidePanelProps) {
  return (
    <div className="w-full h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          ConflictMap
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Global conflict tracker &middot; {conflicts.length} active events
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedConflict ? (
          <ConflictDetail conflict={selectedConflict} onClose={onClose} />
        ) : (
          <div>
            <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-800">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recent Events
              </span>
            </div>
            {conflicts.map((conflict) => (
              <ConflictListItem
                key={conflict.id}
                conflict={conflict}
                isSelected={selectedConflict === conflict}
                onClick={() => onSelectConflict(conflict)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 text-center space-y-1">
        <p className="text-xs text-gray-600">
          Data: ACLED &middot; GDELT &middot; Open Source
        </p>
        <p className="text-xs text-gray-700">
          Built by <a href="https://laibyrinth.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors">Laibyrinth</a>
        </p>
      </div>
    </div>
  );
}
