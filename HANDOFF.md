# ConflictMap - Project Handoff for Claude Code

## Project Overview
Real-time global conflict tracker showing armed conflicts, protests, civil unrest, and political violence on an interactive map.

**Live:** https://conflictmap-kappa.vercel.app  
**GitHub:** https://github.com/cappy2yappy/conflictmap  
**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, Leaflet maps, Google BigQuery

---

## Current Status (as of April 14, 2026)

### ✅ What's Working
- **BigQuery integration:** Queries GDELT events table for 50 real conflicts every 6 hours
- **Interactive map:** Click markers → popup + sidebar update
- **Zoom filtering:** Strategic/regional/local conflicts based on zoom level
- **Severity mapping:** Critical/high/medium/low based on Goldstein scale
- **Real news sources:** Every conflict links to source article
- **Deployment:** Auto-deploys to Vercel on git push

### ⚠️ Current Issues
1. **BigQuery quota:** Free tier limited, can exceed daily quota (10 GB/day)
2. **No US conflicts:** GDELT filters too strict, misses US events
3. **Generic titles:** "Armed Conflict involving DETECTIVE in Australia" (uses raw GDELT actor names)
4. **No filtering UI:** Can't filter by type, severity, region, or date range
5. **Mobile:** Not optimized for mobile/tablet

---

## Project Structure

```
conflictmap/
├── src/
│   ├── app/
│   │   ├── api/conflicts/route.ts    # BigQuery API endpoint
│   │   ├── page.tsx                   # Main page component
│   │   └── globals.css
│   ├── components/
│   │   ├── ConflictMap.tsx            # Leaflet map component
│   │   └── SidePanel.tsx              # Sidebar with conflict list
│   ├── lib/
│   │   ├── bigquery-fetcher.ts        # BigQuery integration
│   │   ├── conflict-data.ts           # Zoom filtering helper
│   │   ├── fallback-conflicts.ts      # Fallback data (11 events)
│   │   ├── marker-icons.ts            # Severity-based marker colors
│   │   └── types.ts                   # TypeScript types
│   └── ...
├── BIGQUERY_SETUP.md                  # BigQuery credentials setup
├── DATA_SOURCES_RESEARCH.md           # Data source research
└── package.json
```

---

## Key Files to Know

### `/src/app/api/conflicts/route.ts`
- Server-side API route
- Calls `fetchConflictsFromBigQuery()` from `bigquery-fetcher.ts`
- Returns JSON with 50 conflicts
- 6-hour cache (`s-maxage=21600`)
- Falls back to `fallbackConflicts` on error

### `/src/lib/bigquery-fetcher.ts`
- **230 lines** - BigQuery query logic
- Queries `gdelt-bq.gdeltv2.events` table
- Filters: `SQLDATE >= [last 24h]`, `GoldsteinScale < -3`, event codes 14x-20x
- Maps GDELT data to `ConflictEvent` type
- Issues: scans too much data (quota problem), misses nuanced US events

### `/src/components/ConflictMap.tsx`
- Leaflet map with markers
- Each marker has popup + click handler
- Zoom tracking for filtering
- Map center: [20, 0] zoom 3

### `/src/lib/fallback-conflicts.ts`
- 11 curated conflicts (Ukraine, Gaza, Sudan, Myanmar, Syria, Colombia, France, India, NYC, LA, DC)
- Used when BigQuery fails or quota exceeded

---

## Environment Variables (Vercel)

**Required:**
- `BIGQUERY_CREDENTIALS_JSON` - Base64-encoded service account JSON (already set)

