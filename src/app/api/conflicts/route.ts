import { NextResponse } from "next/server";
import { fetchConflictsFromBigQuery } from "@/lib/bigquery-fetcher";
import { fallbackConflicts } from "@/lib/fallback-conflicts";

// Force dynamic rendering to bypass Vercel edge cache
export const dynamic = 'force-dynamic';

// Server-side only - BigQuery runs here
export async function GET() {
  try {
    console.log('[API /conflicts] Fetching from BigQuery...');
    
    const conflicts = await fetchConflictsFromBigQuery(24, 50);
    
    const finalConflicts = conflicts.length > 0 ? conflicts : fallbackConflicts;
    
    console.log(`[API /conflicts] Returning ${finalConflicts.length} conflicts (${conflicts.length > 0 ? 'BIGQUERY' : 'FALLBACK'})`);

    return NextResponse.json(
      {
        count: finalConflicts.length,
        conflicts: finalConflicts,
        fetchedAt: new Date().toISOString(),
        source: conflicts.length > 0 ? 'bigquery' : 'fallback',
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600", // 6 hour cache
        },
      },
    );
  } catch (error) {
    console.error("[API /conflicts] BigQuery fetch failed:", error);
    
    // Return fallback data on error
    return NextResponse.json(
      {
        count: fallbackConflicts.length,
        conflicts: fallbackConflicts,
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
