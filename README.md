# ConflictMap - Global Conflict Tracker

**Vision:** Interactive map-first conflict news aggregator. Browse global conflicts by location instead of chronological feeds.

## Current Status
**Night 0 Complete** - Working prototype with interactive dark-themed map, 10 sample conflict markers, and detail side panel.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Map**: Leaflet + react-leaflet (free, no API limits)
- **Tiles**: CARTO dark basemap (free, no key)
- **Data Sources**: ACLED + GDELT (documented in `docs/data-sources.md`)
- **Database**: Supabase free tier (coming Night 3)
- **Hosting**: Vercel free tier (coming Night 7+)

## Features (Current)
- Full-screen interactive world map with dark theme
- 10 conflict markers with severity-based colors (critical/high/medium/low)
- Click marker → fly-to animation + detail panel
- Collapsible side panel with event list and full event details
- Severity legend overlay
- Fully typed with TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure
```
src/
  app/           - Next.js app router pages
  components/    - React components (ConflictMap, SidePanel)
  lib/           - Types, data, utilities
docs/            - Research and documentation
```

## MVP Features (Planned)
- Live data from GDELT (15-min updates) and ACLED (weekly)
- Filter by conflict type, severity, date range
- Timeline scrubber
- Marker clustering
- Mobile responsive
- Search by country/region

## Development Schedule
Nightly builds via Claude Code sessions.

## License
Open source - 100% free stack, no paid services.

Thread: 1483223739259682846
Asana: 1213708317382141
