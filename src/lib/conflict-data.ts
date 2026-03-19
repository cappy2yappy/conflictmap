import { fetchGDELTEvents } from "./gdelt-fetcher";
import { parseGDELTtoConflicts } from "./gdelt-parser";
import { ConflictEvent, ConflictType } from "./types";

const EVENT_TYPES: ConflictType[] = [
  "armed_conflict",
  "protest",
  "civil_unrest",
  "labor_strike",
  "terrorism",
];

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_ARTICLES_PER_TYPE = 40; // Increased since we filter out non-English
const TARGET_EVENT_COUNT = 30;

let eventCache: { timestamp: number; events: ConflictEvent[] } | null = null;

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function severityRank(severity: ConflictEvent["severity"]): number {
  const ranks: Record<ConflictEvent["severity"], number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return ranks[severity];
}

function deduplicateConflicts(conflicts: ConflictEvent[]): ConflictEvent[] {
  const byUrl = new Set<string>();
  const byFingerprint = new Set<string>();
  const deduped: ConflictEvent[] = [];

  for (const conflict of conflicts) {
    if (byUrl.has(conflict.sourceUrl)) {
      continue;
    }

    const fingerprint = `${normalizeTitle(conflict.title)}:${conflict.country}:${conflict.type}`;
    if (byFingerprint.has(fingerprint)) {
      continue;
    }

    byUrl.add(conflict.sourceUrl);
    byFingerprint.add(fingerprint);
    deduped.push(conflict);
  }

  return deduped;
}

function sortConflicts(conflicts: ConflictEvent[]): ConflictEvent[] {
  return [...conflicts].sort((a, b) => {
    const severityDifference = severityRank(b.severity) - severityRank(a.severity);
    if (severityDifference !== 0) {
      return severityDifference;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConflictEvents(): Promise<ConflictEvent[]> {
  // Skip cache if it's empty (failed fetch) or expired
  if (eventCache && Date.now() - eventCache.timestamp < CACHE_TTL_MS && eventCache.events.length > 0) {
    return eventCache.events;
  }

  // Fetch sequentially with delays to avoid rate limiting
  const allArticles = [];
  
  for (const eventType of EVENT_TYPES) {
    try {
      const articles = await fetchGDELTEvents(eventType, MAX_ARTICLES_PER_TYPE);
      allArticles.push(...articles);
      
      // Wait 2 seconds between requests to avoid rate limiting
      if (eventType !== EVENT_TYPES[EVENT_TYPES.length - 1]) {
        await sleep(2000);
      }
    } catch (error) {
      console.error(`[Conflict Data] Failed to fetch ${eventType}`, error);
    }
  }

  const parsedConflicts = await parseGDELTtoConflicts(allArticles);
  const dedupedConflicts = deduplicateConflicts(parsedConflicts);
  const sortedConflicts = sortConflicts(dedupedConflicts).slice(0, TARGET_EVENT_COUNT);

  eventCache = {
    timestamp: Date.now(),
    events: sortedConflicts,
  };

  return sortedConflicts;
}

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
