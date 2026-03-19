export interface GeocodedLocation {
  lat: number;
  lng: number;
  country: string;
  region: string;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    country?: string;
    state?: string;
    region?: string;
    county?: string;
  };
}

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const geocodeCache = new Map<string, { timestamp: number; value: GeocodedLocation | null }>();
let lastRequestAt = 0;

const COUNTRY_FALLBACKS: Record<string, GeocodedLocation> = {
  ukraine: { lat: 48.3794, lng: 31.1656, country: "Ukraine", region: "Eastern Europe", displayName: "Ukraine" },
  sudan: { lat: 15.5007, lng: 32.5599, country: "Sudan", region: "East Africa", displayName: "Sudan" },
  palestine: { lat: 31.9522, lng: 35.2332, country: "Palestine", region: "Middle East", displayName: "Palestine" },
  israel: { lat: 31.0461, lng: 34.8516, country: "Israel", region: "Middle East", displayName: "Israel" },
  myanmar: { lat: 21.9162, lng: 95.9560, country: "Myanmar", region: "Southeast Asia", displayName: "Myanmar" },
  syria: { lat: 34.8021, lng: 38.9968, country: "Syria", region: "Middle East", displayName: "Syria" },
  russia: { lat: 61.524, lng: 105.3188, country: "Russia", region: "Eastern Europe", displayName: "Russia" },
  iran: { lat: 32.4279, lng: 53.688, country: "Iran", region: "Middle East", displayName: "Iran" },
  iraq: { lat: 33.2232, lng: 43.6793, country: "Iraq", region: "Middle East", displayName: "Iraq" },
  yemen: { lat: 15.5527, lng: 48.5164, country: "Yemen", region: "Middle East", displayName: "Yemen" },
  ethiopia: { lat: 9.145, lng: 40.4897, country: "Ethiopia", region: "East Africa", displayName: "Ethiopia" },
  somalia: { lat: 5.1521, lng: 46.1996, country: "Somalia", region: "East Africa", displayName: "Somalia" },
  mali: { lat: 17.5707, lng: -3.9962, country: "Mali", region: "West Africa", displayName: "Mali" },
  nigeria: { lat: 9.082, lng: 8.6753, country: "Nigeria", region: "West Africa", displayName: "Nigeria" },
  haiti: { lat: 18.9712, lng: -72.2852, country: "Haiti", region: "Caribbean", displayName: "Haiti" },
  colombia: { lat: 4.5709, lng: -74.2973, country: "Colombia", region: "South America", displayName: "Colombia" },
  france: { lat: 46.2276, lng: 2.2137, country: "France", region: "Western Europe", displayName: "France" },
  "united states": { lat: 39.8283, lng: -98.5795, country: "United States", region: "North America", displayName: "United States" },
  "united kingdom": { lat: 55.3781, lng: -3.436, country: "United Kingdom", region: "Western Europe", displayName: "United Kingdom" },
  india: { lat: 20.5937, lng: 78.9629, country: "India", region: "South Asia", displayName: "India" },
  brazil: { lat: -14.235, lng: -51.9253, country: "Brazil", region: "South America", displayName: "Brazil" },
  argentina: { lat: -38.4161, lng: -63.6167, country: "Argentina", region: "South America", displayName: "Argentina" },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fallbackGeocode(query: string): GeocodedLocation | null {
  const normalizedQuery = query.trim().toLowerCase();

  for (const [country, value] of Object.entries(COUNTRY_FALLBACKS)) {
    if (normalizedQuery.includes(country)) {
      return value;
    }
  }

  return null;
}

export async function geocodeLocation(query: string): Promise<GeocodedLocation | null> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return null;
  }

  const cacheKey = trimmedQuery.toLowerCase();
  const cached = geocodeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  const elapsedSinceLastRequest = Date.now() - lastRequestAt;
  if (elapsedSinceLastRequest < 1000) {
    await sleep(1000 - elapsedSinceLastRequest);
  }

  lastRequestAt = Date.now();

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      headers: {
        "User-Agent": "ConflictMap/1.0 (contact: launch@conflictmap.app)",
        Accept: "application/json",
      },
      next: { revalidate: 24 * 60 * 60 },
    });

    if (!response.ok) {
      const fallback = fallbackGeocode(trimmedQuery);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), value: fallback });
      return fallback;
    }

    const payload = (await response.json()) as NominatimResult[];
    const firstResult = payload[0];

    if (!firstResult) {
      const fallback = fallbackGeocode(trimmedQuery);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), value: fallback });
      return fallback;
    }

    const lat = Number.parseFloat(firstResult.lat);
    const lng = Number.parseFloat(firstResult.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const fallback = fallbackGeocode(trimmedQuery);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), value: fallback });
      return fallback;
    }

    const location: GeocodedLocation = {
      lat,
      lng,
      country: firstResult.address?.country ?? trimmedQuery,
      region:
        firstResult.address?.state ??
        firstResult.address?.region ??
        firstResult.address?.county ??
        firstResult.address?.country ??
        "Unknown",
      displayName: firstResult.display_name,
    };

    geocodeCache.set(cacheKey, { timestamp: Date.now(), value: location });
    return location;
  } catch (error) {
    console.error("[Geocoding] Failed for query", trimmedQuery, error);
    const fallback = fallbackGeocode(trimmedQuery);
    geocodeCache.set(cacheKey, { timestamp: Date.now(), value: fallback });
    return fallback;
  }
}
