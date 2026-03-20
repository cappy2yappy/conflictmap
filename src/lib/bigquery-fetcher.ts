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

function generateTitle(event: GDELTEvent): string {
  const type = mapEventCodeToType(event.EventCode);
  const location = extractCountryFromLocation(event.ActionGeo_FullName);
  
  const typeLabels: Record<ConflictType, string> = {
    armed_conflict: 'Armed Conflict',
    protest: 'Protest',
    civil_unrest: 'Civil Unrest',
    terrorism: 'Terrorist Activity',
    political_violence: 'Political Violence',
    territorial_dispute: 'Territorial Dispute',
    labor_strike: 'Labor Strike',
  };
  
  let title = typeLabels[type] || 'Conflict Event';
  
  if (event.Actor1Name && event.Actor2Name) {
    title += ` between ${event.Actor1Name} and ${event.Actor2Name}`;
  } else if (event.Actor1Name) {
    title += ` involving ${event.Actor1Name}`;
  }
  
  title += ` in ${location}`;
  
  return title;
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

export async function fetchConflictsFromBigQuery(
  hours: number = 24,
  limit: number = 50
): Promise<ConflictEvent[]> {
  const sqlDate = new Date();
  sqlDate.setHours(sqlDate.getHours() - hours);
  const dateStr = sqlDate.toISOString().split('T')[0].replace(/-/g, '');
  
  const query = `
    SELECT 
      SQLDATE,
      Actor1Name,
      Actor2Name,
      EventCode,
      GoldsteinScale,
      NumMentions,
      ActionGeo_FullName,
      ActionGeo_Lat,
      ActionGeo_Long,
      SOURCEURL,
      AvgTone
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
  
  console.log('[BigQuery] Executing query for last', hours, 'hours...');
  
  const [job] = await bigquery.createQueryJob({
    query,
    location: 'US',
  });
  
  console.log(`[BigQuery] Job ${job.id} started`);
  
  const [rows] = await job.getQueryResults();
  
  console.log(`[BigQuery] Retrieved ${rows.length} events`);
  
  const conflicts: ConflictEvent[] = rows
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
        id: `bigquery-${row.SQLDATE}-${index}`,
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
  
  return conflicts;
}
