import { useCallback, useEffect, useRef, useState } from 'react';

import type { PinClickEvent, PinData } from '@/types/map';
import { formatDateTimeToKorean } from '@/utils/formatDate';
import { batchGeocoding } from '@/utils/geocoding';
import { getPinImageSrc, PIN_CONFIGS } from '@/utils/pinUtils';

import type { KakaoMap } from './useKakaoMaps';

// Icon paths - moved outside component to avoid re-renders
const ICON_PATHS = {
  category: {
    재활용: '/src/assets/icons/categories/tags/recycle.svg',
    음식물: '/src/assets/icons/categories/tags/food.svg',
    일반: '/src/assets/icons/categories/tags/general.svg',
    기타: '/src/assets/icons/categories/tags/other.svg',
  },
  repeat: '/src/assets/icons/categories/tags/repeat.svg',
  pin: '/src/assets/icons/map_card/location_pin.svg',
  status: {
    completed: '/src/assets/icons/map_card/green_circle.svg',
    pending: '/src/assets/icons/map_card/yellow_circle.svg',
  },
} as const;

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
  const [clickedInfoWindow, setClickedInfoWindow] = useState<{
    marker: unknown;
    infowindow: unknown;
  } | null>(null);

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

  const isInfoWindowOpen = (infowindow: unknown): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(infowindow && (infowindow as any).getMap() !== null);
  };

  const closeAllInfoWindows = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((markerData: any) => {
      if (markerData.infowindow && isInfoWindowOpen(markerData.infowindow)) {
        markerData.infowindow.close();
      }
    });
    setClickedInfoWindow(null);
  }, []);

  // Combine both functions into one to handle category arrays and get the correct key
  const getCategoryKey = (category: string[]): string => {
    const validCategories = category.filter((cat) => cat !== 'manager');
    const primaryCategory = validCategories[0] || '기타';

    const categoryMap: Record<string, string> = {
      재활용: 'recycle',
      음식물: 'food',
      일반: 'general',
      기타: 'others',
    };
    return categoryMap[primaryCategory] || 'general';
  };

  // Helper function to reduce Kakao Maps type casting repetition
  const getKakaoMaps = () => {
    if (!window.kakao?.maps) return null;
    return window.kakao.maps as unknown as {
      Size: new (width: number, height: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      MarkerImage: new (
        src: string,
        size: unknown,
        options: { offset: unknown }
      ) => unknown;
      Marker: new (options: { position: unknown; image: unknown }) => unknown;
      InfoWindow: new (options: { content: string }) => unknown;
      LatLng: new (lat: number, lng: number) => unknown;
      event: {
        addListener: (
          target: unknown,
          event: string,
          handler: () => void
        ) => void;
        removeListener: (
          target: unknown,
          event: string,
          handler: () => void
        ) => void;
      };
    };
  };

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((markerData: any) => {
      if (markerData && markerData.marker && isKakaoMarker(markerData.marker)) {
        markerData.marker.setMap(null);
      }
    });
    markersRef.current = [];
    setClickedInfoWindow(null);
  }, []);

  // Create marker for a pin
  const createMarker = useCallback(
    (pin: PinData): unknown => {
      if (!mapInstance || !window.kakao) {
        return null;
      }

      const kakaoMaps = getKakaoMaps();
      if (!kakaoMaps) return null;

      const imageSrc = getPinImageSrc(pin.category, pin.isRepeat);
      const config =
        PIN_CONFIGS[getCategoryKey(pin.category)] || PIN_CONFIGS.general;

      const imageSize = new kakaoMaps.Size(
        config.size.width,
        config.size.height
      );
      const imageOption = {
        offset: new kakaoMaps.Point(config.offset.x, config.offset.y),
      };

      const markerImage = new kakaoMaps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );
      const markerPosition = new kakaoMaps.LatLng(pin.lat, pin.lng);

      const marker = new kakaoMaps.Marker({
        position: markerPosition,
        image: markerImage,
      });

      // Get all valid categories (excluding 'manager')
      const validCategories = pin.category.filter((cat) => cat !== 'manager');
      const categoryIconsHtml = validCategories
        .map(
          (tag) =>
            '<img src="' +
            (ICON_PATHS.category[tag as keyof typeof ICON_PATHS.category] ||
              ICON_PATHS.category.기타) +
            '" alt="' +
            tag +
            '" style="width: 55px; flex-shrink: 0;" />'
        )
        .join('');

      const iwContent =
        '<div style="display: flex; flex-direction: column; padding: 12px; width: 350px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">' +
        '<div style="display: flex; gap: 8px; align-items: center; height: 30px">' +
        categoryIconsHtml +
        (pin.isRepeat
          ? '<img src="' +
            ICON_PATHS.repeat +
            '" alt="반복민원" style="width: 67px; flex-shrink: 0;" />'
          : '') +
        '<p style="font-weight: 600; font-size: 18px; margin: 0; color: black; flex: 1; line-height: 1.4; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">' +
        (pin.content || `${pin.address.slice(7)} 민원`) +
        '</p>' +
        '</div>' +
        '<p style="font-size: 16px; font-weight: 600; color: #7C7C7C; margin: 4px 0;">' +
        formatDateTimeToKorean(pin.datetime) +
        '</p>' +
        '<div style="display: flex; align-items: center; margin: 4px 0;">' +
        '<img src="' +
        ICON_PATHS.pin +
        '" alt="위치" style="width: 14px; height: 14px; margin-right: 4px;" />' +
        '<p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">' +
        pin.address.slice(6) +
        '</p>' +
        '</div>' +
        '<div style="display: flex; align-items: center;">' +
        '<img src="' +
        (pin.status ? ICON_PATHS.status.completed : ICON_PATHS.status.pending) +
        '" alt="상태" style="width: 14px; height: 14px; margin-right: 4px;" />' +
        '<p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">' +
        (pin.status ? '완료' : '처리중') +
        '</p>' +
        '</div>' +
        '</div>';

      const infowindow = new kakaoMaps.InfoWindow({
        content: iwContent,
      });

      const markerData = {
        marker,
        infowindow,
        pin,
      };

      // Add event listeners
      const addEventListener = (event: string, handler: () => void) => {
        kakaoMaps.event.addListener(marker, event, handler);
      };

      // Click event for toggle functionality
      addEventListener('click', () => {
        // Handle pin click callback first
        if (onPinClick) {
          onPinClick({ pin, marker, map: mapInstance });
        }

        // Toggle info window
        const isCurrentlyOpen = isInfoWindowOpen(infowindow);

        if (isCurrentlyOpen) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infowindow as any).close();
          setClickedInfoWindow(null);
        } else {
          closeAllInfoWindows();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infowindow as any).open(mapInstance as any, marker as any);
          setClickedInfoWindow({ marker, infowindow });
        }
      });

      // Mouseover event (only if no clicked info window is open)
      addEventListener('mouseover', () => {
        if (!clickedInfoWindow && mapInstance) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infowindow as any).open(mapInstance as any, marker as any);
        }
      });

      // Mouseout event (only if this isn't the clicked info window)
      addEventListener('mouseout', () => {
        if (!clickedInfoWindow || clickedInfoWindow.marker !== marker) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infowindow as any).close();
        }
      });

      if (isKakaoMarker(marker)) {
        marker.setMap(mapInstance);
      }

      return markerData;
    },
    [onPinClick, mapInstance, clickedInfoWindow, closeAllInfoWindows]
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

  // Add map click listener to close info windows when clicking on empty map areas
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    const kakaoMaps = getKakaoMaps();
    if (!kakaoMaps) return;

    const handleMapClick = () => {
      closeAllInfoWindows();
    };

    kakaoMaps.event.addListener(mapInstance, 'click', handleMapClick);

    // Cleanup
    return () => {
      kakaoMaps.event.removeListener(mapInstance, 'click', handleMapClick);
    };
  }, [mapInstance, isLoaded, closeAllInfoWindows]);

  return {
    isGeocoding,
    geocodedPins,
    clearMarkers,
    updatePins,
  };
};
