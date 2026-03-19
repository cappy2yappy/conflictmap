# ConflictMap Production Launch - Complete Rebuild Task

**Deadline:** Tonight (must deploy before midnight for 2 PM launch tomorrow)
**Current Status:** MVP with sample data - needs real data sources
**Critical Issue:** Map shows events without real news sources (Tony's feedback: "We don't make up data, we facilitate it")

---

## PRIMARY OBJECTIVE

Rebuild ConflictMap to use **real-time data sources** where EVERY map marker links to a real news article.

**Non-negotiable requirement:** Every blip on the map MUST have a clickable source to a real news story.

---

## TASK 1: Switch to GDELT Event Database (CRITICAL - Priority 1)

### Problem
Currently using hardcoded sample data. Events exist on map with no corresponding news articles.

### Solution
Use GDELT Event Database API to fetch real conflict/protest events that are already linked to news sources.

### GDELT API Endpoint
```
https://api.gdeltproject.org/api/v2/doc/doc?query=<query>&mode=artlist&maxrecords=250&format=json
```

### Query Strategy
Build separate queries for different event types:
- Armed conflicts: `query=conflict OR war OR attack OR military`
- Protests: `query=protest OR demonstration OR rally`
- Civil unrest: `query=unrest OR riot OR violence`
- Labor strikes: `query=strike OR labor OR walkout`
- Terrorism: `query=terrorism OR terrorist OR attack`

### What GDELT Returns
Each article has:
- `url` - Direct link to news source ✅
- `title` - Article headline
- `seendate` - When published
- `domain` - News source (bbc.com, reuters.com, etc.)
- `socialimage` - Optional image
- `tone` - Sentiment score (can map to severity)
- `locations` - Mentioned locations (parse for lat/lng)

### Implementation Steps

1. **Create `/src/lib/gdelt-fetcher.ts`**
   - Function: `fetchGDELTEvents(eventType: ConflictType, maxRecords: number)`
   - Returns: Array of raw GDELT articles
   - Add 1-hour caching to avoid rate limits
   - Error handling for API failures

2. **Create `/src/lib/gdelt-parser.ts`**
   - Function: `parseGDELTtoConflicts(articles: GDELTArticle[]): ConflictEvent[]`
   - Extract location from article (use first mentioned location)
   - Geocode location to lat/lng (use Nominatim free geocoding API)
   - Map tone score to severity:
     - tone < -5 → critical
     - tone -5 to -2 → high
     - tone -2 to 0 → medium
     - tone > 0 → low
   - Set `sourceUrl` field to article URL
   - Set `source` field to domain name

3. **Update `/src/lib/types.ts`**
   ```typescript
   export interface ConflictEvent {
     id: string;
     title: string;
     description: string;
     lat: number;
     lng: number;
     date: string;
     type: ConflictType;
     severity: Severity;
     casualties?: number;
     source: string;
     sourceUrl: string;  // NEW - direct link to news article
     country: string;
     region: string;
     zoomLevel: ZoomLevel;
     parentId?: string;
     subEventCount?: number;
   }
   ```

4. **Replace `/src/lib/conflict-data.ts`**
   - Remove all sample data
   - Call `fetchGDELTEvents()` for each event type
   - Parse results with `parseGDELTtoConflicts()`
   - Combine and deduplicate events
   - Cache for 1 hour

5. **Update `/src/components/SidePanel.tsx`**
   - Add "View Source Article" button/link using `conflict.sourceUrl`
   - Show source domain prominently
   - Ensure every conflict detail shows the source

### Testing Criteria
- [ ] Every map marker has a `sourceUrl`
- [ ] Clicking "View Source" opens real news article
- [ ] Events update automatically (via cache refresh)
- [ ] No hardcoded/sample data remains
- [ ] Minimum 20-30 real events on map

---

## TASK 2: Fix News Aggregator API (Priority 2)

### Problem
`/api/news` endpoint returns `{ articles: [] }` even though infrastructure is built.

### Current Code
Located in `/src/app/api/news/route.ts` and `/src/lib/news-aggregator.ts`

### Debug Steps

1. **Test Google News RSS directly from Vercel**
   - Add extensive logging to see what's failing
   - Check if fetch is timing out
   - Verify XML parsing is working
   - Test with simple curl from deployed function

2. **If Google News is blocked:**
   - Try alternative RSS feed: NewsAPI.org (free tier: 100 req/day)
   - Or use News Data API (free tier: 200 req/day)
   - Update aggregator to use working source

3. **Simplify parsing**
   - Current regex might be failing in serverless environment
   - Try using a proper XML parser library like `fast-xml-parser`
   - Add `npm install fast-xml-parser` if needed

4. **Add fallback to GDELT articles**
   - Since we're already fetching from GDELT for events
   - Can reuse those articles for news section
   - Filter by location match

### Expected Result
- `/api/news?location=Ukraine&severity=critical` returns 3-5 real articles
- Articles have title, source, url, publishedAt, description
- Works reliably on Vercel serverless

---

## TASK 3: Test Article Preview Modal (Priority 3)

### Status
Already built and deployed in `/src/components/ArticleModal.tsx`

### What to Test
1. Click any news article in sidebar → Modal pops up
2. Modal shows title, source, date, description
3. "Read Full Article" button works
4. Modal closes on X click or background click
5. Styling matches dark synthwave theme

### If Broken
- Check that `selectedArticle` state is working
- Verify modal is receiving article data
- Test with different screen sizes

---

## TASK 4: Polish & Production Readiness (Priority 4)

### Final Checks
1. **Error States**
   - What happens if GDELT API fails?
   - Show user-friendly message: "Unable to load events, try refreshing"
   - Log errors to console for debugging

2. **Loading States**
   - Show skeleton loaders while fetching GDELT data
   - "Loading conflicts..." message

3. **Performance**
   - Implement caching (1 hour for GDELT events)
   - Lazy load news articles (only fetch when conflict clicked)
   - Optimize map rendering for 30+ markers

4. **Mobile Experience**
   - Test on mobile viewport
   - Ensure modal is readable on small screens
   - Touch targets are large enough

5. **SEO & Meta**
   - Update page title: "ConflictMap - Real-Time Global Conflict Tracker"
   - Add meta description
   - Add Open Graph tags for social sharing

---

## FILES TO CREATE/UPDATE

### Create New
- `/src/lib/gdelt-fetcher.ts` - Fetch from GDELT API
- `/src/lib/gdelt-parser.ts` - Parse GDELT to ConflictEvent
- `/src/lib/geocoding.ts` - Convert location names to lat/lng

### Update Existing
- `/src/lib/types.ts` - Add sourceUrl field
- `/src/lib/conflict-data.ts` - Replace sample data with GDELT calls
- `/src/components/SidePanel.tsx` - Add "View Source" link
- `/src/app/api/news/route.ts` - Debug and fix
- `/src/lib/news-aggregator.ts` - Debug and fix

---

## SUCCESS CRITERIA

**Must have ALL of these working before deployment:**

1. ✅ Map loads with 20-30 real conflict events from GDELT
2. ✅ Every event has a working source URL to a real news article
3. ✅ Clicking an event shows detail panel
4. ✅ Detail panel has "View Source Article" button that opens real news
5. ✅ News section shows 3-5 related articles (from working /api/news)
6. ✅ Article preview modal works when clicking news articles
7. ✅ Twitter OSINT links work for each event
8. ✅ Map is responsive on mobile
9. ✅ No console errors
10. ✅ Build completes without errors

---

## TIMELINE

**Total time estimate: 2-3 hours**

- GDELT integration: 1.5 hours
- News API debug: 30 minutes
- Testing & polish: 30 minutes
- Deploy & verify: 30 minutes

**Must be deployed and tested before midnight EST tonight.**

---

## DEPLOYMENT

After completing all tasks:

1. Run `npm run build` - must succeed with no errors
2. Commit: `git add -A && git commit -m "Production launch: Switch to GDELT real-time data + fix news API"`
3. Push: `git push origin main`
4. Verify deployment on Vercel
5. Test live site thoroughly
6. Report back completion status

---

## NOTES

- Free tier limits: GDELT (no limit), Nominatim geocoding (1 req/sec)
- Cache aggressively to stay within rate limits
- Prioritize getting GDELT working - that's 90% of the value
- News API can be debugged after if time runs short
- No AI summarization needed yet (that's weekend task)

---

## CONTEXT

**Project:** ConflictMap - Real-time global conflict and unrest tracker
**Tech:** Next.js 14, React, TypeScript, Tailwind, Leaflet
**Current URL:** https://conflictmap-kappa.vercel.app/
**Launch:** Tomorrow (Mar 19) at 2 PM EST
**Feedback:** "Every blip needs a source to a story. We don't make up data, we facilitate it."

---

**Ready to start? Work systematically through Tasks 1-4. Report progress after each task completion.**
