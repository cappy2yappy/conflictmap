import { BigQuery } from '@google-cloud/bigquery';
import { ConflictEvent, ConflictType, Severity } from './types';

// Initialize BigQuery with credentials
// For local dev: reads from file
// For Vercel: reads from BIGQUERY_CREDENTIALS_JSON environment variable
const getBigQueryClient = () => {
  if (process.env.BIGQUERY_CREDENTIALS_JSON) {
    // Vercel/production: use environment variable (base64 encoded)
    const credentials = JSON.parse(
      Buffer.from(process.env.BIGQUERY_CREDENTIALS_JSON, 'base64').toString('utf-8')
    );
    return new BigQuery({
      projectId: 'conflictmap-490800',
      credentials,
    });
  } else {
    // Local dev: use file
    return new BigQuery({
      projectId: 'conflictmap-490800',
      keyFilename: '/Users/cappy/.openclaw/workspace/projects/conflictmap/bigquery-credentials.json',
    });
  }
};

const bigquery = getBigQueryClient();

interface GDELTEvent {
  SQLDATE: number; // BigQuery returns this as an integer (YYYYMMDD)
  Actor1Name: string | null;
  Actor2Name: string | null;
  EventCode: string;
  GoldsteinScale: number;
  NumMentions: number;
  ActionGeo_FullName: string | null;
  ActionGeo_Lat: number | null;
  ActionGeo_Long: number | null;
  SOURCEURL: string | null;
  AvgTone: number;
}

// Event code ranges for different conflict types
const EVENT_CODE_RANGES = {
  armed_conflict: ['18', '19', '20'], // Attack, Fight, Use unconventional violence
  protest: ['14'], // Protest
  civil_unrest: ['14', '15'], // Protest, Exhibit force posture
  terrorism: ['18', '20'], // Assault, Use unconventional violence
  political_violence: ['15', '17', '18'], // Exhibit force posture, Coerce, Assault
};

function mapEventCodeToType(eventCode: string): ConflictType {
  const code = eventCode.substring(0, 2);
  
  if (EVENT_CODE_RANGES.armed_conflict.includes(code)) {
    return 'armed_conflict';
  }
  if (EVENT_CODE_RANGES.protest.includes(code)) {
    return 'protest';
  }
  if (EVENT_CODE_RANGES.civil_unrest.includes(code)) {
    return 'civil_unrest';
  }
  if (EVENT_CODE_RANGES.terrorism.includes(code)) {
    return 'terrorism';
  }
  if (EVENT_CODE_RANGES.political_violence.includes(code)) {
    return 'political_violence';
  }
  
  return 'civil_unrest'; // Default fallback
}

function mapGoldsteinToSeverity(goldstein: number, numMentions: number): Severity {
  // Goldstein scale: -10 (most negative) to +10 (most positive)
  // More negative = more severe conflict
  // Higher mentions = more important
  
  const mentionBoost = numMentions > 50 ? 1 : 0;
  
  if (goldstein <= -8 || (goldstein <= -6 && mentionBoost)) {
    return 'critical';
  }
  if (goldstein <= -5 || (goldstein <= -4 && mentionBoost)) {
    return 'high';
  }
  if (goldstein <= -2) {
    return 'medium';
  }
  return 'low';
}

function extractCountryFromLocation(location: string | null): string {
  if (!location) return 'Unknown';
  
  // GDELT locations are in format: "City, Region, Country"
  const parts = location.split(',').map(s => s.trim());
  if (parts.length >= 3) {
    return parts[parts.length - 1]; // Last part is usually country
  }
  if (parts.length === 2) {
    return parts[1];
  }
  return parts[0] || 'Unknown';
}

function extractRegionFromLocation(location: string | null): string {
  if (!location) return 'Unknown';
  
  const parts = location.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // Second to last is usually region/state
  }
  return parts[0] || 'Unknown';
}

// GDELT actor names that are generic roles, occupations, or noise — not useful in titles
const ACTOR_NAME_BLOCKLIST = new Set([
  'DETECTIVE', 'TELEVISION', 'RADIO', 'MEDIA', 'JOURNALIST', 'REPORTER',
  'PRESIDENT', 'MINISTER', 'GOVERNOR', 'MAYOR', 'SENATOR', 'CONGRESSMAN',
  'CITIZEN', 'CIVILIAN', 'RESIDENT', 'IMMIGRANT', 'REFUGEE', 'MIGRANT',
  'POLICE', 'OFFICER', 'SOLDIER', 'MILITARY', 'ARMY', 'NAVY',
  'JUDGE', 'LAWYER', 'ATTORNEY', 'COURT', 'HOSPITAL', 'SCHOOL',
  'DOCTOR', 'NURSE', 'TEACHER', 'STUDENT', 'WORKER', 'DRIVER',
  'COMPANY', 'CORPORATION', 'BUSINESS', 'ORGANIZATION', 'GROUP',
  'MAN', 'WOMAN', 'BOY', 'GIRL', 'CHILD', 'PERSON', 'PEOPLE',
  'SUSPECT', 'VICTIM', 'WITNESS', 'CRIMINAL', 'PRISONER', 'INMATE',
  'ACTOR', 'SINGER', 'ATHLETE', 'PLAYER', 'COACH', 'DIRECTOR',
  'SPOKESMAN', 'SPOKESPERSON', 'OFFICIAL', 'AUTHORITY', 'LEADER',
  'UNITED', 'STATES', 'GOVERNMENT', 'OPPOSITION', 'REBEL', 'ACTIVIST',
  'COMMUNITY', 'NETWORK', 'AGENCY', 'DEPARTMENT', 'MINISTRY',
  'SOURCE', 'CORRESPONDENT', 'EDITOR', 'PRODUCER', 'ANCHOR',
  'COUNTY', 'CITY', 'STATE', 'REGION', 'AREA', 'DISTRICT',
]);

