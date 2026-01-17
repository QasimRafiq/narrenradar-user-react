// Reverse geocoding function to get city name from lat/long (matching Android BigDataCloud usage)
export const getCityName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Validate coordinates (check for NaN, 0, null, or undefined) - matching Android
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

    // Using BigDataCloud API (matching Android implementation exactly)
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();

    if (data) {
      // Matching Android: Get locality first (using optString equivalent)
      // Android code: val cityName = jsonObject.optString("locality", "")
      let cityName = data.locality || "";

      if (cityName && cityName.trim()) {
        return cityName.trim();
      }

      // Fallback: try city or principalSubdivision (matching Android fallback logic)
      // Android: val fallbackCity = jsonObject.optString("city", "") .takeIf { it.isNotEmpty() } ?: jsonObject.optString("principalSubdivision", "")
      const fallbackCity =
        (data.city && data.city.trim()) ||
        (data.principalSubdivision && data.principalSubdivision.trim()) ||
        "";

      if (fallbackCity) {
        return fallbackCity.trim();
      }
    }

    return "";
  } catch (error) {
    // Error getting city name - handled silently (return empty string like Android)
    return "";
  }
};

