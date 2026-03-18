# ConflictMap Launch Plan - Thursday March 19, 2026

## Launch Strategy

**Domain:** conflictmap.vercel.app (FREE)
- Launch with Vercel subdomain
- Upgrade to custom domain if we hit 1K+ users in 2 weeks
- Target: conflictmap.io ($35/year) - only buy if validated

**Total upfront cost:** $0

---

## Timeline

### Tonight - March 17, 2 AM (Automated)
**Night 1 Build - News Integration**
- [x] GDELT DOC API integration
- [x] News article fetcher
- [x] Side panel: "Recent News" section
- [x] Article cards with sources
- [x] Status: Check at 8 AM Wednesday

### Wednesday - March 18
**Daytime**
- [ ] Review Night 1 build progress
- [ ] Add zoom-level filtering (if Night 1 complete)
- [ ] Test multi-level zoom transitions

**Night - 2 AM (Automated)**
**Night 2 Build - Twitter Integration**
- [ ] Twitter/X feed integration
- [ ] Curated account list (20 verified)
- [ ] Social media section in panel
- [ ] Test with Ukraine/Gaza conflicts

### Thursday - March 19 (LAUNCH DAY)

**Morning (7-9 AM)**
- [ ] Check Night 2 build status
- [ ] Final production build: `npm run build`
- [ ] Test locally: `npm run start`
- [ ] Fix any critical bugs

**9-11 AM: Deployment**
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Get live URL: conflictmap.vercel.app
- [ ] Test on mobile + desktop
- [ ] Verify all features working

**11 AM - 12 PM: Content Prep**
- [ ] Take 5 screenshots (homepage, zoom levels, detail view)
- [ ] Write Product Hunt description (200 words)
- [ ] Write tweet thread (5-7 tweets)
- [ ] Prepare Reddit post (r/Maps, r/geopolitics, r/DataIsBeautiful)

**12-2 PM: Final Testing**
- [ ] Share conflictmap.vercel.app with Alex (get feedback)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Double-check all links work
- [ ] Verify news articles loading
- [ ] Verify Twitter feeds showing

**2 PM: LAUNCH**
- [ ] Submit to Product Hunt
- [ ] Post to Reddit (3 subreddits)
- [ ] Post to Hacker News (Show HN)
- [ ] Tweet from personal account
- [ ] Post in ConflictMap Discord thread

**2-6 PM: Monitor & Engage**
- [ ] Respond to comments on all platforms
- [ ] Watch for bug reports
- [ ] Track analytics (Vercel dashboard)
- [ ] Note feature requests

---

## MVP Feature Checklist

### Core Features (Must Have)
- [x] Interactive dark map
- [x] 10+ conflict markers
- [x] Severity-based colors
- [x] Side panel with details
- [ ] News articles (5-10 per conflict) ← Night 1
- [ ] Twitter feeds (5 tweets per conflict) ← Night 2
- [ ] Zoom-level filtering ← Wednesday
- [x] Mobile responsive
- [x] Fast loading (<3 sec)

### Nice to Have (If Time Permits)
- [ ] Search/filter by country
- [ ] Date range filter
- [ ] Share button
- [ ] Loading skeletons

### Cut for v1.1
- ACLED API integration
- User accounts
- Historical timeline
- Email alerts
- Custom domain (until validated)

---

## Launch Copy

### Tagline
"Free, open-source interactive map tracking armed conflicts and political violence worldwide."

### Product Hunt Title
"ConflictMap - Interactive global conflict tracker with real-time data"

### Product Hunt Description (200 words)
"ConflictMap is a free, open-source tool that aggregates conflict data from ACLED, GDELT, verified Twitter sources, and news outlets into a single interactive map.

**What makes it different:**
- Multi-level zoom: Click a conflict → zoom from strategic overview to street-level incidents
- Real-time updates from verified OSINT accounts (@Conflicts, @IntelDoge, @RALee85)
- News articles from 50+ sources (Reuters, BBC, AP, Al Jazeera)
- No ads, no paywalls, no tracking

**Built for:**
- Researchers studying global conflict patterns
- Journalists covering international news
- Educators teaching geopolitics
- Anyone wanting to understand world events through data

**Technical details:**
- Next.js 14 + TypeScript
- Leaflet maps with CARTO dark tiles
- GDELT API for event data
- Twitter API for real-time updates
- Hosted on Vercel (100% free to use)

This is a public good, not a commercial product. All code will be open-sourced on GitHub.

Built by Laibyrinth (AI training company) as a portfolio project and contribution to open conflict research."