/**
 * Clean a GDELT actor name. Returns null if the name is generic/useless.
 * Converts ALL-CAPS to Title Case for real names.
 */
function cleanActorName(raw: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (trimmed.length <= 2) return null; // Single letters, initials
  if (ACTOR_NAME_BLOCKLIST.has(trimmed.toUpperCase())) return null;

  // Filter out names that are all-caps single generic words
  // (multi-word all-caps names like "HAMAS" or "NATO" are probably real)
  const words = trimmed.split(/\s+/);
  if (words.length === 1 && trimmed === trimmed.toUpperCase() && trimmed.length < 6) {
    return null; // Short all-caps single words are usually noise
  }

  // Convert ALL CAPS to Title Case (e.g., "HAMAS" stays, "JOHN SMITH" → "John Smith")
  // Keep acronyms (<=5 chars all caps) as-is
  if (trimmed === trimmed.toUpperCase()) {
    if (trimmed.length <= 5 && words.length === 1) {
      return trimmed; // Likely an acronym: NATO, FARC, Hamas
    }
    return words
      .map(w => w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  }

  return trimmed;
}

function generateTitle(event: GDELTEvent): string {
  const type = mapEventCodeToType(event.EventCode);
  const location = extractCountryFromLocation(event.ActionGeo_FullName);
  const city = extractCityFromLocation(event.ActionGeo_FullName);

  const actor1 = cleanActorName(event.Actor1Name);
  const actor2 = cleanActorName(event.Actor2Name);

  // Location string: prefer "City, Country" when available
  const locationStr = city && city !== location ? `${city}, ${location}` : location;

  // Build natural-sounding titles based on event type
  if (actor1 && actor2) {
    return `${titleForType(type)} Between ${actor1} and ${actor2} in ${locationStr}`;
  }
  if (actor1) {
    return `${titleForType(type)} Involving ${actor1} in ${locationStr}`;
  }

  // No usable actors — use location-focused template
  return `${titleForType(type)} Reported in ${locationStr}`;
}

function titleForType(type: ConflictType): string {
  const labels: Record<ConflictType, string> = {
    armed_conflict: 'Armed Conflict',
    protest: 'Protest Activity',
    civil_unrest: 'Civil Unrest',
    terrorism: 'Terrorist Incident',
    political_violence: 'Political Violence',
    territorial_dispute: 'Territorial Dispute',
    labor_strike: 'Labor Strike',
  };
  return labels[type] || 'Conflict Event';
}

function extractCityFromLocation(location: string | null): string | null {
  if (!location) return null;
  const parts = location.split(',').map(s => s.trim());
  // GDELT format: "City, Region, Country" — first part is city
  return parts.length >= 3 ? parts[0] : null;
}

function generateDescription(event: GDELTEvent): string {
  const severity = mapGoldsteinToSeverity(event.GoldsteinScale, event.NumMentions);
  const location = event.ActionGeo_FullName || 'Unknown location';
  
  let desc = `${severity.toUpperCase()} severity event reported in ${location}. `;
  desc += `Goldstein scale: ${event.GoldsteinScale.toFixed(1)}. `;
  desc += `Mentioned in ${event.NumMentions} sources. `;
  
  if (event.SOURCEURL) {
    const domain = new URL(event.SOURCEURL).hostname.replace('www.', '');
    desc += `Source: ${domain}`;
  }
  
  return desc;
}

function mapGDELTRows(rows: GDELTEvent[], idPrefix: string): ConflictEvent[] {
  return rows
    .filter((row: GDELTEvent) => row.ActionGeo_Lat && row.ActionGeo_Long)
    .map((row: GDELTEvent, index: number) => {
      const type = mapEventCodeToType(row.EventCode);
      const severity = mapGoldsteinToSeverity(row.GoldsteinScale, row.NumMentions);
      const country = extractCountryFromLocation(row.ActionGeo_FullName);
      const region = extractRegionFromLocation(row.ActionGeo_FullName);

      // Determine zoom level based on severity and mentions
      let zoomLevel: 'strategic' | 'regional' | 'local' = 'regional';
      if (severity === 'critical' || row.NumMentions > 100) {
        zoomLevel = 'strategic';
      } else if (row.NumMentions < 10) {
        zoomLevel = 'local';
      }

      // Parse SQLDATE (e.g., 20260319 -> 2026-03-19)
      const dateStr = row.SQLDATE.toString();
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8));

      const event: ConflictEvent = {
        id: `${idPrefix}-${row.SQLDATE}-${index}`,
        title: generateTitle(row),
        description: generateDescription(row),
        lat: row.ActionGeo_Lat!,
        lng: row.ActionGeo_Long!,
        date: new Date(year, month, day).toISOString(),
        type,
        severity,
        source: row.SOURCEURL ? new URL(row.SOURCEURL).hostname.replace('www.', '') : 'GDELT',
        sourceUrl: row.SOURCEURL || '',
        country,
        region,
        zoomLevel,
      };

      return event;
    });
}

