import { NextRequest, NextResponse } from "next/server";
import { fetchNewsWithFallback } from "@/lib/news-aggregator";
import { Severity } from "@/lib/types";

/**
 * GET /api/news?location=Ukraine&keywords=conflict,war&severity=high
 * 
 * Fetches news articles for a specific conflict location with severity-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const location = searchParams.get("location");
    const keywordsParam = searchParams.get("keywords");
    const severity = (searchParams.get("severity") || "medium") as Severity;
    
    if (!location) {
      return NextResponse.json(
        { error: "Missing required parameter: location" },
        { status: 400 }
      );
    }

    // Parse keywords (comma-separated)
    const keywords = keywordsParam 
      ? keywordsParam.split(",").map(k => k.trim())
      : ["conflict", "war", "attack", "violence", "protest", "strike"];

    const articles = await fetchNewsWithFallback(location, keywords, severity);

    return NextResponse.json({
      location,
      severity,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news articles" },
      { status: 500 }
    );
  }
}
