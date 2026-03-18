# ConflictMap - Night Build Priorities (THURSDAY LAUNCH)

## Night 1 (Tonight - March 17, 2 AM) - NEWS INTEGRATION 🔥

**Goal:** Add news articles to each conflict

### 1. GDELT DOC API Integration (TOP PRIORITY)
```
GET https://api.gdeltproject.org/api/v2/doc/doc
  ?query=ukraine conflict
  ?mode=artlist
  ?format=json
  ?timespan=7d
  ?maxrecords=50
  ?sourcelang=eng
```

**Build:**
- `src/lib/gdelt-news.ts` - Fetch news articles by location/keywords
- `src/app/api/news/route.ts` - API endpoint: GET /api/news?location=ukraine&keywords=conflict
- Update `src/components/SidePanel.tsx` - Add "Recent News" section below event details
- Article card component:
  ```typescript
  interface NewsArticle {
    title: string;
    source: string; // "Reuters", "BBC", "AP"
    url: string;
    publishedAt: string;
    imageUrl?: string;
  }
  ```

**UI Requirements:**
- Expandable section: "📰 Recent News (12 articles)"
- Show first 5, click "View all" to expand
- Each article: headline, source logo/name, "2h ago" timestamp
- Click article → opens in new tab
- Loading skeleton while fetching
- Empty state: "No recent news for this location"

**Test with:**
- Ukraine conflict
- Gaza conflict
- Sudan conflict

**Deliverable:** Click any conflict → see 5-10 recent news articles with sources

---

## Night 2 (Wednesday - March 18, 2 AM) - TWITTER INTEGRATION

**Goal:** Add real-time Twitter feeds from verified accounts

### Curated Account List (20 verified accounts)
```javascript
const CONFLICT_MONITORS = [
  { handle: 'Conflicts', name: 'Conflict News' },
  { handle: 'IntelDoge', name: 'Intel Doge' },
  { handle: 'OSINTdefender', name: 'OSINT Defender' },
  { handle: 'WarMonitors', name: 'War Monitors' },
  { handle: 'sentdefender', name: 'Sentinel' },
  { handle: 'RALee85', name: 'Rob Lee (Russia/Ukraine)' },
  { handle: 'Osinttechnical', name: 'OSINT Technical' },
  { handle: 'michaelh992', name: 'Michael Horowitz (Middle East)' },
  { handle: 'Nrg8000', name: 'Myanmar Witness' },
  { handle: 'HN_Schlottman', name: 'Helena (Sudan)' }
  // ... 10 more
];
```

### Build:
1. **Twitter API v2 (free tier):**
   ```
   GET /2/tweets/search/recent
     ?query=from:Conflicts Ukraine
     ?max_results=10
   ```
   - 500K tweets/month free tier
   - Store API key in env: `TWITTER_BEARER_TOKEN`

2. **Fallback: Nitter RSS (no API needed):**
   ```
   https://nitter.net/Conflicts/rss
   ```

3. **Component:**
   - `src/components/TwitterFeed.tsx`
   - Props: `keywords: string[], accounts: string[]`
   - Filters tweets matching conflict location/keywords
   - Shows 5 most recent

**UI Requirements:**
- Section: "🐦 Social Media (8)"
- Tweet cards:
  - Author avatar + @handle (verified badge if applicable)
  - Tweet text (truncate at 280 chars)
  - "2h ago" timestamp
  - Embedded images/videos (if available)
  - Click → opens tweet on Twitter/X

**Deliverable:** Click Ukraine → see 5 recent tweets from @Conflicts, @RALee85, etc.

---

## Wednesday Daytime (Manual) - ZOOM-LEVEL FILTERING

**Goal:** Show different detail levels based on map zoom

### Zoom Levels:
```javascript
const ZOOM_LEVELS = {
  WORLD: { min: 1, max: 4 },    // Strategic view
  COUNTRY: { min: 5, max: 8 },  // Regional view  
  CITY: { min: 9, max: 18 }     // Local view
};
```

### Data Structure:
```typescript
interface ConflictEvent {
  // ... existing fields
  zoomLevel: 'strategic' | 'regional' | 'local';
  parentId?: string; // Link to parent conflict
}
```

### Example:
```
Strategic (zoom 1-4):
  - Ukraine Conflict (1 marker)

Regional (zoom 5-8):
  - Bakhmut Fighting (marker at 48.59, 37.98)
  - Kherson Shelling (marker at 46.63, 32.61)
  - Kyiv Drone Attack (marker at 50.45, 30.52)

Local (zoom 9+):
  - Individual incidents with exact street addresses
  - Tweet locations
  - News article geotagged locations
```

### Implementation:
1. Filter markers based on current zoom level
2. Auto-cluster markers when zoomed out
3. Show "12 more incidents" badge on clusters
4. Click cluster → zoom in + expand

**Deliverable:** Zoom in on Ukraine → see 10-15 regional incidents instead of just 1

---

## Thursday Morning - FINAL POLISH

### Build & Test
- [ ] Run production build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Test on localhost:3000 (production mode)
- [ ] Check mobile responsive (iPhone + Android sim)

### Performance
- [ ] Ensure <3 sec load time
- [ ] Lazy load images
- [ ] Cache API responses (15 min revalidation)

### Analytics
- [ ] Add Vercel Analytics (free tier)
- [ ] Track: page views, map interactions, article clicks

---

## Technical Decisions

### Data Flow
```
User clicks Ukraine marker
  ↓
Fetch news: GET /api/news?location=ukraine
  ↓
Fetch tweets: GET /api/twitter?keywords=ukraine&accounts=Conflicts,RALee85
  ↓
Render side panel with:
  - Event details (existing)
  - 📰 News articles (Night 1)
  - 🐦 Twitter feed (Night 2)
```

### Caching Strategy
- News: Cache 15 min (GDELT updates every 15 min)
- Twitter: Cache 5 min (real-time source)
- Map tiles: Cache 24h (static)

### Error Handling
- GDELT down → Show "News unavailable, try again later"
- Twitter down → Hide Twitter section gracefully
- Slow network → Show loading skeletons

---

## Cut Features (v1.1 Post-Launch)

These are good ideas but NOT for Thursday launch:
- ❌ ACLED API integration (complex OAuth, can wait)
- ❌ User accounts (authentication adds complexity)
- ❌ Historical timeline (data storage needed)
- ❌ Email alerts (requires backend + email service)
- ❌ Advanced clustering (markercluster.js adds weight)
- ❌ Heatmap view (different visualization paradigm)

Focus: Get core features working, launch clean, iterate fast.