async function runBigQueryQuery(query: string, label: string): Promise<GDELTEvent[]> {
  console.log(`[BigQuery] Executing ${label} query...`);

  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  });

  console.log(`[BigQuery] ${label} job ${job.id} started`);
  const [rows] = await job.getQueryResults();
  console.log(`[BigQuery] ${label}: retrieved ${rows.length} events`);

  return rows;
}

export async function fetchConflictsFromBigQuery(
  hours: number = 24,
  limit: number = 50
): Promise<ConflictEvent[]> {
  const sqlDate = new Date();
  sqlDate.setHours(sqlDate.getHours() - hours);
  const dateStr = sqlDate.toISOString().split('T')[0].replace(/-/g, '');

  // Main global query — strict filters for armed conflicts worldwide
  const globalQuery = `
    SELECT
      SQLDATE, Actor1Name, Actor2Name, EventCode,
      GoldsteinScale, NumMentions, ActionGeo_FullName,
      ActionGeo_Lat, ActionGeo_Long, SOURCEURL, AvgTone
    FROM \`gdelt-bq.gdeltv2.events\`
    WHERE
      SQLDATE >= ${dateStr}
      AND GoldsteinScale < -3
      AND ActionGeo_Lat IS NOT NULL
      AND ActionGeo_Long IS NOT NULL
      AND SOURCEURL IS NOT NULL
      AND EventCode IN ('140', '141', '142', '143', '144', '145',
                        '150', '151', '152', '153',
                        '170', '171', '172', '173', '174', '175',
                        '180', '181', '182', '183', '184', '185', '186',
                        '190', '191', '192', '193', '194', '195', '196',
                        '200', '201', '202', '203', '204')
    ORDER BY NumMentions DESC, GoldsteinScale ASC
    LIMIT ${limit}
  `;

  // US-specific query — more lenient: lower Goldstein threshold (-2),
  // broader event codes (includes all protest sub-codes),
  // and requires more mentions to filter noise
  const usQuery = `
    SELECT
      SQLDATE, Actor1Name, Actor2Name, EventCode,
      GoldsteinScale, NumMentions, ActionGeo_FullName,
      ActionGeo_Lat, ActionGeo_Long, SOURCEURL, AvgTone
    FROM \`gdelt-bq.gdeltv2.events\`
    WHERE
      SQLDATE >= ${dateStr}
      AND GoldsteinScale < -2
      AND ActionGeo_Lat IS NOT NULL
      AND ActionGeo_Long IS NOT NULL
      AND SOURCEURL IS NOT NULL
      AND ActionGeo_CountryCode = 'US'
      AND NumMentions >= 5
      AND EventCode IN ('140', '141', '142', '143', '144', '145',
                        '150', '151', '152', '153',
                        '160', '161', '162',
                        '170', '171', '172', '173', '174', '175',
                        '180', '181', '182', '183', '184', '185', '186',
                        '190', '191', '192', '193', '194', '195', '196',
                        '200', '201', '202', '203', '204')
    ORDER BY NumMentions DESC, GoldsteinScale ASC
    LIMIT 15
  `;

  // Run both queries in parallel
  const [globalRows, usRows] = await Promise.all([
    runBigQueryQuery(globalQuery, 'Global'),
    runBigQueryQuery(usQuery, 'US').catch((err) => {
      console.warn('[BigQuery] US query failed, will rely on fallback:', err.message);
      return [] as GDELTEvent[];
    }),
  ]);

  const globalConflicts = mapGDELTRows(globalRows, 'bigquery');
  const usConflicts = mapGDELTRows(usRows, 'bigquery-us');

  // Merge: deduplicate by checking if a US event's lat/lng already exists in global results
  const globalCoords = new Set(globalConflicts.map(c => `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`));
  const uniqueUsConflicts = usConflicts.filter(
    c => !globalCoords.has(`${c.lat.toFixed(2)},${c.lng.toFixed(2)}`)
  );

  const merged = [...globalConflicts, ...uniqueUsConflicts];

  console.log(`[BigQuery] Final: ${globalConflicts.length} global + ${uniqueUsConflicts.length} US = ${merged.length} total`);

  return merged;
}
