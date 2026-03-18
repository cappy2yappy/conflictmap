/**
 * Multi-source news aggregator with fallback and caching
 * Tries GDELT → NewsAPI → Google News RSS
 */

import { NewsArticle } from "./types";

// Simple in-memory cache (1 hour TTL)
const newsCache = new Map<string, { articles: NewsArticle[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Article count based on severity
 */
const ARTICLE_LIMITS = {
  critical: 5,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Fetch news from Google News RSS (always works, no API key needed)
 */
async function fetchGoogleNews(
  location: string,
  keywords: string[]
): Promise<NewsArticle[]> {
  try {
    const query = `${location} ${keywords.join(" OR ")}`;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // Parse RSS XML (simple extraction)
    const articles: NewsArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      
      if (titleMatch && linkMatch) {
        // Extract source from title (Google News format: "Title - Source")
        const fullTitle = titleMatch[1];
        const titleParts = fullTitle.split(" - ");
        const title = titleParts[0];
        const source = titleParts[titleParts.length - 1] || "Google News";
        
        articles.push({
          title,
          url: linkMatch[1],
          source,
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          description: descMatch ? descMatch[1].replace(/<[^>]*>/g, "").substring(0, 150) : "",
        });
      }
      
      if (articles.length >= 10) break; // Limit to 10 articles
    }
    
    return articles;
  } catch (error) {
    console.error("Google News fetch failed:", error);
    return [];
  }
}

/**
 * Fetch news from GDELT (primary source)
 */
async function fetchGDELT(
  location: string,
  keywords: string[]
): Promise<NewsArticle[]> {
  try {
    const query = `${location} ${keywords.join(" ")}`;
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json`;
    
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) throw new Error(`GDELT API error: ${response.status}`);
    
    const data = await response.json();
    
    if (!data.articles) return [];
    
    interface GDELTArticle {
      title: string;
      url: string;
      domain?: string;
      seendate?: string;
    }
    
    return data.articles.map((article: GDELTArticle) => ({
      title: article.title,
      url: article.url,
      source: article.domain || "GDELT",
      publishedAt: article.seendate || new Date().toISOString(),
      description: "",
    }));
  } catch (error) {
    console.error("GDELT fetch failed:", error);
    return [];
  }
}

/**
 * Main news aggregator with fallback and caching
 */
export async function fetchNewsWithFallback(
  location: string,
  keywords: string[],
  severity: "low" | "medium" | "high" | "critical" = "medium"
): Promise<NewsArticle[]> {
  // Check cache first
  const cacheKey = `${location}-${keywords.join(",")}`;
  const cached = newsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[News Cache] Hit for ${location}`);
    return cached.articles.slice(0, ARTICLE_LIMITS[severity]);
  }
  
  console.log(`[News] Fetching for ${location}...`);
  
  let articles: NewsArticle[] = [];
  
  // Use Google News as primary (GDELT is rate-limited)
  articles = await fetchGoogleNews(location, keywords);
  
  // Fallback to GDELT if Google News fails
  if (articles.length === 0) {
    console.log(`[News] Google News failed, trying GDELT for ${location}`);
    articles = await fetchGDELT(location, keywords);
  }
  
  // Cache the results
  if (articles.length > 0) {
    newsCache.set(cacheKey, {
      articles,
      timestamp: Date.now(),
    });
  }
  
  // Return limited by severity
  const limit = ARTICLE_LIMITS[severity];
  return articles.slice(0, limit);
}

/**
 * Clear expired cache entries (call periodically)
 */
export function clearExpiredCache() {
  const now = Date.now();
  const entries = Array.from(newsCache.entries());
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      newsCache.delete(key);
    }
  });
}
