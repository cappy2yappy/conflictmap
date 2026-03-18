// Curated list of verified conflict monitoring Twitter accounts

export interface TwitterAccount {
  handle: string;
  name: string;
  focus: string;
  verified: boolean;
}

export const CONFLICT_MONITORS: TwitterAccount[] = [
  // Global Conflict Monitors
  {
    handle: "Conflicts",
    name: "Conflict News",
    focus: "Global conflicts, real-time updates",
    verified: true,
  },
  {
    handle: "IntelDoge",
    name: "Intel Doge",
    focus: "OSINT aggregator, military intelligence",
    verified: true,
  },
  {
    handle: "OSINTdefender",
    name: "OSINT Defender",
    focus: "Open source intelligence, breaking news",
    verified: true,
  },
  {
    handle: "WarMonitors",
    name: "War Monitors",
    focus: "Real-time war updates",
    verified: true,
  },
  {
    handle: "sentdefender",
    name: "Sentinel",
    focus: "Breaking defense news worldwide",
    verified: true,
  },

  // Regional Specialists
  {
    handle: "RALee85",
    name: "Rob Lee",
    focus: "Russia/Ukraine expert",
    verified: true,
  },
  {
    handle: "Osinttechnical",
    name: "OSINT Technical",
    focus: "Military technology analysis",
    verified: true,
  },
  {
    handle: "michaelh992",
    name: "Michael Horowitz",
    focus: "Middle East conflicts",
    verified: true,
  },
  {
    handle: "Nrg8000",
    name: "Myanmar Witness",
    focus: "Myanmar resistance",
    verified: false,
  },
  {
    handle: "HN_Schlottman",
    name: "Helena",
    focus: "Sudan conflicts",
    verified: false,
  },
  {
    handle: "ELINTNews",
    name: "ELINT News",
    focus: "Electronic intelligence, aviation",
    verified: true,
  },
  {
    handle: "CalibreObscura",
    name: "Calibre Obscura",
    focus: "Weapons identification",
    verified: false,
  },

  // Aid Organizations
  {
    handle: "WHO",
    name: "World Health Organization",
    focus: "Health crisis updates",
    verified: true,
  },
  {
    handle: "UNICEF",
    name: "UNICEF",
    focus: "Civilian impact, children",
    verified: true,
  },
  {
    handle: "MSF",
    name: "Doctors Without Borders",
    focus: "Ground truth, humanitarian",
    verified: true,
  },

  // Regional Updates
  {
    handle: "oryxspioenkop",
    name: "Oryx",
    focus: "Equipment losses (photo-verified)",
    verified: false,
  },
  {
    handle: "KyivIndependent",
    name: "Kyiv Independent",
    focus: "Ukraine news",
    verified: true,
  },
  {
    handle: "Liveuamap",
    name: "LiveUAMap",
    focus: "Interactive conflict maps",
    verified: true,
  },
  {
    handle: "NotWoofers",
    name: "Status-6",
    focus: "Russia military analysis",
    verified: false,
  },
  {
    handle: "AuroraIntel",
    name: "Aurora Intel",
    focus: "Global OSINT",
    verified: false,
  },
];

/**
 * Get relevant Twitter accounts for a specific location/conflict
 * @param location Country or region name
 * @returns Filtered list of relevant accounts
 */
export function getRelevantAccounts(location: string): TwitterAccount[] {
  const lowerLocation = location.toLowerCase();

  // Regional filtering
  if (lowerLocation.includes("ukraine") || lowerLocation.includes("russia")) {
    return CONFLICT_MONITORS.filter(
      (acc) =>
        acc.focus.toLowerCase().includes("ukraine") ||
        acc.focus.toLowerCase().includes("russia") ||
        acc.focus.toLowerCase().includes("global")
    );
  }

  if (
    lowerLocation.includes("gaza") ||
    lowerLocation.includes("palestine") ||
    lowerLocation.includes("israel") ||
    lowerLocation.includes("middle east")
  ) {
    return CONFLICT_MONITORS.filter(
      (acc) =>
        acc.focus.toLowerCase().includes("middle east") ||
        acc.focus.toLowerCase().includes("global")
    );
  }

  if (lowerLocation.includes("myanmar")) {
    return CONFLICT_MONITORS.filter(
      (acc) =>
        acc.focus.toLowerCase().includes("myanmar") ||
        acc.focus.toLowerCase().includes("global")
    );
  }

  if (lowerLocation.includes("sudan")) {
    return CONFLICT_MONITORS.filter(
      (acc) =>
        acc.focus.toLowerCase().includes("sudan") ||
        acc.focus.toLowerCase().includes("global")
    );
  }

  // Default: return global monitors + aid orgs
  return CONFLICT_MONITORS.filter(
    (acc) =>
      acc.focus.toLowerCase().includes("global") ||
      acc.focus.toLowerCase().includes("humanitarian") ||
      acc.focus.toLowerCase().includes("osint")
  );
}

/**
 * Build Twitter search URL for a specific conflict
 * @param location Location name
 * @param accounts List of Twitter handles to search
 * @returns Twitter search URL
 */
export function buildTwitterSearchURL(
  location: string,
  accounts: string[]
): string {
  const handles = accounts.map((h) => `from:${h}`).join(" OR ");
  const query = `(${handles}) ${location}`;
  return `https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`;
}
