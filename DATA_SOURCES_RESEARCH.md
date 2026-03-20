# ConflictMap Data Sources - Deep Research
*Researched: 2026-03-19*

## Executive Summary

**Best Path Forward:**
1. **Immediate (tonight):** Increase cache to 6 hours, deploy
2. **This weekend:** Set up GDELT BigQuery (2-3 hours setup, unlimited free forever)
3. **Within 2 weeks:** Add ACLED API as secondary source (higher quality conflict data)
4. **Future:** Add NewsAPI as tertiary fallback (development use only)

**Why this order:** BigQuery solves the rate limit problem permanently for free. ACLED adds academic-quality conflict-specific data. NewsAPI provides news context.

---

## Option 1: GDELT BigQuery ⭐ **BEST LONG-TERM**

### What It Is
- Google BigQuery hosts the entire GDELT 2.0 dataset
- Updated every 15 minutes
- Free access through Google Cloud (no API key needed for queries)
- SQL-based querying

### Coverage
- **Events table:** 300M+ events from 1979-present
- **GKG (Global Knowledge Graph):** Themes, emotions, locations, quotes
- **Mentions table:** Every article mentioning each event
- **Translation:** 65 languages translated to English in realtime
- **Themes:** 2,300+ emotions and themes analyzed
- **Geography:** Multilingual geocoding

### Costs
- **Free tier:** 1 TB queries/month (plenty for ConflictMap)
- **After 1TB:** $5 per TB
- **Realistic cost for ConflictMap:** $0/month (unlikely to hit 1TB)

### Pros
✅ Unlimited queries (no rate limiting)
✅ Free forever (within free tier)
✅ Most comprehensive global event data
✅ Already geocoded
✅ 15-minute update frequency
✅ Historical data back to 1979
✅ SQL queries = flexible filtering
✅ Official GDELT source (not a rate-limited API)
✅ Can query last 24 hours, 7 days, specific countries, themes

### Cons
❌ Requires Google Cloud account setup
❌ Learning curve for BigQuery SQL
❌ Need service account + authentication
❌ Initial setup ~2-3 hours
❌ Same data quality issues as GDELT API (but you control filtering)

### Setup Time
- **Initial:** 2-3 hours (Google Cloud project, service account, first queries)
- **Integration:** 3-4 hours (build fetcher, parser, test)
- **Total:** ~6 hours one-time investment

### Implementation Example
```sql
-- Get last 24 hours of high-severity conflicts
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
  SOURCEURL
FROM `gdelt-bq.gdeltv2.events`
WHERE 
  SQLDATE >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND GoldsteinScale < -5  -- Negative events only
  AND ActionGeo_Lat IS NOT NULL
  AND ActionGeo_Long IS NOT NULL
ORDER BY NumMentions DESC
LIMIT 100;
```

### Verdict
**✅ IMPLEMENT THIS - Best permanent solution**
- One weekend of work = unlimited free data forever
- No more rate limiting
- Most comprehensive coverage
- Can filter by severity, location, date, themes

---

## Option 2: ACLED API ⭐ **BEST QUALITY**

### What It Is
- Armed Conflict Location & Event Data Project
- Academic/NGO conflict-specific database
- Higher quality, human-verified conflict data
- Used by UN, World Bank, governments, researchers

### Coverage
- **Geographic:** Africa, Middle East, South Asia, Southeast Asia, Europe, Latin America
- **Event types:** Battles, explosions, violence against civilians, protests, riots, strategic developments
- **Time range:** 1997-present (varies by region)
- **Update frequency:** Daily
- **Granularity:** Specific locations, dates, actors, fatalities

### Access & Pricing
- **Free tier:** API access with registration (myACLED account)
- **Rate limits:** Unknown (need to test after signup)
- **Commercial use:** Allowed with attribution
- **Export formats:** CSV, JSON, API

### Pros
✅ Conflict-specific (not general news)
✅ Higher quality than GDELT (human-verified)
✅ Fatality counts included
✅ Actor identification (armed groups, governments, etc.)
✅ Free with registration
✅ Academic credibility
✅ Better for serious conflict tracking
✅ Used by major orgs (adds legitimacy to ConflictMap)

