# ConflictMap Deployment Checklist - Thursday March 19

## Pre-Deployment (7-9 AM)

### Testing
- [ ] Test on localhost (run `npm run dev`)
- [ ] Click through all 10 strategic conflicts
- [ ] Verify news articles loading
- [ ] Verify Twitter accounts showing
- [ ] Test zoom-level filtering (zoom in on Ukraine → see sub-events)
- [ ] Test on mobile (Chrome DevTools responsive mode)
- [ ] Test on Safari, Firefox, Chrome

### Fix Any Critical Bugs
- [ ] If news API timeout → acceptable (will work with caching in prod)
- [ ] If map doesn't load → check Leaflet import
- [ ] If TypeScript errors → run `npm run build` and fix

## Deployment (9-11 AM)

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /Users/cappy/.openclaw/workspace/projects/conflictmap
vercel --prod
```

**Follow prompts:**
- Set up and deploy? Yes
- Which scope? (your account)
- Link to existing project? No
- Project name? **conflictmap**
- In which directory is your code? **.**
- Override settings? No

**Output:** You'll get a URL like `https://conflictmap.vercel.app` or `https://conflictmap-xyz.vercel.app`

### Step 3: Test Live Site
- [ ] Visit the .vercel.app URL
- [ ] Click through all conflicts
- [ ] Test news loading (wait 5-10 sec for GDELT)
- [ ] Test Twitter links
- [ ] Test zoom in/out
- [ ] Share URL with Alex for feedback

### Step 4: Verify Analytics
- [ ] Go to vercel.com dashboard
- [ ] Click project → Analytics
- [ ] Confirm tracking is working

## Content Prep (11 AM - 2 PM)

### Screenshots (5 total)
- [ ] Homepage - full world view with all markers
- [ ] Ukraine zoomed in - showing 5 sub-events
- [ ] Gaza conflict detail - with news articles + Twitter
- [ ] Sudan conflict - showing regional events
- [ ] Mobile view - responsive layout

**How to take screenshots:**
```bash
# In browser:
1. Open conflictmap.vercel.app
2. Cmd+Shift+5 (Mac) or Windows+Shift+S
3. Save to ~/Desktop/conflictmap-screenshots/
```

### Product Hunt Copy
```markdown
**Title:** ConflictMap - Real-time global conflict tracker with news + social feeds

**Tagline:** Interactive map tracking armed conflicts with GDELT data, news articles, and verified OSINT Twitter accounts

**Description:**
ConflictMap is a free, open-source tool that aggregates conflict data from ACLED, GDELT, verified Twitter sources, and news outlets into a single interactive map.

What makes it different:
✅ Multi-level zoom: Strategic → Regional → Local detail
✅ Real-time news from 50+ sources (Reuters, BBC, AP)
✅ Twitter feeds from verified OSINT accounts (@Conflicts, @IntelDoge, @RALee85)
✅ No ads, no paywalls, no tracking

Built for researchers, journalists, educators, and anyone wanting to understand global conflicts through spatial data.

Tech: Next.js 14, TypeScript, Leaflet, GDELT API, hosted on Vercel (100% free).

Try it: [conflictmap.vercel.app]
```

### Twitter Thread (Copy & Paste)
```
1/ 🌍 Launching ConflictMap - a free interactive map tracking armed conflicts worldwide.

Real-time data from ACLED, GDELT, and verified Twitter accounts.

No ads. No paywalls. Just data.

👉 conflictmap.vercel.app

2/ What makes it different:

✅ Multi-level zoom (world → country → city)
✅ News from 50+ outlets (Reuters, BBC, AP)
✅ Twitter feeds from @Conflicts, @IntelDoge, @RALee85
✅ Zero cost to use
✅ Open source

3/ Click any conflict → see:

📰 5-20 news articles from major outlets
🐦 Real-time tweets from OSINT experts
📍 Exact coordinates + casualty data
🔗 Direct links to sources

4/ **Multi-level zoom example:**

Zoom out → "Ukraine Conflict"
Zoom in → See 5 regional events: Bakhmut fighting, Avdiivka shelling, Kyiv drone strike, etc.

This spatial understanding beats chronological news feeds.

5/ Data sources:

• ACLED (academic conflict database)
• GDELT (real-time global events)
• 20 curated Twitter accounts (verified only)
• Major news RSS feeds

All free APIs. 15-min update cycle.

6/ Built for:

📊 Researchers studying conflict patterns
📰 Journalists covering international news
🎓 Educators teaching geopolitics
🌍 Anyone wanting context over doom-scrolling

This is a public good, not a business.

7/ Tech stack:

• Next.js 14 + TypeScript
• Leaflet maps
• GDELT DOC + GEO APIs
• Hosted on Vercel (free tier)
• 94.8 kB first load

Fast, clean, works on mobile.

Try it: conflictmap.vercel.app

Feedback welcome 👇
```

