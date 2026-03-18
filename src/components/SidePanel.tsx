"use client";

import { ConflictEvent, ConflictType, Severity } from "@/lib/types";
import { useState, useEffect } from "react";
import { getRelevantAccounts, buildTwitterSearchURL } from "@/lib/twitter-accounts";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

const severityConfig: Record<Severity, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-yellow-500" },
  medium: { label: "Medium", color: "bg-orange-500" },
  high: { label: "High", color: "bg-red-500" },
  critical: { label: "Critical", color: "bg-red-700" },
};

const typeLabels: Record<ConflictType, string> = {
  armed_conflict: "Armed Conflict",
  protest: "Protest",
  civil_unrest: "Civil Unrest",
  terrorism: "Terrorism",
  political_violence: "Political Violence",
  territorial_dispute: "Territorial Dispute",
  labor_strike: "Labor Strike",
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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [showAllNews, setShowAllNews] = useState(false);

  // Fetch news articles when conflict changes
  useEffect(() => {
    setLoadingNews(true);
    setShowAllNews(false);
    
    fetch(`/api/news?location=${encodeURIComponent(conflict.country)}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.articles || []);
        setLoadingNews(false);
      })
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setLoadingNews(false);
      });
  }, [conflict.country]);

  const displayedNews = showAllNews ? news : news.slice(0, 5);

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

      {/* News Articles Section */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            📰 Recent News {!loadingNews && `(${news.length})`}
          </h3>
        </div>

        {loadingNews ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No recent news for this location
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {displayedNews.map((article, idx) => (
                <a
                  key={idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded hover:bg-gray-800/50 transition-colors group"
                >
                  <h4 className="text-sm text-gray-200 group-hover:text-white line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{article.source}</span>
                    <span>·</span>
                    <span>{article.publishedAt}</span>
                  </div>
                </a>
              ))}
            </div>

            {news.length > 5 && (
              <button
                onClick={() => setShowAllNews(!showAllNews)}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {showAllNews ? `Show less` : `View all ${news.length} articles`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Twitter/Social Media Section */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            🐦 Social Media Updates
          </h3>
        </div>

        <p className="text-sm text-gray-400 mb-3">
          Real-time updates from verified OSINT accounts
        </p>

        {(() => {
          const relevantAccounts = getRelevantAccounts(conflict.country);
          const twitterURL = buildTwitterSearchURL(
            conflict.country,
            relevantAccounts.slice(0, 5).map(a => a.handle)
          );

          return (
            <>
              <div className="space-y-2 mb-3">
                {relevantAccounts.slice(0, 5).map((account) => (
                  <a
                    key={account.handle}
                    href={`https://twitter.com/${account.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {account.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-200 group-hover:text-white font-medium truncate">
                          {account.name}
                        </span>
                        {account.verified && (
                          <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        @{account.handle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              <a
                href={twitterURL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-sm font-medium rounded transition-colors text-center"
              >
                View live updates on Twitter →
              </a>
            </>
          );
        })()}
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
