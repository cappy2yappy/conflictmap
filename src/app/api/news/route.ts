import { NextRequest, NextResponse } from "next/server";
import { fetchConflictNews } from "@/lib/gdelt-news";

/**
 * GET /api/news?location=Ukraine&keywords=conflict,war
 * 
 * Fetches news articles for a specific conflict location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const location = searchParams.get("location");
    const keywordsParam = searchParams.get("keywords");
    
    if (!location) {
      return NextResponse.json(
        { error: "Missing required parameter: location" },
        { status: 400 }
      );
    }

    // Parse keywords (comma-separated)
    const keywords = keywordsParam 
      ? keywordsParam.split(",").map(k => k.trim())
      : ["conflict", "war", "attack", "violence"];

    const articles = await fetchConflictNews(location, keywords);

    return NextResponse.json({
      location,
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