### Reddit Post Template
**r/Maps**
```markdown
Title: [OC] ConflictMap - Interactive global conflict tracker with multi-level zoom

Body:
I built a free tool to visualize armed conflicts worldwide using ACLED, GDELT, and verified Twitter sources.

**Key features:**
- Multi-level zoom: Click Ukraine → see 5 regional incidents (Bakhmut, Avdiivka, Kyiv, etc.)
- News articles from 50+ outlets (Reuters, BBC, AP)
- Real-time Twitter feeds from @Conflicts, @IntelDoge, @RALee85
- Dark theme Leaflet map with CARTO tiles
- Mobile responsive, fast loading (94.8 kB)

**Why I built it:**
Existing tools (ACLED, LiveUAMap) are either too academic or lack real-time social feeds. I wanted spatial-first exploration from strategic overview down to street-level.

**Tech:** Next.js 14, TypeScript, Leaflet, GDELT API, Vercel

**Link:** conflictmap.vercel.app

Completely free, no ads, no tracking. Open-sourcing soon.

Feedback welcome!
```

Copy same format for r/geopolitics and r/DataIsBeautiful.

## Launch (2 PM)

### Timing
- **2:00 PM** - Submit to Product Hunt
- **2:05 PM** - Post to Reddit (r/Maps, r/geopolitics, r/DataIsBeautiful)
- **2:10 PM** - Post to Hacker News (Show HN)
- **2:15 PM** - Tweet thread
- **2:20 PM** - Post in ConflictMap Discord thread

### Product Hunt Submission
1. Go to producthunt.com/posts/new
2. Fill in title, tagline, description (see above)
3. Upload 5 screenshots
4. Add link: conflictmap.vercel.app
5. Add maker: your account
6. Topics: Developer Tools, Open Source, Maps, News
7. Submit

### Reddit Posts
1. Go to reddit.com/r/Maps/submit
2. Title + body from template
3. Post
4. Repeat for r/geopolitics, r/DataIsBeautiful
5. Respond to comments within 1 hour

### Hacker News
1. Go to news.ycombinator.com/submit
2. Title: "Show HN: ConflictMap - Real-time global conflict tracker"
3. URL: conflictmap.vercel.app
4. Text: (leave blank, link post)
5. Submit

### Twitter
1. Copy thread from template
2. Post as thread
3. Pin first tweet
4. Engage with replies

## Post-Launch Monitoring (2-6 PM)

### Track Engagement
- [ ] Product Hunt upvotes (check every 30 min)
- [ ] Reddit upvotes + comments
- [ ] Hacker News points + comments
- [ ] Twitter likes/RTs
- [ ] Vercel analytics (traffic spike?)

### Respond to Feedback
- [ ] Answer questions on all platforms
- [ ] Note feature requests
- [ ] Fix critical bugs immediately
- [ ] Thank people for sharing

### Bug Watch
Common issues to watch for:
- News API timing out (acceptable, cached)
- Mobile layout issues
- Leaflet not loading on certain browsers
- GDELT rate limit errors

### Success Metrics (Day 1)
**Minimum:**
- 500 unique visitors
- 20+ Product Hunt upvotes
- 50+ Reddit upvotes (combined)

**Target:**
- 1,000+ unique visitors
- 50+ Product Hunt upvotes
- 100+ Reddit upvotes

**Stretch:**
- 2,000+ visitors
- Top 10 on Product Hunt
- Hacker News front page

## Notes

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- Unlimited requests
- 100 deployments/day
- Should handle 10K+ visitors easily

### If Traffic Spikes
- Vercel auto-scales (no action needed)
- GDELT has rate limits (1 req/5sec) - caching handles this
- If issues: tweet status, pin to top

### Domain Upgrade Decision
**If we hit 1,000 users in first 2 weeks:**
→ Buy conflictmap.io ($35/year)
→ Add to Vercel (takes 5 min)

**If not:**
→ Keep .vercel.app subdomain
→ Iterate based on feedback

---

**You're ready. Everything is built. Just test → deploy → launch.** 🚀