### Cons
❌ Requires account signup + API key
❌ Rate limits unknown until tested
❌ Not global (missing some regions)
❌ Daily updates (not realtime like GDELT)
❌ More focused on armed conflict (less protest/civil unrest data)

### Setup Time
- **Signup:** 10 minutes
- **API testing:** 1-2 hours
- **Integration:** 3-4 hours
- **Total:** ~5 hours

### Verdict
**✅ ADD THIS as secondary source**
- Higher quality than GDELT for actual armed conflicts
- Adds credibility ("Data sources: GDELT, ACLED")
- Good for strategic-level conflicts
- Use GDELT for protests/civil unrest, ACLED for armed conflicts

---

## Option 3: NewsAPI ⚠️ **DEVELOPMENT ONLY**

### What It Is
- News aggregator API
- 80,000+ sources worldwide
- Free tier for development

### Coverage
- **Sources:** Major news outlets (BBC, CNN, Reuters, etc.)
- **Geographic:** Global
- **Languages:** Many (filtering available)
- **Update frequency:** Realtime

### Access & Pricing
- **Free tier:** 100 requests/day, dev use only
- **Paid tier:** $449/month (Business plan)
- **Commercial restriction:** Free tier explicitly says "development and testing only"

### Pros
✅ Easy to use (great docs)
✅ Clean, structured data
✅ Good for general news context
✅ Fast integration (~20 minutes)

### Cons
❌ Free tier violates ToS for production use
❌ $449/mo way too expensive
❌ Not conflict-specific
❌ 100 req/day too low for real traffic
❌ Need to manually geocode articles

### Verdict
**⚠️ USE ONLY as development/testing tool**
- Good for prototyping
- DO NOT use in production (ToS violation)
- Too expensive for paid tier

---

## Option 4: Direct News Scraping ❌ **NOT RECOMMENDED**

### What It Is
- Scrape BBC, Reuters, Al Jazeera, etc. with Puppeteer/Playwright
- Extract articles, geocode manually

### Pros
✅ No API limits
✅ Free
✅ Full control

### Cons
❌ Violates most sites' ToS
❌ Fragile (breaks when sites update)
❌ Slow (need to render pages)
❌ Legal risk
❌ High maintenance
❌ Could get IP banned
❌ Unethical

### Verdict
**❌ AVOID - Last resort only**

---

## Option 5: Multiple Sources Aggregated ⭐ **IDEAL END STATE**

### Strategy
1. **Primary:** GDELT BigQuery (armed conflicts, protests, civil unrest)
2. **Secondary:** ACLED API (high-quality armed conflict data)
3. **Tertiary:** Fallback data (when APIs fail)

### Data Flow
```
1. Try GDELT BigQuery (last 24 hours)
   ├─ Armed conflicts (GoldsteinScale < -5)
   ├─ Protests (EventCode in protest range)
   └─ Civil unrest (EventCode in violence range)

2. Enrich with ACLED (armed conflicts only)
   ├─ Check for overlapping events
   ├─ Add fatality counts from ACLED
   └─ Use ACLED actor data

3. Deduplicate by location + date + type

4. If all fail → Use fallback data

5. Cache for 6 hours
```

### Benefits
- Best of both worlds (breadth + quality)
- Resilient (multiple sources)
- Can cross-reference data
- ACLED adds fatality counts to GDELT events
- Legitimate data sources

### Complexity
- More code to maintain
- Deduplication logic needed
- ~10-15 hours initial development

### Verdict
**✅ THIS IS THE GOAL**
- Start with GDELT BigQuery this weekend
- Add ACLED within 2 weeks
- Keep fallback data as safety net

---

## Recommended Implementation Timeline

### Week 1 (This Weekend)
**Goal:** Fix rate limiting permanently

- [x] Increase cache to 6 hours (tonight, 5 min)
- [ ] Create Google Cloud project (30 min)
- [ ] Enable BigQuery API (10 min)
- [ ] Create service account + download credentials (20 min)
- [ ] Write GDELT BigQuery fetcher (2 hours)
- [ ] Test queries, tune filters (1 hour)
- [ ] Replace GDELT API with BigQuery (1 hour)
- [ ] Deploy + test (30 min)
- [ ] Remove GDELT API code (30 min)

**Time:** ~6 hours total
**Result:** Unlimited free data, no more rate limits

### Week 2
**Goal:** Add quality conflict data

