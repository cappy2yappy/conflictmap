# ConflictMap Development Progress

## Night 0 - March 16, 2026 (Kickoff Build)

### Completed
- **Data Source Research**: Documented ACLED and GDELT APIs in `docs/data-sources.md`
  - ACLED: Free non-commercial, OAuth auth, weekly updates, 200+ countries, human-verified
  - GDELT: Fully free/open, no auth, 15-min updates, GeoJSON output, machine-coded
  - Strategy: Start with GDELT (easier), add ACLED for quality
- **Project Setup**: Next.js 14 + TypeScript + Tailwind CSS + ESLint
- **Map Integration**: Leaflet with CARTO dark basemap tiles (free, no API key)
- **Components Built**:
  - `ConflictMap` - Full-screen Leaflet map with dark theme, dynamic imports (no SSR)
  - `SidePanel` - Collapsible panel with event list + detail view
  - Custom `DivIcon` markers with severity-based colors and glow effects
  - Fly-to animation when selecting a conflict
  - Legend overlay showing severity scale
  - Toggle button to hide/show side panel
- **Sample Data**: 10 real-world conflict zones with realistic data:
  - Ukraine, Sudan, Myanmar, Gaza, Mali, DRC, Ethiopia, Colombia, Somalia, Haiti
- **Types**: Full TypeScript types for ConflictEvent, Severity, ConflictType

### Architecture
```
src/
  app/
    layout.tsx     - Dark theme layout with metadata
    page.tsx       - Main page (client component, state management)
    globals.css    - Tailwind + Leaflet dark theme overrides
  components/
    ConflictMap.tsx - Leaflet map (dynamically imported, no SSR)
    SidePanel.tsx   - Event list + detail panel
  lib/
    types.ts        - TypeScript interfaces
    sample-data.ts  - 10 sample conflict events
    marker-icons.ts - Severity-based custom markers
docs/
  data-sources.md   - ACLED + GDELT API research
```

### Build Status
- Production build: PASSING (92 kB first load JS)
- No TypeScript errors
- No ESLint warnings
