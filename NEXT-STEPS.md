# ConflictMap - Next Steps

## Night 1 Priority: News Article Integration 🔥

### 1. GDELT DOC API for News Sources (TOP PRIORITY)
```
GET https://api.gdeltproject.org/api/v2/doc/doc
  ?query=(conflict location_name)
  ?mode=artlist
  ?format=json
  ?timespan=7d
  ?maxrecords=50
  ?sourcelang=eng
```

**Implementation Plan:**
- Build: `src/lib/gdelt-news.ts` fetcher
- API route: `src/app/api/news/route.ts?location=ukraine&keywords=conflict`
- Add to side panel: "Recent News" section with expandable article list
- Each article: headline, source (Reuters, BBC, AP), time ago, external link
- Click article → opens in new tab
- Show article count badge on marker: "12 articles"
- Filter: Last 24h / 7d / 30d toggle

**UI Changes:**
- Expand side panel to show news section below event details
- Article cards: clean design, source logo if available
- Loading skeleton while fetching
- Empty state: "No recent news for this location"

### 2. Live GDELT GEO API Integration (AFTER NEWS)
```
GET https://api.gdeltproject.org/api/v2/geo/geo
  ?query=(conflict OR war OR attack OR bombing)
  ?mode=PointData
  ?format=GeoJSON
  ?timespan=7d
  ?maxpoints=500
```
- Returns GeoJSON ready for Leaflet
- No API key needed
- 7-day rolling window, 15-min updates
- Build: `src/lib/gdelt.ts` fetcher + `src/app/api/conflicts/route.ts`

### 3. ACLED API Registration & Integration
- Register at https://acleddata.com/user/register
- Implement OAuth token flow in `src/lib/acled.ts`
- Normalize ACLED events to match ConflictEvent interface
- Merge with GDELT data, deduplicate by location proximity

### 4. Data Normalization Layer
- Create `src/lib/normalize.ts`
- Map both ACLED and GDELT fields to unified `ConflictEvent` type
- Severity mapping: GDELT GoldsteinScale → low/medium/high/critical
- Type mapping: CAMEO codes → armed_conflict/protest/terrorism/etc.

## Night 2: UI Enhancements
- Marker clustering (leaflet.markercluster)
- Filter bar: conflict type checkboxes, severity dropdown, date range
- Loading skeleton for map and panel
- Error boundary with retry

## Night 3: Database & Persistence
- Supabase project setup (free tier: 500 MB, 2 projects)
- Schema: conflicts table, sources table, daily_snapshots
- Cron job to fetch and store data (Vercel Cron or GitHub Actions)
- Switch API route from live-fetch to database queries

## Technical Decisions Made
- **react-leaflet v4** (not v5) - React 18 compatible
- **CARTO dark tiles** - free, no API key, dark theme
- **Dynamic import** for map component - avoids SSR issues with Leaflet
- **DivIcon markers** - custom styled, no image dependencies
- **Client components** for interactive parts, server components where possible
