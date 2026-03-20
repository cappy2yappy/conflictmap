# BigQuery Setup Documentation

## Overview
ConflictMap uses Google Cloud BigQuery to query the GDELT Event Database directly, avoiding rate limits and providing unlimited free access to global conflict data.

## Local Development

**Credentials file location:**
```
~/.openclaw/workspace/projects/conflictmap/bigquery-credentials.json
```

**Start dev server:**
```bash
cd ~/.openclaw/workspace/projects/conflictmap
npm run dev
```

**Test API endpoint:**
```bash
curl http://localhost:3000/api/conflicts | jq '.count, .source'
```

Expected output: `50` conflicts with `source: "bigquery"`

## Production (Vercel)

**Environment variable:**
- Name: `BIGQUERY_CREDENTIALS_JSON`
- Value: Base64-encoded service account JSON
- Environments: Production, Preview, Development

**Get base64 value:**
```bash
cat ~/.openclaw/workspace/projects/conflictmap/bigquery-credentials.json | base64
```

**Set in Vercel:**
1. Go to: https://vercel.com/cappy2yappy/conflictmap/settings/environment-variables
2. Add variable with name and base64 value
3. Select all environments
4. Save
5. Redeploy latest deployment

## How It Works

1. **Server-side only:** BigQuery runs in `/api/conflicts` route (not client-side)
2. **Query:** Fetches last 24 hours of GDELT events with `GoldsteinScale < -3`
3. **Filtering:** Event codes 14x, 15x, 17x, 18x, 19x, 20x (conflict-related)
4. **Parsing:** Extracts location, severity, actors, and generates titles
5. **Caching:** Results cached for 6 hours (s-maxage=21600)
6. **Fallback:** Uses curated data if BigQuery fails

## BigQuery Details

**Project:** conflictmap-490800  
**Dataset:** `gdelt-bq.gdeltv2.events`  
**Service account:** conflictmap-bigquery@conflictmap-490800.iam.gserviceaccount.com  
**Role:** BigQuery User

**Query structure:**
```sql
SELECT 
  SQLDATE, Actor1Name, Actor2Name, EventCode,
  GoldsteinScale, NumMentions, 
  ActionGeo_FullName, ActionGeo_Lat, ActionGeo_Long,
  SOURCEURL, AvgTone
FROM `gdelt-bq.gdeltv2.events`
WHERE 
  SQLDATE >= YYYYMMDD
  AND GoldsteinScale < -3
  AND ActionGeo_Lat IS NOT NULL
  AND ActionGeo_Long IS NOT NULL
  AND EventCode IN ('140', '141', ... '204')
ORDER BY NumMentions DESC, GoldsteinScale ASC
LIMIT 50
```

## Event Code Mapping

- **14x:** Protest  
- **15x:** Exhibit force posture (civil unrest)  
- **17x:** Coerce (political violence)  
- **18x:** Assault (armed conflict)  
- **19x:** Fight (armed conflict)  
- **20x:** Use unconventional violence (terrorism)

## Severity Mapping

Based on Goldstein scale (-10 to +10, negative = conflict):

| Goldstein | Mentions | Severity |
|-----------|----------|----------|
| ≤ -8 | any | critical |
| ≤ -6 | > 50 | critical |
| ≤ -5 | any | high |
| ≤ -4 | > 50 | high |
| ≤ -2 | any | medium |
| > -2 | any | low |

## Cost & Usage

**Free tier:** 1 TB queries/month  
**Expected usage:** ~0.1 TB/month  
**Cost:** $0/month (well within free tier)  

**Calculation:**
- Each query: ~10 MB (GDELT events table)
- Cache: 6 hours
- Requests/day: ~4-5 (with cache)
- Monthly: ~150 queries × 10 MB = 1.5 GB
- **Total: 0.0015 TB/month** (0.15% of free tier)

## Monitoring

**Check BigQuery usage:**
https://console.cloud.google.com/bigquery?project=conflictmap-490800

**View jobs:**
https://console.cloud.google.com/bigquery?project=conflictmap-490800&p=conflictmap-490800&page=jobs

**Check Vercel logs:**
https://vercel.com/cappy2yappy/conflictmap/logs

## Troubleshooting

**Issue:** API returns `source: "fallback"` instead of `source: "bigquery"`

**Causes:**
1. Vercel environment variable not set or incorrect
2. BigQuery credentials invalid
3. Network error (BigQuery API down)
4. Query timeout (unlikely with our query size)

**Debug:**
1. Check Vercel logs for errors
2. Verify environment variable is set correctly
3. Test locally to confirm query works
4. Check BigQuery quota/billing status

**Issue:** Build fails with "Module not found: Can't resolve 'fs'"

**Cause:** BigQuery client imported in client-side code

**Fix:** Ensure BigQuery is only imported in `/api/conflicts/route.ts` (server-side)

## Future Enhancements

1. **Add ACLED data** - High-quality conflict-specific data
2. **Historical queries** - Query last 7 days, 30 days, etc.
3. **Custom filters** - Filter by country, region, event type in UI
4. **Trend analysis** - Show conflict increase/decrease over time
5. **Advanced severity** - Combine Goldstein + AvgTone + fatality estimates

## Credentials Security

**⚠️ NEVER commit bigquery-credentials.json to git!**

File is in `.gitignore` and should stay there. Only share base64 value through secure channels (Vercel environment variables, encrypted messages, etc.).

**Rotate credentials if:**
- Credentials are accidentally exposed publicly
- Service account key is compromised
- Annual security review

**To rotate:**
1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts?project=conflictmap-490800
2. Click on conflictmap-bigquery service account
3. Keys tab → Delete old key → Create new key
4. Update local file and Vercel environment variable

---

**Built:** March 19-20, 2026  
**Author:** Cappy 🧢
