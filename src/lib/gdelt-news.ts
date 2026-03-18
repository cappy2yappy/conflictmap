// GDELT DOC API - News article fetcher

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  seenDate: string;
}

interface GDELTDocResponse {
  articles: Array<{
    title: string;
    url: string;
    domain: string;
    seendate: string;
    socialimage?: string;
  }>;
}

/**
 * Fetch news articles from GDELT DOC API
 * @param query Search keywords (e.g., "Ukraine conflict", "Gaza war")
 * @param timespan Time range: "1d", "7d", "30d" (default: "7d")
 * @param maxRecords Max articles to return (default: 50)
 */
export async function fetchGDELTNews(
  query: string,
  timespan: string = "7d",
  maxRecords: number = 50
): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams({
      query,
      mode: "artlist",
      format: "json",
      timespan,
      maxrecords: maxRecords.toString(),
      sourcelang: "eng",
    });

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
    
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      console.error("GDELT API error:", response.status);
      return [];
    }

    const data: GDELTDocResponse = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    // Transform GDELT format to our NewsArticle format
    return data.articles.map((article) => ({
      title: article.title || "Untitled",
      url: article.url,
      source: extractDomain(article.domain || article.url),
      publishedAt: formatDate(article.seendate),
      imageUrl: article.socialimage,
      seenDate: article.seendate,
    }));
  } catch (error) {
    console.error("Error fetching GDELT news:", error);
    return [];
  }
}

/**
 * Extract clean domain name from URL
 * e.g., "www.reuters.com" → "Reuters"
 */
function extractDomain(domain: string): string {
  // Remove www. and .com/.org/.net
  const clean = domain.replace(/^www\./, "").replace(/\.(com|org|net|co\.uk|io)$/, "");
  
  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Format GDELT date (YYYYMMDDHHMMSS) to relative time
 * e.g., "20260318120000" → "2 hours ago"
 */
function formatDate(gdeltDate: string): string {
  try {
    // Parse GDELT date format: YYYYMMDDHHMMSS
    const year = parseInt(gdeltDate.substring(0, 4));
    const month = parseInt(gdeltDate.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(gdeltDate.substring(6, 8));
    const hour = parseInt(gdeltDate.substring(8, 10));
    const minute = parseInt(gdeltDate.substring(10, 12));
    const second = parseInt(gdeltDate.substring(12, 14));

    const date = new Date(year, month, day, hour, minute, second);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Fallback: format as date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

/**
 * Fetch news for a specific conflict by location and keywords
 * Combines location name + conflict type for better results
 */
export async function fetchConflictNews(
  location: string,
  keywords: string[] = ["conflict", "war", "attack"]
): Promise<NewsArticle[]> {
  // Build query: location + any keyword
  const query = `${location} (${keywords.join(" OR ")})`;
  
  return fetchGDELTNews(query, "7d", 20);
}