**Location:** Vercel → conflictmap → Settings → Environment Variables

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Test API endpoint
curl http://localhost:3000/api/conflicts | jq .
```

---

## Data Flow

1. User visits site → `/api/conflicts` called
2. Server checks cache (6 hours)
3. If stale → BigQuery query executes
4. BigQuery returns 50 GDELT events from last 24h
5. Events mapped to `ConflictEvent[]` type
6. Client renders map markers + sidebar
7. User clicks marker → popup + sidebar update

---

## Known Issues & Potential Fixes

### 1. BigQuery Quota Exceeded
**Problem:** GDELT table is HUGE, queries scan gigabytes even with filters  
**Solutions:**
- Switch to ACLED API (free, designed for conflicts, smaller dataset)
- Optimize query with partition filters (reduce scanned data)
- Add billing to Google Cloud ($5/TB)
- Stick with fallback data (11 events, free forever)

**Current workaround:** Fallback data kicks in when quota exceeded

### 2. No US Conflicts
**Problem:** GDELT filters (`GoldsteinScale < -3`, violent event codes) miss most US events  
**Solutions:**
- Add protest-specific event codes (14x range)
- Lower Goldstein threshold to -2
- Add US-specific fallback events (already have 3: NYC, LA, DC)
- Query US separately with different filters

### 3. Generic Titles
**Problem:** "Armed Conflict involving DETECTIVE in Australia" (GDELT raw actor names)  
**Solutions:**
- NLP/LLM post-processing to clean titles
- Use `SOURCEURL` headline instead of generated title
- Manual curation for fallback data
- Implement title templates based on event code

### 4. No Filtering UI
**Opportunity:** Add client-side filters for type, severity, date, region  
**Implementation:** Add filter sidebar with checkboxes/dropdowns

### 5. Mobile Optimization
**Opportunity:** Responsive design for mobile/tablet  
**Implementation:** Tailwind breakpoints, collapsible sidebar, touch-friendly markers

---

## Suggested Next Steps (Priority Order)

### 🔥 HIGH PRIORITY
1. **Fix US conflicts** - Add more lenient filters or fallback US data
2. **Improve titles** - Clean up generic "DETECTIVE" / "TELEVISION" actor names
3. **Add filtering UI** - Type, severity, date range selectors

### 🟡 MEDIUM PRIORITY
4. **Mobile optimization** - Responsive design, touch targets
5. **Fix BigQuery quota** - Switch to ACLED or optimize queries
6. **Add search** - Search conflicts by location/keyword

### 🟢 NICE TO HAVE
7. **Historical view** - Toggle to show conflicts from past 7/30 days
8. **Conflict clustering** - Group nearby markers at low zoom
9. **Analytics** - Track user interactions, popular regions
10. **Share feature** - Share specific conflict via URL param

---

## Testing Checklist

Before deploying changes:
- [ ] Local dev server starts without errors (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] API returns 50 conflicts (`curl localhost:3000/api/conflicts`)
- [ ] Map markers clickable
- [ ] Popups appear with correct data
- [ ] Sidebar updates on marker click
- [ ] Zoom filtering works (strategic → regional → local)
- [ ] Mobile view acceptable
- [ ] No console errors in browser

---

## Deployment

**Auto-deploys on push to main:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel builds and deploys automatically (~30-60 seconds).

**Check deployment:** https://vercel.com/cappy2yappys-projects/conflictmap/deployments

---

## Credentials & Access

**BigQuery Service Account:**
- Project ID: `conflictmap-490800`
- Service account: `conflictmap-bigquery@conflictmap-490800.iam.gserviceaccount.com`
- Role: BigQuery User
- Credentials: `bigquery-credentials.json` (local only, NOT in git)
- Vercel env var: `BIGQUERY_CREDENTIALS_JSON` (base64-encoded)

**GitHub Repo:**
- https://github.com/cappy2yappy/conflictmap
- Owner: cappy2yappy
- Branch: main

**Vercel Project:**
- https://vercel.com/cappy2yappys-projects/conflictmap
- Account: cappy2yappy (Google OAuth via cappybot2@gmail.com)

---

## Contact & Questions

If you need clarification on anything:
- Check `BIGQUERY_SETUP.md` for BigQuery details
- Check `DATA_SOURCES_RESEARCH.md` for data source options
- Check `MEMORY.md` in workspace root for project history
- Ask Tony (Cap) via Discord

---

## Quick Wins for Claude Code

If you want to make immediate improvements:

1. **Add US conflicts to fallback data** (5 min)
   - File: `src/lib/fallback-conflicts.ts`
   - Add 5-10 more US cities with real protest/event data

2. **Improve title generation** (15 min)
   - File: `src/lib/bigquery-fetcher.ts`
   - Function: `generateTitle()`
   - Clean up raw actor names, use better templates

3. **Add type filter UI** (30 min)
   - File: `src/app/page.tsx` or new `FilterPanel` component
   - Add checkboxes for protest/conflict/civil_unrest/etc.
   - Filter `conflicts` array client-side

4. **Mobile sidebar toggle** (15 min)
   - File: `src/app/page.tsx`
   - Make sidebar collapsible on mobile
   - Add hamburger menu button

5. **Add conflict count badge** (10 min)
   - Show "50 active events" in header
   - Update on filter changes

---

**Built by:** Cappy 🧢 (AI assistant for Tony @ Laibyrinth)  
**Last updated:** April 14, 2026  
**Status:** Production-ready, working with BigQuery (quota issues pending)
