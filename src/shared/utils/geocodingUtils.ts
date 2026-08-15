import AsyncStorage from "@react-native-async-storage/async-storage";

const GEOCODE_CACHE_KEY = "@narrenradar_city_cache";

// In-memory cache for fast synchronous lookups
const memoryCache: Record<string, string> = {};
let isHydrated = false;

// Hydrate memory cache from AsyncStorage on startup
export const hydrateCityCache = async (): Promise<void> => {
  if (isHydrated) return;
  try {
    const json = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
    if (json) {
      const data = JSON.parse(json);
      Object.assign(memoryCache, data);
    }
  } catch (err) {
    console.log("Error hydrating geocode cache:", err);
  } finally {
    isHydrated = true;
  }
};

// Start hydration immediately
hydrateCityCache();

export const getCoordKey = (lat: number, lng: number): string => {
  return `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
};

export const getCachedCityName = (latitude: number, longitude: number): string => {
  if (!latitude || !longitude) return "";
  const key = getCoordKey(latitude, longitude);
  return memoryCache[key] || "";
};

export const saveCityToCache = async (
  latitude: number,
  longitude: number,
  cityName: string
): Promise<void> => {
  if (!cityName || !cityName.trim()) return;
  const key = getCoordKey(latitude, longitude);
  memoryCache[key] = cityName.trim();

  try {
    await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (err) {
    console.log("Error saving city to cache:", err);
  }
};

// Extract city from event fields as an instant offline fallback
export const extractCityFromEvent = (item: any): string => {
  if (!item) return "";
  if (item.city && typeof item.city === "string" && item.city.trim()) {
    return item.city.trim();
  }
  if (item.ort && typeof item.ort === "string" && item.ort.trim()) {
    return item.ort.trim();
  }

  // Check locations array
  const loc = Array.isArray(item.locations) && item.locations[0];
  if (loc) {
    if (loc.city && typeof loc.city === "string" && loc.city.trim()) {
      return loc.city.trim();
    }
    if (loc.ort && typeof loc.ort === "string" && loc.ort.trim()) {
      return loc.ort.trim();
    }
    if (loc.address && typeof loc.address === "string") {
      // Check for German postal code + city: e.g. "72336 Balingen" or "72336 Balingen, Deutschland"
      const postalMatch = loc.address.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\s\-\/]+?)(?:,|$)/);
      if (postalMatch && postalMatch[1]) {
        return postalMatch[1].trim();
      }
      // Or split by comma
      const parts = loc.address.split(",").map((p: string) => p.trim());
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        const cleaned = lastPart.replace(/^\d{5}\s*/, "").trim();
        if (
          cleaned &&
          !cleaned.toLowerCase().includes("deutschland") &&
          !cleaned.toLowerCase().includes("germany")
        ) {
          return cleaned;
        }
      }
    }
  }

  // Check eventLocation
  if (item.eventLocation && typeof item.eventLocation === "string") {
    const parts = item.eventLocation.split(",").map((p: string) => p.trim());
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
  }

  return "";
};

// Reverse geocoding function with local persistent cache (works 100% offline)
export const getCityName = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    if (
      !latitude ||
      !longitude ||
      latitude === 0 ||
      longitude === 0 ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return "";
    }

    await hydrateCityCache();

    const coordKey = getCoordKey(latitude, longitude);
    if (memoryCache[coordKey]) {
      return memoryCache[coordKey];
    }

    // Using BigDataCloud API
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return memoryCache[coordKey] || "";
    }

    const data = await response.json();
    if (data) {
      let cityName = data.locality || "";
      if (!cityName || !cityName.trim()) {
        cityName =
          (data.city && data.city.trim()) ||
          (data.principalSubdivision && data.principalSubdivision.trim()) ||
          "";
      }

      if (cityName && cityName.trim()) {
        const trimmed = cityName.trim();
        saveCityToCache(latitude, longitude, trimmed);
        return trimmed;
      }
    }

    return memoryCache[coordKey] || "";
  } catch (error) {
    // Offline or network error - return cached city if available
    const coordKey = getCoordKey(latitude, longitude);
    return memoryCache[coordKey] || "";
  }
};
