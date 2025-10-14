import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
}

export const usePinManager = ({
  mapInstance,
  pins,
  onPinClick,
  isLoaded,
}: UsePinManagerProps): UsePinManagerReturn => {
  const markersRef = useRef<unknown[]>([]);
  const infoWindowRef = useRef<unknown>(null);
  const lastPinsHashRef = useRef<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedPins, setGeocodedPins] = useState<PinData[]>([]);

  // Create stable hash of pins to prevent unnecessary effect re-runs
  const pinsHash = useMemo(() => {
    return JSON.stringify(
      pins.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        status: p.status,
        category: p.category,
        isRepeat: p.isRepeat,
        address: p.address,
        content: p.content,
        datetime: p.datetime,
        complaintId: p.complaintId,
      }))
    );
  }, [pins]);

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

  // Combine both fuclickedInfoWindownctions into one to handle category arrays and get the correct key
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
  }, []);

  // Create marker for a pin
  const createMarker = useCallback(
    (pin: PinData): unknown => {
      if (!mapInstance || !window.kakao) {
        return null;
      }

      const kakaoMaps = getKakaoMaps();
      if (!kakaoMaps) return null;

      const teamCategories =
        pin.teams?.map((team) => team.category).filter(Boolean) || [];
      const imageSrc = getPinImageSrc(teamCategories, pin.isRepeat);
      const config =
        PIN_CONFIGS[getCategoryKey(teamCategories)] || PIN_CONFIGS.general;

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
      const validCategories =
        pin.teams
          ?.map((team) => team.category)
          .filter((category) => category && category !== 'manager') || [];
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
        '<div style="display: flex; flex-direction: column; padding: 12px; width: 350px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">' +
        '<div style="display: flex; gap: 8px; align-items: center; height: 30px;">' +
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

      const markerData = {
        marker,
        pin,
        iwContent,
      };

      // Add event listeners
      const addEventListener = (event: string, handler: () => void) => {
        kakaoMaps.event.addListener(marker, event, handler);
      };

      // Click event for navigation and close info window
      addEventListener('click', () => {
        if (onPinClick) {
          onPinClick({ pin, marker, map: mapInstance });
        }
        // Close info window after navigation
        if (infoWindowRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infoWindowRef.current as any).close();
        }
      });

      // Mouseover event - use shared InfoWindow
      addEventListener('mouseover', () => {
        if (mapInstance && infoWindowRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const infoWindow = infoWindowRef.current as any;
          // Only update content if it's different to avoid unnecessary re-renders
          if (infoWindow.getContent?.() !== iwContent) {
            infoWindow.setContent(iwContent);
          }
          infoWindow.open(mapInstance, marker);
        }
      });

      // Mouseout event
      addEventListener('mouseout', () => {
        if (infoWindowRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (infoWindowRef.current as any).close();
        }
      });

      if (isKakaoMarker(marker)) {
        marker.setMap(mapInstance);
      }

      return markerData;
    },
    [onPinClick, mapInstance]
  );

  // updatePins function removed - functionality moved to consolidated useEffect

  // Consolidated effect that handles both geocoding and marker creation
  useEffect(() => {
    if (!mapInstance || !isLoaded) {
      return;
    }

    // Prevent unnecessary re-runs by checking if pins actually changed
    if (lastPinsHashRef.current === pinsHash) {
      return;
    }
    lastPinsHashRef.current = pinsHash;

    const processPinsAndCreateMarkers = async () => {
      // Always clear existing markers first
      clearMarkers();

      // Create shared InfoWindow if it doesn't exist
      if (!infoWindowRef.current && window.kakao?.maps) {
        const kakaoMaps = getKakaoMaps();
        if (kakaoMaps) {
          infoWindowRef.current = new kakaoMaps.InfoWindow({ content: '' });
        }
      }

      // If no pins to process, just clear and return
      if (pins.length === 0) {
        setIsGeocoding(false);
        setGeocodedPins([]);
        return;
      }

      // Set geocoding state for processing pins
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

      // Only update state if values actually changed
      setGeocodedPins((prevPins) => {
        const prevHash = JSON.stringify(
          prevPins.map((p) => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            status: p.status,
            category: p.category,
            isRepeat: p.isRepeat,
          }))
        );
        const newHash = JSON.stringify(
          validPins.map((p) => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            status: p.status,
            category: p.category,
            isRepeat: p.isRepeat,
          }))
        );
        return prevHash === newHash ? prevPins : validPins;
      });

      setIsGeocoding(false);

      // Create markers from the processed pins
      if (validPins.length > 0) {
        validPins.forEach((pin) => {
          const marker = createMarker(pin);
          if (marker) {
            markersRef.current.push(marker);
          }
        });
      }
    };

    processPinsAndCreateMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsHash, isLoaded]); // Removed mapInstance from deps to prevent infinite loops

  return {
    isGeocoding,
    geocodedPins,
    clearMarkers,
  };
};
