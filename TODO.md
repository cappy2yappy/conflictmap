# ConflictMap TODO

## Phase 1: Research & Setup (Night 0) - COMPLETE
- [x] Research ACLED API access (academic/non-profit tier)
- [x] Research GDELT data access
- [x] Document findings in docs/data-sources.md
- [x] Set up Next.js 14 + TypeScript + Tailwind project
- [x] Install Leaflet + react-leaflet
- [x] Build basic Leaflet map component with world view
- [x] Add 10 sample conflict markers (hardcoded data)
- [x] Build side panel with event list and detail view
- [x] Click marker → fly to location + show conflict info

## Phase 2: Data Pipeline (Night 1-3)
- [ ] Register for ACLED API access
- [ ] Build GDELT GEO API fetcher (no auth needed - start here)
- [ ] Build GDELT DOC API fetcher for news context
- [ ] Build ACLED API fetcher
- [ ] Create unified ConflictEvent normalization layer
- [ ] Set up Supabase database with conflict events table
- [ ] Build API route: GET /api/conflicts
- [ ] Replace hardcoded data with live API data

## Phase 3: Map UI Enhancement (Night 4-6)
- [ ] Marker clustering for dense regions
- [ ] Filter UI (conflict type, severity, date range)
- [ ] Timeline scrubber component
- [ ] Search/filter by country or region
- [ ] Tooltip on marker hover (before click)
- [ ] Heat map layer toggle

## Phase 4: Polish & Deploy (Night 7-10)
- [ ] Mobile responsive design
- [ ] Loading states and error handling
- [ ] Cron job for periodic data refresh
- [ ] Performance optimization (lazy loading, caching)
- [ ] Deploy to Vercel
- [ ] Add OpenGraph meta / social sharing

## Current Night: 0 - COMPLETE
Working prototype with interactive map and sample data.
