import { AddressService } from '@/services/addressService';
import type { Address as ComplaintAddress } from '@/types/complaint';

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, { lat: number; lng: number }>();

// Convert address to coordinates using Kakao Maps API
export const addressToCoordinates = async (
  address: string | ComplaintAddress
): Promise<{ lat: number; lng: number } | null> => {
  const addressString = typeof address === 'string' ? address : address.address;

  if (geocodingCache.has(addressString)) {
    return geocodingCache.get(addressString)!;
  }

  try {
    const result =
      await AddressService.getCoordinatesFromAddress(addressString);

    if (result && result.x && result.y) {
      const coordinates = {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      };

      // Cache the result
      geocodingCache.set(addressString, coordinates);

      return coordinates;
    }

    return null;
  } catch (error) {
    console.error('Geocoding failed for address:', addressString, error);
    return null;
  }
};

// Batch geocoding for multiple addresses
export const batchGeocoding = async (
  addresses: (string | ComplaintAddress)[]
): Promise<Map<string, { lat: number; lng: number }>> => {
  const results = new Map<string, { lat: number; lng: number }>();

  // 합리적인 동시성 제한으로 주소를 병렬 처리
  const concurrencyLimit = 5;
  const chunks = [];

  for (let i = 0; i < addresses.length; i += concurrencyLimit) {
    chunks.push(addresses.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (address) => {
      const addressString =
      typeof address === 'string' ? address : address.address;
      const coordinates = await addressToCoordinates(addressString);
      if (coordinates) {
        results.set(addressString, coordinates);
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
