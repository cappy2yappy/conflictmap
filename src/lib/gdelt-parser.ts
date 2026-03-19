import { geocodeLocation } from "./geocoding";
import { GDELTArticle } from "./gdelt-fetcher";
import { ConflictEvent, ConflictType, Severity, ZoomLevel } from "./types";

const TYPE_LABELS: Record<ConflictType, string> = {
  armed_conflict: "Armed conflict",
  protest: "Protest",
  civil_unrest: "Civil unrest",
  labor_strike: "Labor strike",
  terrorism: "Terrorism",
  political_violence: "Political violence",
  territorial_dispute: "Territorial dispute",
};

function parseGDELTDate(input: string): string {
  const normalized = input.replace(/[^0-9]/g, "");

  if (normalized.length >= 8) {
    const year = Number.parseInt(normalized.slice(0, 4), 10);
    const month = Number.parseInt(normalized.slice(4, 6), 10) - 1;
    const day = Number.parseInt(normalized.slice(6, 8), 10);
    const hour = Number.parseInt(normalized.slice(8, 10) || "0", 10);
    const minute = Number.parseInt(normalized.slice(10, 12) || "0", 10);
    const second = Number.parseInt(normalized.slice(12, 14) || "0", 10);

    const date = new Date(Date.UTC(year, month, day, hour, minute, second));
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  const fallback = new Date(input);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }

  return new Date().toISOString();
}

function cleanCandidate(candidate: string): string {
  return candidate
    .replace(/[\]\[()]/g, "")
    .replace(/[.,;:!?]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLocationCandidate(article: GDELTArticle): string | null {
  if (article.locations && article.locations.length > 0) {
    const candidate = cleanCandidate(article.locations[0]);
    if (candidate) {
      return candidate;
    }
  }

  const title = article.title;
  const prefixMatch = title.match(/^([A-Z][A-Za-z'\-.]*(?:\s+[A-Z][A-Za-z'\-.]*){0,2})\s*[-:]/);
  if (prefixMatch?.[1]) {
    const candidate = cleanCandidate(prefixMatch[1]);
    if (candidate.length >= 3) {
      return candidate;
    }
  }

  const inMatch = title.match(/\b(?:in|near|at|from)\s+([A-Z][A-Za-z'\-.]*(?:\s+[A-Z][A-Za-z'\-.]*){0,2})/);
  if (inMatch?.[1]) {
    const candidate = cleanCandidate(inMatch[1]);
    if (candidate.length >= 3) {
      return candidate;
    }
  }

  if (article.sourcecountry) {
    return article.sourcecountry;
  }

  return null;
}

function inferToneFromTitle(title: string): number {
  const lowered = title.toLowerCase();

  if (/(massacre|airstrike|bombing|killed|dead|slain|shelling)/.test(lowered)) {
    return -7;
  }

  if (/(attack|clash|violence|riot|terror|assault|offensive)/.test(lowered)) {
    return -4;
  }

  if (/(protest|demonstration|strike|walkout|rally)/.test(lowered)) {
    return -1;
  }

  return 1;
}

function toneToSeverity(tone: number): Severity {
  if (tone < -5) {
    return "critical";
  }

  if (tone < -2) {
    return "high";
  }

  if (tone <= 0) {
    return "medium";
  }

  return "low";
}

function severityToZoomLevel(severity: Severity): ZoomLevel {
  if (severity === "critical" || severity === "high") {
    return "strategic";
  }

  if (severity === "medium") {
    return "regional";
  }

  return "local";
}

function buildDescription(article: GDELTArticle, locationName: string): string {
  const typeLabel = TYPE_LABELS[article.eventType];
  const sourceLabel = article.domain || "news source";
  return `${typeLabel} reported in ${locationName}. Source coverage: ${sourceLabel}.`;
}

export async function parseGDELTtoConflicts(
  articles: GDELTArticle[],
): Promise<ConflictEvent[]> {
  const conflicts: ConflictEvent[] = [];
  const seenUrls = new Set<string>();

  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];

    if (seenUrls.has(article.url)) {
      continue;
    }

    const locationCandidate = extractLocationCandidate(article);
    if (!locationCandidate) {
      continue;
    }

    let geocoded = await geocodeLocation(locationCandidate);

    if (!geocoded && article.sourcecountry && article.sourcecountry !== locationCandidate) {
      geocoded = await geocodeLocation(article.sourcecountry);
    }

    if (!geocoded) {
      continue;
    }

    const tone = article.tone ?? inferToneFromTitle(article.title);
    const severity = toneToSeverity(tone);
    const date = parseGDELTDate(article.seendate);

    const conflict: ConflictEvent = {
      id: `gdelt-${date}-${index}`,
      title: article.title,
      description: buildDescription(article, locationCandidate),
      lat: geocoded.lat,
      lng: geocoded.lng,
      date,
      type: article.eventType,
      severity,
      source: article.domain,
      sourceUrl: article.url,
      country: geocoded.country || article.sourcecountry || "Unknown",
      region: geocoded.region || geocoded.country || "Unknown",
      zoomLevel: severityToZoomLevel(severity),
    };

    conflicts.push(conflict);
    seenUrls.add(article.url);
  }

  return conflicts;
}
