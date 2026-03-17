# ConflictMap - Data Sources Research

## 1. ACLED (Armed Conflict Location & Event Data)

### Overview
ACLED records dates, actors, locations, fatalities, and types of all reported political violence and protest events in **200+ countries and territories**. Over 1.3 million events recorded.

### Data Available
- **6 event types, 25 sub-event types** across 3 disorder categories:
  - **Political Violence**: Battles, Explosions/Remote violence, Violence against civilians
  - **Demonstrations**: Protests, Riots
  - **Strategic Developments**: Agreements, Arrests, Territory transfers, etc.

### Key Fields
| Field | Description |
|-------|-------------|
| `event_id_cnty` | Unique event identifier |
| `event_date` | Date of event |
| `event_type` / `sub_event_type` | Classification |
| `actor1` / `actor2` | Named actors involved |
| `country` / `region` | Location hierarchy |
| `latitude` / `longitude` | Coordinates |
| `fatalities` | Reported death count |
| `source` / `notes` | Source info and details |
| `civilian_targeting` | Whether civilians targeted |
| `geo_precision` | Location accuracy (1=exact, 2=nearby, 3=area) |

### API Access
- **Free for non-commercial use** (requires registration)
- Register at https://acleddata.com/user/register (use institutional email)
- OAuth token authentication (24h token, 14-day refresh)
- **Base endpoint**: `https://acleddata.com/api/acled/read`
- **Pagination**: 5,000 rows per page, use `&page=N` to paginate
- **Formats**: JSON, CSV, XML, TXT

### Example API Call
```
GET https://acleddata.com/api/acled/read?_format=json
  &country=Ukraine
  &year=2024|2025&year_where=BETWEEN
  &event_type=Battles|Explosions/Remote violence
  &fields=event_id_cnty|event_date|event_type|actor1|location|latitude|longitude|fatalities
  &limit=5000&page=1
```

### Update Frequency
- **Weekly releases** (near real-time monitoring)
- Living dataset: ~10% of weekly submissions are updates to existing events

### Restrictions
- Attribution required on all uses (footnote + link to acleddata.com)
- Non-commercial use only (commercial requires corporate license)
- Cannot redistribute raw data
- Cannot train AI/ML models to create ACLED substitutes
- Cannot create competing datasets

### For ConflictMap
- **Primary source** for structured conflict event data
- Register for free API access with project email
- Use for: event locations, actor info, fatality counts, event classification
- Must display attribution prominently

---

## 2. GDELT (Global Database of Events, Language, and Tone)

### Overview
GDELT monitors print, broadcast, and online news in **100+ languages**, translating in real-time, identifying events every **15 minutes**. The largest open dataset of global human society.

### APIs Available

#### DOC 2.0 API (Article Search)
- **URL**: `https://api.gdeltproject.org/api/v2/doc/doc?query=QUERY&mode=MODE&format=FORMAT`
- **No API key required** - fully open
- Rolling **3-month window**, updated every 15 minutes
- Max 250 results per request
- Supports: keyword search, domain filter, country filter, theme filter, sentiment filter

#### GEO 2.0 API (Geographic)
- **URL**: `https://api.gdeltproject.org/api/v2/geo/geo?query=QUERY&mode=MODE&format=FORMAT`
- Rolling **7-day window**, updated every 15 minutes
- Returns **GeoJSON** - perfect for map integration
- Max 1,000 points per request
- Supports radius search from coordinates

#### Event Database (CAMEO-coded structured data)
- Accessed via raw CSV downloads or **Google BigQuery** (1 TB/month free)
- Full history back to **1979**
- 61 fields per event including actors, actions, locations, sentiment
- **QuadClass filter**: `3` (Verbal Conflict) or `4` (Material Conflict)
- **CAMEO codes 14-20** = conflict events (Protest, Military Posture, Coerce, Assault, Fight, WMD)
- **GoldsteinScale**: -10 (most conflictual) to +10 (most cooperative)

### Key Event Database Fields
| Field | Description |
|-------|-------------|
| `GLOBALEVENTID` | Unique event ID |
| `SQLDATE` | Event date |
| `Actor1Name` / `Actor2Name` | Named actors |
| `EventCode` / `EventRootCode` | CAMEO classification |
| `QuadClass` | 1-4 (cooperation to conflict) |
| `GoldsteinScale` | -10 to +10 impact score |
| `NumMentions` / `NumSources` | Coverage metrics |
| `AvgTone` | Sentiment (-100 to +100) |
| `ActionGeo_Lat/Long` | Event coordinates |
| `SOURCEURL` | Source article URL |

### Rate Limits
- No published rate limits, but enforced via HTTP 429 responses
- Recommend: 1-2 second spacing between requests
- Use raw downloads or BigQuery for bulk data

### For ConflictMap
- **Complementary source** to ACLED
- GEO API provides ready-made GeoJSON for map markers
- DOC API for news article context/links
- Event Database (via BigQuery free tier) for historical analysis
- No authentication needed = simpler integration
- Use `theme:ARMED_CONFLICT`, `theme:TERROR`, `theme:MILITARY` filters

---

## 3. Comparison & Strategy

| Feature | ACLED | GDELT |
|---------|-------|-------|
| **Cost** | Free (non-commercial) | Free (fully open) |
| **Auth Required** | Yes (OAuth token) | No |
| **Update Speed** | Weekly | Every 15 minutes |
| **Data Quality** | Human-coded, verified | Machine-coded, raw |
| **Geo Data** | Lat/long per event | GeoJSON, lat/long |
| **History** | 1997+ (varies by region) | 1979+ |
| **Best For** | Verified conflict events | Real-time monitoring, news context |

### Recommended Approach
1. **GDELT first** - easier to integrate (no auth), real-time data, GeoJSON output
2. **ACLED second** - higher quality data, but requires registration and weekly cadence
3. **Combine both** - GDELT for timeliness, ACLED for accuracy
4. **Attribution** - display data source on each marker/event

---

## 4. Additional Free Sources to Consider (Future)

| Source | Description | Access |
|--------|-------------|--------|
| **UCDP** (Uppsala) | Academic conflict dataset | Free API, annual updates |
| **START GTD** | Global Terrorism Database | Free registration |
| **CrisisWatch** (ICG) | Monthly conflict alerts | Web scraping (terms permitting) |
| **ReliefWeb API** | UN humanitarian reports | Free REST API |
| **HDX** | Humanitarian Data Exchange | Free downloads |
