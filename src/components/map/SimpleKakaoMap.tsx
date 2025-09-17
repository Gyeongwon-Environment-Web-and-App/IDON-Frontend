import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';

import type { PinClickEvent, PinData } from '@/types/map';
import { batchGeocoding } from '@/utils/geocoding';
import { getPinImageSrc, PIN_CONFIGS } from '@/utils/pinUtils';

import { type KakaoMap, useKakaoMaps } from '../../hooks/useKakaoMaps';

interface SimpleKakaoMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  pins?: PinData[];
  onPinClick?: (event: PinClickEvent) => void;
}

const SimpleKakaoMap = forwardRef<HTMLDivElement, SimpleKakaoMapProps>(
  (
    {
      center = { lat: 37.6714001064975, lng: 127.041485813197 },
      zoom = 2,
      className = 'w-full h-full',
      style,
      pins = [],
      onPinClick,
    },
    ref
  ) => {
    const mapId = useId();
    const mapInstanceRef = useRef<KakaoMap | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any[]>([]);
    const { isLoaded, isLoading, error, loadSDK } = useKakaoMaps();

    const getCategoryKey = (category: string): string => {
      const categoryMap: Record<string, string> = {
        재활용: 'recycle',
        음식물: 'food',
        일반: 'general',
        기타: 'others',
      };
      return categoryMap[category] || 'general';
    };

    // Clear existing markers
    const clearMarkers = useCallback(() => {
      markersRef.current.forEach((marker) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (marker as any).setMap(null);
      });
      markersRef.current = [];
    }, []);

    // Create marker for a pin
    const createMarker = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pin: PinData): any => {
        if (!mapInstanceRef.current || !window.kakao) return null;

        const imageSrc = getPinImageSrc(pin.category, pin.isRepeat);
        const config =
          PIN_CONFIGS[getCategoryKey(pin.category)] || PIN_CONFIGS.general;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageSize = new (window.kakao.maps as any).Size(
          config.size.width,
          config.size.height
        );
        const imageOption = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          offset: new (window.kakao.maps as any).Point(
            config.offset.x,
            config.offset.y
          ),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markerImage = new (window.kakao.maps as any).MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );
        const markerPosition = new window.kakao.maps.LatLng(pin.lat, pin.lng);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new (window.kakao.maps as any).Marker({
          position: markerPosition,
          image: markerImage,
        });

        // Add click event listener
        if (onPinClick) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.kakao.maps as any).event.addListener(marker, 'click', () => {
            onPinClick({
              pin,
              marker,
              map: mapInstanceRef.current,
            });
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (marker as any).setMap(mapInstanceRef.current);
        return marker;
      },
      [onPinClick]
    );

    // Update pins on map
    const updatePins = useCallback(async () => {
      if (!mapInstanceRef.current || !isLoaded || pins.length === 0) return;

      clearMarkers();

      // Get unique addresses from pins
      const uniqueAddresses = [...new Set(pins.map((pin) => pin.address))];

      // Batch geocoding for all unique addresses
      const coordinatesMap = await batchGeocoding(uniqueAddresses);

      // Create markers for pins with valid coordinates
      pins.forEach((pin) => {
        const coordinates = coordinatesMap.get(pin.address);
        if (coordinates) {
          const pinWithCoords = {
            ...pin,
            lat: coordinates.lat,
            lng: coordinates.lng,
          };
          const marker = createMarker(pinWithCoords);
          if (marker) {
            markersRef.current.push(marker);
          }
        }
      });
    }, [pins, isLoaded, clearMarkers, createMarker]);

    // Initialize map when SDK is ready
    useEffect(() => {
      if (!isLoaded || !containerRef.current) return;

      try {
        // Clean up existing map instance
        if (mapInstanceRef.current) {
          // Kakao Maps doesn't have a direct destroy method, but we can clear the container
          const container = containerRef.current;
          if (container) {
            container.innerHTML = '';
          }
        }

        // Create new map instance with interaction controls
        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: zoom,
          // Enable map controls for interaction
          draggable: true,
          scrollwheel: true,
          disableDoubleClick: false,
          disableDoubleClickZoom: false,
          keyboardShortcuts: true,
        };

        const mapInstance = new window.kakao.maps.Map(
          containerRef.current,
          options
        );
        mapInstanceRef.current = mapInstance;

        // Set ref for parent component
        if (
          ref &&
          typeof ref === 'object' &&
          ref.current !== undefined &&
          containerRef.current
        ) {
          (ref as React.RefObject<HTMLDivElement>).current =
            containerRef.current;
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }, [isLoaded, center.lat, center.lng, zoom, ref]);

    // Update map center and zoom when props change
    useEffect(() => {
      if (!mapInstanceRef.current || !isLoaded) return;

      try {
        const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        mapInstanceRef.current.setCenter(newCenter);
        mapInstanceRef.current.setLevel(zoom);
      } catch (error) {
        console.error('Failed to update map:', error);
      }
    }, [center.lat, center.lng, zoom, isLoaded]);

    // Update pins when pins prop changes
    useEffect(() => {
      updatePins();
    }, [updatePins]);

    // Load SDK on mount
    useEffect(() => {
      if (!isLoaded && !isLoading) {
        loadSDK().catch(console.error);
      }
    }, [isLoaded, isLoading, loadSDK]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        clearMarkers();
        if (mapInstanceRef.current && containerRef.current) {
          containerRef.current.innerHTML = '';
          mapInstanceRef.current = null;
        }
      };
    }, [clearMarkers]);

    if (error) {
      return (
        <div className={className} style={style}>
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <div className="text-center">
              <p className="text-sm text-red-600">지도 로딩 실패</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={className} style={style}>
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">카카오맵 로딩 중...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        id={`simple-map-${mapId}`}
        ref={(node) => {
          containerRef.current = node;
          if (
            ref &&
            typeof ref === 'object' &&
            ref.current !== undefined &&
            node
          ) {
            (ref as React.RefObject<HTMLDivElement>).current = node;
          }
        }}
        className={className}
        style={{
          ...style,
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
    );
  }
);

SimpleKakaoMap.displayName = 'SimpleKakaoMap';
export default SimpleKakaoMap;
