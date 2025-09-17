import { AddressService } from '@/services/addressService';

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, { lat: number; lng: number }>();

// Convert address to coordinates using Kakao Maps API
export const addressToCoordinates = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  // Check cache first
  if (geocodingCache.has(address)) {
    return geocodingCache.get(address)!;
  }

  try {
    const result = await AddressService.getCoordinatesFromAddress(address);

    if (result && result.x && result.y) {
      const coordinates = {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      };

      // Cache the result
      geocodingCache.set(address, coordinates);

      return coordinates;
    }

    return null;
  } catch (error) {
    console.error('Geocoding failed for address:', address, error);
    return null;
  }
};

// Batch geocoding for multiple addresses
export const batchGeocoding = async (
  addresses: string[]
): Promise<Map<string, { lat: number; lng: number }>> => {
  const results = new Map<string, { lat: number; lng: number }>();

  // Process addresses in parallel with a reasonable concurrency limit
  const concurrencyLimit = 5;
  const chunks = [];

  for (let i = 0; i < addresses.length; i += concurrencyLimit) {
    chunks.push(addresses.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (address) => {
      const coordinates = await addressToCoordinates(address);
      if (coordinates) {
        results.set(address, coordinates);
      }
    });

    await Promise.all(promises);
  }

  return results;
};

// Clear geocoding cache (useful for testing or memory management)
export const clearGeocodingCache = (): void => {
  geocodingCache.clear();
};