### Tweet Thread
```
1/ 🌍 Launching ConflictMap today - a free, open-source interactive map tracking armed conflicts worldwide.

No ads. No paywalls. Just data.

conflictmap.vercel.app

2/ What makes it different:

✅ Multi-level zoom (world → country → city)
✅ Real-time Twitter feeds from @Conflicts, @IntelDoge, @RALee85
✅ News articles from 50+ sources
✅ Zero cost to use

3/ Click any conflict marker → see:

📰 10-20 news articles from Reuters, BBC, AP
🐦 Recent tweets from verified OSINT accounts
📍 Exact coordinates and casualty reports
🔗 Direct links to sources

4/ Data sources:

• ACLED (academic conflict database)
• GDELT (real-time event data)
• Curated Twitter accounts (verified only)
• RSS from major news outlets

All free, open APIs. No proprietary data.

5/ Built for researchers, journalists, educators, and anyone wanting to understand global conflicts through spatial data.

This is a public good, not a business.

Try it: conflictmap.vercel.app

Feedback welcome 👇
```

### Reddit Post (r/Maps)
**Title:** [OC] ConflictMap - Interactive map tracking global conflicts with real-time data

**Body:**
I built a free tool to visualize armed conflicts and political violence worldwide using ACLED, GDELT, and verified Twitter sources.

**Features:**
- Multi-level zoom (click Ukraine → see 15 regional incidents)
- News articles from 50+ outlets (Reuters, BBC, AP)
- Real-time Twitter feeds from @Conflicts, @IntelDoge, @RALee85
- Dark theme Leaflet map with CARTO tiles
- Mobile responsive

**Why I built it:**
Existing conflict trackers (ACLED, LiveUAMap) are either too academic or too news-focused. I wanted something spatial-first that lets you explore from strategic overview down to street-level incidents.

**Tech stack:** Next.js 14, TypeScript, Leaflet, Vercel

**Link:** conflictmap.vercel.app

Completely free, no ads, no paywalls. Open-sourcing the code soon.

Feedback welcome!

---

## Success Metrics (Week 1)

### Traffic (Conservative)
- 500+ unique visitors
- 2,000+ map interactions
- 50+ return visitors

### Social Engagement
- 30+ Product Hunt upvotes
- 100+ Reddit upvotes (combined)
- 20+ retweets

### Validation Threshold
**If we hit 1,000+ users in 2 weeks:**
→ Buy conflictmap.io domain ($35/year)
→ Add custom domain to Vercel
→ Upgrade to v1.1 features

**If we don't:**
→ Keep free subdomain
→ Iterate based on feedback
→ Consider pivot or sunset

---

## Post-Launch Tasks

### Immediate (Week 1)
- [ ] Monitor Vercel analytics
- [ ] Respond to all feedback
- [ ] Fix critical bugs (P0)
- [ ] Add Google Analytics (optional)

### Week 2
- [ ] Compile feature requests
- [ ] Decide: buy domain or iterate?
- [ ] Plan v1.1 roadmap
- [ ] Consider GitHub open-source release

### Week 3-4
- [ ] ACLED API integration (if validated)
- [ ] Historical data (last 30 days)
- [ ] Advanced clustering
- [ ] Heatmap view

---

## Known Risks & Mitigations

**Risk:** Low traffic, no adoption
**Mitigation:** Iterate based on feedback, post in more subreddits, reach out to conflict researchers

**Risk:** GDELT API downtime
**Mitigation:** Cache responses (15 min), show "last updated" timestamp, fallback to sample data

**Risk:** Twitter API rate limits
**Mitigation:** Use Nitter RSS as backup, limit to 5 tweets per conflict

**Risk:** Negative press ("glorifying violence")
**Mitigation:** Clear messaging: "educational tool for researchers," not entertainment

**Risk:** Hosting costs if viral
**Mitigation:** Vercel free tier handles 100GB bandwidth/month, upgrade to Pro ($20/mo) only if needed

---

## Budget

**Launch (Thursday):** $0
**Week 1:** $0
**If validated (Week 3+):** $35/year domain

**Break-even:** Never (it's free)

This is a portfolio piece and public good, not a revenue generator.

---

## Communication Strategy

**Positioning:** Educational research tool
**Target audience:** Researchers, journalists, educators, policy analysts
**Tone:** Professional, factual, humanitarian (not sensationalist)

**NOT:**
- News aggregator
- Entertainment
- War porn
- Commercial product

**Key message:**
"Free public good to understand global conflicts through spatial data."
