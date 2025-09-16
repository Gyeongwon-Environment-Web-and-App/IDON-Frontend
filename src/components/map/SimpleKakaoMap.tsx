import React, { forwardRef, useEffect, useId, useRef } from 'react';

import { type KakaoMap, useKakaoMaps } from '../../hooks/useKakaoMaps';

interface SimpleKakaoMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SimpleKakaoMap = forwardRef<HTMLDivElement, SimpleKakaoMapProps>(
  (
    {
      center = { lat: 37.6714001064975, lng: 127.041485813197 },
      zoom = 2,
      className = 'w-full h-full',
      style,
    },
    ref
  ) => {
    const mapId = useId();
    const mapInstanceRef = useRef<KakaoMap | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isLoaded, isLoading, error, loadSDK } = useKakaoMaps();

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

    // Load SDK on mount
    useEffect(() => {
      if (!isLoaded && !isLoading) {
        loadSDK().catch(console.error);
      }
    }, [isLoaded, isLoading, loadSDK]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (mapInstanceRef.current && containerRef.current) {
          containerRef.current.innerHTML = '';
          mapInstanceRef.current = null;
        }
      };
    }, []);

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