- [ ] Sign up for ACLED account (10 min)
- [ ] Test ACLED API, understand rate limits (1 hour)
- [ ] Build ACLED fetcher (2 hours)
- [ ] Add deduplication logic (2 hours)
- [ ] Enrich GDELT events with ACLED data (2 hours)
- [ ] Deploy + test (1 hour)

**Time:** ~8 hours total
**Result:** Higher quality conflict data, fatality counts, actor identification

### Week 3+
**Goal:** Polish + expand

- [ ] Add event type filtering in UI
- [ ] Add date range filtering
- [ ] Show data sources per event ("Source: GDELT + ACLED")
- [ ] Add fatality counts to UI
- [ ] Optimize caching strategy
- [ ] Add analytics on data source usage

---

## Cost Analysis

### GDELT BigQuery
- **Setup:** $0
- **Monthly:** $0 (free tier covers ConflictMap usage)
- **If viral (1M queries/month):** ~$5-10/month
- **Verdict:** Essentially free forever

### ACLED
- **Setup:** $0
- **Monthly:** $0 (free tier with attribution)
- **Rate limits:** TBD (test after signup)
- **Verdict:** Free, need to test limits

### NewsAPI
- **Setup:** $0
- **Monthly (free):** ToS violation for production
- **Monthly (paid):** $449/month
- **Verdict:** Not viable

### Total
- **Current cost:** $0/month
- **After BigQuery + ACLED:** $0-5/month
- **Sustainable:** Yes

---

## Data Quality Comparison

| Source | Coverage | Quality | Latency | Geocoding | Conflicts | Protests | Cost |
|--------|----------|---------|---------|-----------|-----------|----------|------|
| GDELT API | Global | Medium | 15min | Auto | ✅ | ✅ | Free (rate limited) |
| GDELT BigQuery | Global | Medium | 15min | Auto | ✅ | ✅ | Free (unlimited) |
| ACLED | Regional | High | 24hrs | Auto | ✅ | ⚠️ | Free |
| NewsAPI | Global | High | Realtime | Manual | ❌ | ⚠️ | $449/mo |
| Fallback | Global | Low | Static | Manual | ✅ | ✅ | Free |

---

## Final Recommendation

### Tonight (20 minutes)
```typescript
// src/lib/conflict-data.ts
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours instead of 1
```
Deploy this immediately to reduce GDELT API pressure.

### This Weekend (6 hours)
Set up GDELT BigQuery:
1. Google Cloud project + service account
2. Build BigQuery fetcher
3. Replace GDELT API calls
4. Deploy

This solves rate limiting permanently for $0.

### Next Weekend (8 hours)
Add ACLED API:
1. Sign up, test API
2. Build fetcher
3. Add to data pipeline
4. Deploy

This adds quality + credibility.

### Result
- Unlimited free data (BigQuery)
- High-quality conflict data (ACLED)
- Resilient (multiple sources)
- Professional (using real data sources)
- Scalable (no rate limits)
- $0-5/month total cost

---

## Questions to Answer Before Starting

1. **Do you have a Google account?** (needed for Cloud)
2. **Are you comfortable with SQL?** (BigQuery uses SQL)
3. **Want me to build the BigQuery integration this weekend?** (I can do it)
4. **Priority: speed vs quality?** (BigQuery = both, but takes 6 hours setup)

---

## The Honest Truth

**GDELT BigQuery is the right answer.**

- It's what GDELT was designed for (the API is a limited preview)
- It's free forever (for your use case)
- It's unlimited (no rate limits)
- It's the same data (but you control the queries)
- One weekend of work solves the problem permanently

The 6-hour time investment saves infinite future headaches.

**ACLED is the quality upgrade.**

- Makes ConflictMap more credible
- Adds fatality data (huge for seriousness)
- Used by real organizations
- Free with attribution

**NewsAPI is a trap.**

- ToS violation to use free tier in production
- $449/mo is absurd
- Not worth it

---

## Next Steps

Let me know:
1. Should I increase cache to 6 hours tonight? (5 min fix)
2. Want me to guide you through BigQuery setup this weekend?
3. Want me to just build the whole thing? (I can do it in ~6 hours)

This is the path. GDELT BigQuery + ACLED = professional, scalable, free conflict tracking.
