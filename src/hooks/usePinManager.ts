import { useCallback, useEffect, useRef, useState } from 'react';

import type { PinClickEvent, PinData } from '@/types/map';
import { formatDateTimeToKorean } from '@/utils/formatDate';
import { batchGeocoding } from '@/utils/geocoding';
import { getPinImageSrc, PIN_CONFIGS } from '@/utils/pinUtils';

import type { KakaoMap } from './useKakaoMaps';

interface UsePinManagerProps {
  mapInstance: KakaoMap | null;
  pins: PinData[];
  onPinClick?: (event: PinClickEvent) => void;
  isLoaded: boolean;
}

interface UsePinManagerReturn {
  isGeocoding: boolean;
  geocodedPins: PinData[];
  clearMarkers: () => void;
  updatePins: () => Promise<void>;
}

export const usePinManager = ({
  mapInstance,
  pins,
  onPinClick,
  isLoaded,
}: UsePinManagerProps): UsePinManagerReturn => {
  const markersRef = useRef<unknown[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedPins, setGeocodedPins] = useState<PinData[]>([]);

  // Type guards for Kakao Maps objects
  const isKakaoMarker = (
    obj: unknown
  ): obj is { setMap: (map: unknown) => void } => {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'setMap' in obj &&
      typeof (obj as { setMap: unknown }).setMap === 'function'
    );
  };

  const getCategoryKey = (category: string): string => {
    const categoryMap: Record<string, string> = {
      재활용: 'recycle',
      음식물: 'food',
      일반: 'general',
      기타: 'others',
    };
    return categoryMap[category] || 'general';
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      재활용: '/src/assets/icons/categories/tags/recycle.svg',
      음식물: '/src/assets/icons/categories/tags/food.svg',
      일반: '/src/assets/icons/categories/tags/general.svg',
      기타: '/src/assets/icons/categories/tags/other.svg',
    };
    return iconMap[category] || iconMap['기타'];
  };

  const getRepeatIcon = (): string => {
    return '/src/assets/icons/categories/tags/repeat.svg';
  };

  const getPinIcon = (): string => {
    return '/src/assets/icons/map_card/location_pin.svg';
  };

  const getGreenCircleIcon = (): string => {
    return '/src/assets/icons/map_card/green_circle.svg';
  };

  const getYellowCircleIcon = (): string => {
    return '/src/assets/icons/map_card/yellow_circle.svg';
  };

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      if (isKakaoMarker(marker)) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // Create marker for a pin
  const createMarker = useCallback(
    (pin: PinData): unknown => {
      if (!mapInstance || !window.kakao) {
        return null;
      }

      const imageSrc = getPinImageSrc(pin.category, pin.isRepeat);
      const config =
        PIN_CONFIGS[getCategoryKey(pin.category)] || PIN_CONFIGS.general;

      const imageSize = new (
        window.kakao.maps as unknown as {
          Size: new (width: number, height: number) => unknown;
        }
      ).Size(config.size.width, config.size.height);
      const imageOption = {
        offset: new (
          window.kakao.maps as unknown as {
            Point: new (x: number, y: number) => unknown;
          }
        ).Point(config.offset.x, config.offset.y),
      };

      const markerImage = new (
        window.kakao.maps as unknown as {
          MarkerImage: new (
            src: string,
            size: unknown,
            options: { offset: unknown }
          ) => unknown;
        }
      ).MarkerImage(imageSrc, imageSize, imageOption);
      const markerPosition = new window.kakao.maps.LatLng(pin.lat, pin.lng);

      const marker = new (
        window.kakao.maps as unknown as {
          Marker: new (options: {
            position: unknown;
            image: unknown;
          }) => unknown;
        }
      ).Marker({
        position: markerPosition,
        image: markerImage,
      });

      // Add click event listener
      if (onPinClick) {
        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: () => void
              ) => void;
            };
          }
        ).event.addListener(marker, 'click', () => {
          onPinClick({
            pin,
            marker,
            map: mapInstance,
          });
        });
      }

      if (isKakaoMarker(marker)) {
        marker.setMap(mapInstance);
      }

      const iwContent =
        '<div style="display: flex; flex-direction: column; padding: 12px; max-width: 350px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">' +
        '<div style="display: flex; gap: 8px; align-items: center; height: 30px">' +
        '<img src="' +
        getCategoryIcon(pin.category) +
        '" alt="카테고리" style="width: 60px; flex-shrink: 0;" />' +
        (pin.isRepeat
          ? '<img src="' +
            getRepeatIcon() +
            '" alt="반복민원" style="width: 70px; flex-shrink: 0;" />'
          : '') +
        '<p style="font-weight: 600; font-size: 18px; margin: 0; color: black; flex: 1; line-height: 1.4; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">' +
        pin.content +
        '</p>' +
        '</div>' +
        '<p style="font-size: 16px; font-weight: 600; color: #7C7C7C; margin: 4px 0;">' +
        formatDateTimeToKorean(pin.datetime) +
        '</p>' +
        '<div style="display: flex; align-items: center; margin: 4px 0;">' +
        '<img src="' +
        getPinIcon() +
        '" alt="위치" style="width: 14px; height: 14px; margin-right: 4px;" />' +
        '<p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">' +
        pin.address.slice(6) +
        '</p>' +
        '</div>' +
        '<div style="display: flex; align-items: center;">' +
        '<img src="' +
        (pin.status ? getGreenCircleIcon() : getYellowCircleIcon()) +
        '" alt="상태" style="width: 14px; height: 14px; margin-right: 4px;" />' +
        '<p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">' +
        (pin.status ? '완료' : '처리중') +
        '</p>' +
        '</div>' +
        '</div>';

      const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent,
      });

      // Add mouse events
      (
        window.kakao.maps as unknown as {
          event: {
            addListener: (
              target: unknown,
              event: string,
              handler: () => void
            ) => void;
          };
        }
      ).event.addListener(marker, 'mouseover', function () {
        if (mapInstance) {
          infowindow.open(
            mapInstance as unknown as typeof mapInstance,
            marker as unknown as {
              getPosition: () => { lat: () => number; lng: () => number };
              setPosition: (position: unknown) => void;
            }
          );
        }
      });

      (
        window.kakao.maps as unknown as {
          event: {
            addListener: (
              target: unknown,
              event: string,
              handler: () => void
            ) => void;
          };
        }
      ).event.addListener(marker, 'mouseout', function () {
        infowindow.close();
      });

      return marker;
    },
    [onPinClick, mapInstance]
  );

  // Update pins on map
  const updatePins = useCallback(async () => {
    if (!mapInstance || !isLoaded || pins.length === 0) {
      setIsGeocoding(false);
      return;
    }

    // Clear existing markers and set geocoding state
    clearMarkers();
    setIsGeocoding(true);

    // Separate pins with valid coordinates from those that need geocoding
    const pinsWithCoords: PinData[] = [];
    const pinsNeedingGeocoding: PinData[] = [];

    pins.forEach((pin) => {
      // Check if pin already has valid coordinates
      if (
        pin.lat !== 0 &&
        pin.lng !== 0 &&
        !isNaN(pin.lat) &&
        !isNaN(pin.lng)
      ) {
        pinsWithCoords.push(pin);
      } else {
        pinsNeedingGeocoding.push(pin);
      }
    });

    const validPins: PinData[] = [...pinsWithCoords];

    // Only geocode pins that don't have coordinates
    if (pinsNeedingGeocoding.length > 0) {
      try {
        // Get unique addresses from pins that need geocoding
        const uniqueAddresses = [
          ...new Set(pinsNeedingGeocoding.map((pin) => pin.address)),
        ];

        // Batch geocoding for all unique addresses
        const coordinatesMap = await batchGeocoding(uniqueAddresses);

        // Process geocoded pins
        pinsNeedingGeocoding.forEach((pin) => {
          const coordinates = coordinatesMap.get(pin.address);

          if (coordinates) {
            const pinWithCoords = {
              ...pin,
              lat: coordinates.lat,
              lng: coordinates.lng,
            };
            validPins.push(pinWithCoords);
            console.log(
              '✅ Geocoded pin:',
              pin.id,
              coordinates.lat,
              coordinates.lng
            );
          } else {
            console.warn('⚠️ No coordinates found for address:', pin.address);
          }
        });
      } catch (error) {
        console.error('❌ Geocoding failed:', error);
      }
    }

    // Store the geocoded pins for marker creation
    setGeocodedPins(validPins);
    setIsGeocoding(false);
  }, [pins, isLoaded, clearMarkers, mapInstance]);

  // Create markers from geocoded pins (separate from geocoding process)
  const createMarkersFromGeocodedPins = useCallback(() => {
    if (!mapInstance || !isLoaded || geocodedPins.length === 0) {
      return;
    }

    clearMarkers();

    geocodedPins.forEach((pin) => {
      const marker = createMarker(pin);
      if (marker) {
        markersRef.current.push(marker);
      }
    });
  }, [geocodedPins, isLoaded, clearMarkers, createMarker, mapInstance]);

  // Update pins when pins prop changes OR when map instance becomes available
  useEffect(() => {
    if (mapInstance && isLoaded) {
      updatePins();
    }
  }, [updatePins, mapInstance, isLoaded]);

  // Update markers when geocoded pins change OR when map instance becomes available
  useEffect(() => {
    if (mapInstance && isLoaded) {
      createMarkersFromGeocodedPins();
    }
  }, [createMarkersFromGeocodedPins, mapInstance, isLoaded]);

  return {
    isGeocoding,
    geocodedPins,
    clearMarkers,
    updatePins,
  };
};
