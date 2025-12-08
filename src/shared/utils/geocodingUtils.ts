// Reverse geocoding function to get city name from lat/long
export const getCityName = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    if (!latitude || !longitude) return null;
    
    // Using BigDataCloud API for faster and better response
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`;
    const response = await fetch(url);
    
    const data = await response.json();
    
    if (data) {
      // Try to get city name from various possible fields
      return (
        data.locality ||
        data.city ||
        data.principalSubdivision ||
        null
      );
    }
    
    return null;
  } catch (error) {
    console.log("Error getting city name:", error);
    return null;
  }
};

