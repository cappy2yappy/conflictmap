import { NextResponse } from "next/server";
import { getConflictEvents } from "@/lib/conflict-data";

// Force dynamic rendering to bypass Vercel edge cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conflicts = await getConflictEvents();

    return NextResponse.json(
      {
        count: conflicts.length,
        conflicts,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[API /conflicts] Failed to fetch conflicts", error);
    return NextResponse.json(
      {
        error: "Unable to load conflict events at the moment.",
        conflicts: [],
      },
      { status: 500 },
    );
  }
}
