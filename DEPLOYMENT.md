# ConflictMap Deployment Guide

## Domain Status
- ❌ conflictmap.org - TAKEN
- ✅ conflictmap.io - **AVAILABLE** ($12-15/year) - RECOMMENDED
- ✅ conflictwatch.org - AVAILABLE ($12-15/year)

**Recommended:** conflictmap.io (clean, short, tech-standard)

## Deploy to Vercel (Free)

### Option 1: CLI Deployment (Fastest)
```bash
cd /Users/cappy/.openclaw/workspace/projects/conflictmap
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: conflictmap
# - Directory: . (current)
# - Override settings? No
```

### Option 2: GitHub + Vercel (Best for auto-deploy)
```bash
# 1. Create GitHub repo
gh repo create conflictmap --public --source=.
git push origin main

# 2. Connect to Vercel:
# - Go to vercel.com
# - New Project → Import Git Repository
# - Select conflictmap repo
# - Deploy
```

## Custom Domain Setup (After Deployment)

### Buy Domain
- Go to Namecheap, Porkbun, or Cloudflare
- Purchase conflictmap.io ($12-15/year)

### Add to Vercel
1. Vercel dashboard → Project Settings → Domains
2. Add conflictmap.io
3. Copy DNS records Vercel provides
4. Add to domain registrar's DNS settings:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
   - Type: A
   - Name: @
   - Value: 76.76.21.21
5. Wait 24-48 hours for propagation (usually ~10 min)

## Post-Deployment

### SSL Certificate
- Auto-issued by Vercel (free Let's Encrypt)
- No action needed

### Environment Variables (for later)
When adding live APIs:
```
GDELT_API_URL=https://api.gdeltproject.org/api/v2
ACLED_API_KEY=your_key_here
```

## Current Build Status
- ✅ Next.js 14 + TypeScript + Tailwind
- ✅ Leaflet map with dark theme
- ✅ 10 sample conflicts
- ✅ Side panel with event details
- ✅ Severity markers
- ✅ Production build passing (92 kB)
- ⏳ Live GDELT/ACLED data (Night 1)
- ⏳ News article integration (Night 1)

## Branding
- Standalone product (not Laibyrinth branded)
- Small footer credit: "Built by Laibyrinth" (links to laibyrinth.com)
- Free, open-source tool

## Cost Breakdown
- Hosting: $0 (Vercel free tier)
- Domain: $12-15/year
- APIs: $0 (GDELT free, ACLED free for non-commercial)
- **Total: ~$15/year**

## Next Steps After Deploy
1. Buy conflictmap.io domain
2. Add custom domain to Vercel
3. Update DNS settings
4. Share on Product Hunt, Reddit, Hacker News
5. Submit to directories (alternativeTo, saashub, etc.)
6. Monitor analytics (Vercel built-in)
