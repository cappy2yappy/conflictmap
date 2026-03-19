import { ConflictType } from "./types";

export interface GDELTArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string;
  socialimage?: string;
  tone?: number;
  sourcecountry?: string;
  locations?: string[];
  eventType: ConflictType;
}

interface GDELTDocResponse {
  articles?: Array<{
    title?: string;
    url?: string;
    domain?: string;
    seendate?: string;
    socialimage?: string;
    tone?: number | string;
    sourcecountry?: string;
    locations?: string[] | string;
  }>;
}

const GDELT_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";
const CACHE_TTL_MS = 60 * 60 * 1000;

const QUERY_BY_TYPE: Record<ConflictType, string> = {
  armed_conflict: "conflict OR war OR attack OR military",
  protest: "protest OR demonstration OR rally",
  civil_unrest: "unrest OR riot OR violence",
  labor_strike: "strike OR labor OR walkout",
  terrorism: "terrorism OR terrorist OR attack",
  political_violence: "political violence OR crackdown OR clashes",
  territorial_dispute: "territorial dispute OR border conflict OR annexation",
};

const cache = new Map<string, { timestamp: number; articles: GDELTArticle[] }>();

function normalizeDomain(articleUrl: string, domain?: string): string {
  if (domain && domain.trim().length > 0) {
    return domain.trim().toLowerCase();
  }

  try {
    return new URL(articleUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "unknown";
  }
}

function parseTone(value: number | string | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function parseLocations(locations: string[] | string | undefined): string[] {
  if (Array.isArray(locations)) {
    return locations.filter((location) => Boolean(location && location.trim().length > 0));
  }

  if (typeof locations === "string" && locations.trim().length > 0) {
    return locations
      .split(/[|,;]+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

export async function fetchGDELTEvents(
  eventType: ConflictType,
  maxRecords: number = 50,
): Promise<GDELTArticle[]> {
  const cacheKey = `${eventType}:${maxRecords}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.articles;
  }

  const query = QUERY_BY_TYPE[eventType] ?? QUERY_BY_TYPE.armed_conflict;
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: String(maxRecords),
    format: "json",
    sort: "datedesc",
    timespan: "7d",
    sourcelang: "eng",
  });

  try {
    const response = await fetch(`${GDELT_ENDPOINT}?${params.toString()}`, {
      headers: {
        "User-Agent": "ConflictMap/1.0 (+https://conflictmap-kappa.vercel.app)",
      },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      console.error(`[GDELT] ${eventType} request failed with status ${response.status}`);
      return [];
    }

    const data = (await response.json()) as GDELTDocResponse;
    const articles = (data.articles ?? [])
      .map((article) => {
        const url = article.url?.trim() ?? "";
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return null;
        }

        return {
          title: (article.title ?? "Untitled").trim() || "Untitled",
          url,
          domain: normalizeDomain(url, article.domain),
          seendate: article.seendate ?? new Date().toISOString(),
          socialimage: article.socialimage,
          tone: parseTone(article.tone),
          sourcecountry: article.sourcecountry?.trim(),
          locations: parseLocations(article.locations),
          eventType,
        } satisfies GDELTArticle;
      })
      .filter((article) => article !== null) as GDELTArticle[];

    cache.set(cacheKey, { timestamp: Date.now(), articles });
    return articles;
  } catch (error) {
    console.error(`[GDELT] ${eventType} fetch error`, error);
    return [];
  }
}
