import { NextResponse } from "next/server";
import { fetchConflictsFromBigQuery } from "@/lib/bigquery-fetcher";
import { fallbackConflicts, usFallbackConflicts } from "@/lib/fallback-conflicts";

// Force dynamic rendering to bypass Vercel edge cache
export const dynamic = 'force-dynamic';

// Minimum number of US events we want on the map
const MIN_US_EVENTS = 5;

/**
 * Merge US fallback events into BigQuery results when US coverage is thin.
 * Deduplicates by checking lat/lng proximity (within ~0.05 degrees ≈ 5km).
 */
function ensureUSCoverage(conflicts: ConflictEvent[]): ConflictEvent[] {
  const usCount = conflicts.filter(c => c.country === 'United States').length;

  if (usCount >= MIN_US_EVENTS) {
    console.log(`[API] US coverage OK: ${usCount} events`);
    return conflicts;
  }

  // Need more US events — merge in fallback data
  const existingCoords = new Set(
    conflicts.map(c => `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`)
  );

  const needed = MIN_US_EVENTS - usCount;
  const extras = usFallbackConflicts
    .filter(fb => !existingCoords.has(`${fb.lat.toFixed(2)},${fb.lng.toFixed(2)}`))
    .slice(0, needed);

  console.log(`[API] US coverage low (${usCount}), adding ${extras.length} fallback US events`);

  return [...conflicts, ...extras];
}

// Need the type for the helper above
import type { ConflictEvent } from "@/lib/types";

// Server-side only - BigQuery runs here
export async function GET() {
  try {
    console.log('[API /conflicts] Fetching from BigQuery...');

    const conflicts = await fetchConflictsFromBigQuery(24, 50);

    // Use BigQuery results if we got any, otherwise full fallback
    let finalConflicts = conflicts.length > 0 ? conflicts : [...fallbackConflicts, ...usFallbackConflicts];

    // Always ensure the US is well-represented
    finalConflicts = ensureUSCoverage(finalConflicts);

    const source = conflicts.length > 0 ? 'bigquery' : 'fallback';
    console.log(`[API /conflicts] Returning ${finalConflicts.length} conflicts (${source})`);

    return NextResponse.json(
      {
        count: finalConflicts.length,
        conflicts: finalConflicts,
        fetchedAt: new Date().toISOString(),
        source,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600", // 6 hour cache
        },
      },
    );
  } catch (error) {
    console.error("[API /conflicts] BigQuery fetch failed:", error);

    // Return all fallback data (global + US) on error
    const allFallback = [...fallbackConflicts, ...usFallbackConflicts];

    return NextResponse.json(
      {
        count: allFallback.length,
        conflicts: allFallback,
        fetchedAt: new Date().toISOString(),
        source: 'fallback',
        error: 'BigQuery unavailable',
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60", // 5 min cache on error
        },
      },
    );
  }
}
