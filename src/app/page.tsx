"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SidePanel from "@/components/SidePanel";
import { ConflictEvent } from "@/lib/types";
import { sampleConflicts } from "@/lib/sample-data";

const ConflictMap = dynamic(() => import("@/components/ConflictMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const [selectedConflict, setSelectedConflict] =
    useState<ConflictEvent | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const handleSelectConflict = (conflict: ConflictEvent) => {
    setSelectedConflict(conflict);
    setPanelOpen(true);
  };

  const handleClose = () => {
    setSelectedConflict(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Side Panel */}
      <div
        className={`${
          panelOpen ? "w-80" : "w-0"
        } transition-all duration-300 shrink-0 overflow-hidden`}
      >
        <SidePanel
          conflicts={sampleConflicts}
          selectedConflict={selectedConflict}
          onSelectConflict={handleSelectConflict}
          onClose={handleClose}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <ConflictMap
          conflicts={sampleConflicts}
          selectedConflict={selectedConflict}
          onSelectConflict={handleSelectConflict}
        />

        {/* Toggle panel button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-4 left-4 z-[1000] bg-gray-900/90 hover:bg-gray-800 text-white p-2 rounded-lg border border-gray-700 backdrop-blur-sm"
          title={panelOpen ? "Hide panel" : "Show panel"}
        >
          <svg
            className={`w-5 h-5 transition-transform ${panelOpen ? "" : "rotate-180"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-[1000] bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Severity
          </h3>
          <div className="space-y-1.5">
            {[
              { color: "bg-red-700", label: "Critical" },
              { color: "bg-red-500", label: "High" },
              { color: "bg-orange-500", label: "Medium" },
              { color: "bg-yellow-500", label: "Low" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`${item.color} w-2.5 h-2.5 rounded-full`} />
                <span className="text-xs text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
