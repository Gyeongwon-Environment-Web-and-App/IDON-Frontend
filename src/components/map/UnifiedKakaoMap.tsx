import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import { getDongInfo } from "../../utils/dongMapping";

// Kakao Maps specific types
interface KakaoLatLng {
  lat: () => number;
  lng: () => number;
}

interface KakaoMap {
  setCenter: (position: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

// Type for the actual Kakao Maps Marker instance
type KakaoMarkerInstance = {
  setPosition: (position: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setMap: (map: KakaoMap | null) => void;
} & Record<string, unknown>;

interface KakaoInfoWindow {
  setContent: (content: string) => void;
  open: (map: KakaoMap, marker: KakaoMarkerInstance) => void;
  close: () => void;
}

interface UnifiedKakaoMapProps {
  // Basic map props
  center?: { lat: number; lng: number };
  zoom?: number;

  // Advanced map props (for ComplaintForm usage)
  latitude?: number;
  longitude?: number;
  address?: string;
  isVisible?: boolean;
  resetCenter?: boolean;

  // Component behavior
  mode?: "simple" | "advanced"; // "simple" for MapOverview, "advanced" for ComplaintForm

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Callbacks
  onMapReady?: (map: KakaoMap) => void;
  onMarkerClick?: (marker: KakaoMarkerInstance) => void;
}

const UnifiedKakaoMap = forwardRef<HTMLDivElement, UnifiedKakaoMapProps>(
  (
    {
      center = { lat: 37.6714001064975, lng: 127.041485813197 },
      zoom = 2,
      latitude,
      longitude,
      address,
      isVisible = true,
      resetCenter = false,
      mode = "simple",
      className = "w-full h-full",
      style,
      onMapReady,
      onMarkerClick,
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapState, setMapState] = useState<"loading" | "ready" | "error">(
      "loading"
    );
    const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
    const [markerInstance, setMarkerInstance] =
      useState<KakaoMarkerInstance | null>(null);
    const [infoWindowInstance, setInfoWindowInstance] =
      useState<KakaoInfoWindow | null>(null);
    const [dongInfo, setDongInfo] = useState<string>("");
    const [dongInfoLoading, setDongInfoLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Reset hasInitialized when resetCenter changes (for advanced mode)
    useEffect(() => {
      if (resetCenter && mode === "advanced") {
        setHasInitialized(false);
      }
    }, [resetCenter, mode]);

    // Enhanced Kakao Maps loading with retry mechanism
    useEffect(() => {
      const loadKakaoMaps = async () => {
        // Check if already loaded
        if (window.kakao?.maps) {
          console.log("✅ Kakao Maps already loaded");
          setMapState("ready");
          return;
        }

        return new Promise((resolve, reject) => {
          const apiKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

          if (!apiKey) {
            console.error("❌ 카카오맵 API 키가 설정되지 않았습니다!");
            setMapState("error");
            reject(new Error("API key not found"));
            return;
          }

          const script = document.createElement("script");
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
          script.async = true;

          script.onload = () => {
            console.log("✅ 카카오맵 SDK 스크립트 로드 완료");

            // Load the SDK
            if (
              window.kakao?.maps &&
              "load" in window.kakao.maps &&
              typeof (
                window.kakao.maps as { load: (callback: () => void) => void }
              ).load === "function"
            ) {
              (
                window.kakao.maps as { load: (callback: () => void) => void }
              ).load(() => {
                setMapState("ready");
                resolve(true);
              });
            } else {
              setMapState("ready");
              resolve(true);
            }
          };

          script.onerror = (error) => {
            console.error("카카오맵 SDK 로드 실패:", error);
            setMapState("error");
            reject(error);
          };

          document.head.appendChild(script);
        });
      };

      loadKakaoMaps().catch((error) => {
        console.error("카카오맵 로딩 실패:", error);
        setMapState("error");
      });
    }, []);

    // 동 정보 비동기 추출 (for advanced mode)
    useEffect(() => {
      if (mode !== "advanced" || !address) {
        setDongInfo("");
        return;
      }

      const fetchDongInfo = async () => {
        setDongInfoLoading(true);
        try {
          const result = await getDongInfo(address);
          setDongInfo(result);
        } catch (error) {
          console.error("동 정보 추출 실패:", error);
          setDongInfo("");
        } finally {
          setDongInfoLoading(false);
        }
      };

      fetchDongInfo();
    }, [address, mode]);

    // Initialize map when SDK is ready
    const initializeMap = useCallback(() => {
      if (!mapRef.current || mapState !== "ready") {
        return;
      }

      try {
        const mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        const mapOptions = {
          center: mapCenter,
          level: zoom,
        };

        const newMap = new window.kakao.maps.Map(mapRef.current, mapOptions);
        setMapInstance(newMap);

        // Create info window for advanced mode
        if (mode === "advanced") {
          const newInfoWindow = new window.kakao.maps.InfoWindow({
            content:
              '<div style="padding:10px;min-width:200px;">로딩 중...</div>',
          });
          setInfoWindowInstance(newInfoWindow);
        }

        // Call onMapReady callback
        onMapReady?.(newMap);
      } catch (error) {
        console.error("지도 초기화 실패:", error);
        setMapState("error");
      }
    }, [mapState, center, zoom, mode, onMapReady]);

    // Update map when coordinates change (for advanced mode)
    const updateMapWithCoordinates = useMemo(() => {
      return (lat: number, lng: number) => {
        if (!mapInstance || !infoWindowInstance || mode !== "advanced") {
          return;
        }

        try {
          const position = new window.kakao.maps.LatLng(lat, lng);

          // Only center on first load
          if (!hasInitialized) {
            mapInstance.setCenter(position);
            setHasInitialized(true);
          }

          // Remove existing marker
          if (markerInstance) {
            markerInstance.setMap(null);
          }

          // Create new marker
          const newMarker = new window.kakao.maps.Marker({
            map: mapInstance,
            position: position,
          });
          setMarkerInstance(newMarker as KakaoMarkerInstance);

          // Update info window content
          const infoContent = `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
              민원 발생 위치${dongInfo ? `: ${dongInfo}` : ""}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address || "주소 정보 없음"}</p>
            ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ""}
          </div>
        `;

          infoWindowInstance.setContent(infoContent);
          infoWindowInstance.open(
            mapInstance,
            newMarker as KakaoMarkerInstance
          );

          // Add click event to marker
          window.kakao.maps.event.addListener(newMarker, "click", () => {
            if (infoWindowInstance) {
              infoWindowInstance.open(
                mapInstance,
                newMarker as KakaoMarkerInstance
              );
            }
            onMarkerClick?.(newMarker as KakaoMarkerInstance);
          });
        } catch (error) {
          console.error("좌표 업데이트 실패:", error);
        }
      };
    }, [
      mapInstance,
      infoWindowInstance,
      markerInstance,
      address,
      dongInfo,
      dongInfoLoading,
      hasInitialized,
      mode,
      onMarkerClick,
    ]);

    // Geocode address to coordinates (for advanced mode)
    const geocodeAddress = useMemo(() => {
      return async (address: string) => {
        if (!mapInstance || !address || mode !== "advanced") {
          return;
        }

        try {
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(
                parseFloat(result[0].y),
                parseFloat(result[0].x)
              );

              // Only center on first load
              if (!hasInitialized) {
                mapInstance.setCenter(coords);
                setHasInitialized(true);
              }

              // Remove existing marker
              if (markerInstance) {
                markerInstance.setMap(null);
              }

              // Create new marker
              const newMarker = new window.kakao.maps.Marker({
                map: mapInstance,
                position: coords,
              });
              setMarkerInstance(newMarker as KakaoMarkerInstance);

              // Update info window
              if (infoWindowInstance) {
                const infoContent = `
                <div style="padding: 10px; min-width: 200px;">
                  <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                    검색된 위치${dongInfo ? `: ${dongInfo}` : ""}
                  </h3>
                  <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
                  ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ""}
                </div>
              `;
                infoWindowInstance.setContent(infoContent);
                infoWindowInstance.open(
                  mapInstance,
                  newMarker as KakaoMarkerInstance
                );
              }

              // Add click event
              window.kakao.maps.event.addListener(newMarker, "click", () => {
                if (infoWindowInstance) {
                  infoWindowInstance.open(
                    mapInstance,
                    newMarker as KakaoMarkerInstance
                  );
                }
                onMarkerClick?.(newMarker as KakaoMarkerInstance);
              });
            } else {
              console.warn(`주소 변환 실패: ${status}`);
            }
          });
        } catch (error) {
          console.error("주소 지오코딩 오류:", error);
        }
      };
    }, [
      mapInstance,
      markerInstance,
      infoWindowInstance,
      dongInfo,
      dongInfoLoading,
      hasInitialized,
      mode,
      onMarkerClick,
    ]);

    // Initialize map when ready
    useEffect(() => {
      if (mapState === "ready" && isVisible) {
        // Wait for next render cycle to ensure container exists
        setTimeout(() => {
          initializeMap();
        }, 0);
      }
    }, [mapState, isVisible, initializeMap]);

    // Add state to track last coordinates to prevent infinite loops (for advanced mode)
    const [lastCoordinates, setLastCoordinates] = useState<{
      lat: number;
      lng: number;
    } | null>(null);

    // Handle coordinate updates (for advanced mode)
    useEffect(() => {
      if (latitude && longitude && mapInstance && mode === "advanced") {
        // Check if coordinates actually changed to prevent infinite loops
        if (
          lastCoordinates?.lat === latitude &&
          lastCoordinates?.lng === longitude
        ) {
          return;
        }
        setLastCoordinates({ lat: latitude, lng: longitude });
        updateMapWithCoordinates(latitude, longitude);
      }
    }, [
      latitude,
      longitude,
      mapInstance,
      updateMapWithCoordinates,
      lastCoordinates,
      mode,
    ]);

    // Handle address updates (for advanced mode)
    useEffect(() => {
      if (
        address &&
        mapInstance &&
        !latitude &&
        !longitude &&
        mode === "advanced"
      ) {
        geocodeAddress(address);
      }
    }, [address, mapInstance, latitude, longitude, geocodeAddress, mode]);

    // Handle visibility changes (for advanced mode)
    useEffect(() => {
      if (!isVisible && mode === "advanced") {
        // Clean up when hidden
        if (infoWindowInstance) {
          infoWindowInstance.close();
        }
      }
    }, [isVisible, infoWindowInstance, mapState, mode]);

    // Don't render if not visible (for advanced mode)
    if (!isVisible && mode === "advanced") {
      return null;
    }

    return (
      <div ref={ref} className={className} style={style}>
        {mapState === "loading" && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">카카오맵 로딩 중...</p>
              <p className="text-xs text-gray-500 mt-1">SDK 초기화 중</p>
            </div>
          </div>
        )}

        {mapState === "error" && (
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <div className="text-center">
              <p className="text-sm text-red-600">지도 로딩 실패</p>
              <p className="text-xs text-red-500 mt-1">API 키를 확인해주세요</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className={`w-full h-full ${mapState !== "ready" ? "hidden" : ""}`}
        />
      </div>
    );
  }
);

UnifiedKakaoMap.displayName = "UnifiedKakaoMap";
export default UnifiedKakaoMap;
