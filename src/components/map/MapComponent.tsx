import React, { useEffect, useRef, useState, useCallback } from "react";
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

interface KakaoMarker {
  setPosition: (position: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setMap: (map: KakaoMap | null) => void;
}

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  isVisible: boolean;
  resetCenter?: boolean; // New prop to trigger center reset
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  address,
  isVisible,
  resetCenter,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
  const [markerInstance, setMarkerInstance] = useState<KakaoMarker | null>(
    null
  );
  const [infoWindowInstance, setInfoWindowInstance] = useState<{
    open: (map: KakaoMap, marker: KakaoMarker) => void;
    close: () => void;
    setContent: (content: string) => void;
  } | null>(null);
  const [dongInfo, setDongInfo] = useState<string>("");
  const [dongInfoLoading, setDongInfoLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Reset hasInitialized when resetCenter changes (new search)
  useEffect(() => {
    if (resetCenter) {
      console.log("🔄 New search detected - resetting center state");
      setHasInitialized(false);
    }
  }, [resetCenter]);

  // Debug MapComponent props and visibility
  useEffect(() => {
    console.log("🔍 MapComponent props check:", {
      latitude,
      longitude,
      address,
      isVisible,
      mapState,
      hasCoordinates: !!(latitude && longitude),
      hasAddress: !!address,
      propsType: typeof { latitude, longitude, address, isVisible },
    });
  }, [latitude, longitude, address, isVisible, mapState]);

  // Enhanced visibility debugging
  useEffect(() => {
    console.log("🔍 MapComponent visibility check:", {
      isVisible,
      mapState,
      hasCoordinates: !!(latitude && longitude),
      hasAddress: !!address,
      shouldShowMap: isVisible && mapState === "ready",
      containerExists: !!mapRef.current,
      containerVisible: mapRef.current
        ? mapRef.current.style.display !== "none"
        : false,
    });
  }, [isVisible, mapState, latitude, longitude, address]);

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
          if (window.kakao?.maps?.load) {
            window.kakao.maps.load(() => {
              console.log("✅ 카카오맵 SDK 초기화 완료");
              setMapState("ready");
              resolve(true);
            });
          } else {
            console.log("✅ 카카오맵 SDK 자동 로드 완료");
            setMapState("ready");
            resolve(true);
          }
        };

        script.onerror = (error) => {
          console.error("❌ 카카오맵 SDK 로드 실패:", error);
          setMapState("error");
          reject(error);
        };

        document.head.appendChild(script);
      });
    };

    loadKakaoMaps().catch((error) => {
      console.error("❌ 카카오맵 로딩 실패:", error);
      setMapState("error");
    });
  }, []);

  // 동 정보 비동기 추출
  useEffect(() => {
    const fetchDongInfo = async () => {
      if (!address) {
        setDongInfo("");
        return;
      }

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
  }, [address]);

  // Initialize map when SDK is ready
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapState !== "ready") {
      console.log("⚠️ Map initialization skipped:", {
        hasMapRef: !!mapRef.current,
        mapState,
        isVisible,
      });
      return;
    }

    try {
      console.log("🗺️ 지도 초기화 시작");

      // Default center (Seoul)
      const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.978);

      const mapOptions = {
        center: defaultCenter,
        level: 3,
      };

      const newMap = new window.kakao.maps.Map(mapRef.current, mapOptions);
      setMapInstance(newMap);

      console.log("✅ 지도 인스턴스 생성 완료");

      // Create info window
      const newInfoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:10px;min-width:200px;">로딩 중...</div>',
      });
      setInfoWindowInstance(newInfoWindow);

      console.log("✅ 정보창 생성 완료");
    } catch (error) {
      console.error("❌ 지도 초기화 실패:", error);
      setMapState("error");
    }
  }, [mapState]);

  // Update map when coordinates change
  const updateMapWithCoordinates = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstance || !infoWindowInstance) {
        console.log("⚠️ Coordinate update skipped:", {
          hasMapInstance: !!mapInstance,
          hasInfoWindow: !!infoWindowInstance,
        });
        return;
      }

      try {
        console.log(`📍 좌표 업데이트: ${lat}, ${lng}`);

        const position = new window.kakao.maps.LatLng(lat, lng);

        // Only center on first load
        if (!hasInitialized) {
          console.log("🎯 First load - centering map");
          mapInstance.setCenter(position);
          setHasInitialized(true);
        } else {
          console.log("🔄 Subsequent update - keeping current center");
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
        setMarkerInstance(newMarker);

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
        infoWindowInstance.open(mapInstance, newMarker);

        // Add click event to marker
        window.kakao.maps.event.addListener(newMarker, "click", () => {
          if (infoWindowInstance) {
            infoWindowInstance.open(mapInstance, newMarker);
          }
        });

        console.log("✅ 마커 및 정보창 업데이트 완료");
      } catch (error) {
        console.error("❌ 좌표 업데이트 실패:", error);
      }
    },
    [
      mapInstance,
      infoWindowInstance,
      markerInstance,
      address,
      dongInfo,
      dongInfoLoading,
      hasInitialized,
    ]
  );

  // Geocode address to coordinates
  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!mapInstance || !address) {
        console.log("⚠️ Address geocoding skipped:", {
          hasMapInstance: !!mapInstance,
          hasAddress: !!address,
        });
        return;
      }

      try {
        console.log(`🔍 주소 지오코딩: ${address}`);

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              parseFloat(result[0].y),
              parseFloat(result[0].x)
            );

            console.log(`✅ 주소 변환 성공: ${result[0].y}, ${result[0].x}`);

            // Only center on first load
            if (!hasInitialized) {
              console.log("🎯 First load - centering map");
              mapInstance.setCenter(coords);
              setHasInitialized(true);
            } else {
              console.log("🔄 Subsequent update - keeping current center");
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
            setMarkerInstance(newMarker);

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
              infoWindowInstance.open(mapInstance, newMarker);
            }

            // Add click event
            window.kakao.maps.event.addListener(newMarker, "click", () => {
              if (infoWindowInstance) {
                infoWindowInstance.open(mapInstance, newMarker);
              }
            });
          } else {
            console.warn(`⚠️ 주소 변환 실패: ${status}`);
          }
        });
      } catch (error) {
        console.error("❌ 주소 지오코딩 오류:", error);
      }
    },
    [
      mapInstance,
      markerInstance,
      infoWindowInstance,
      dongInfo,
      dongInfoLoading,
      hasInitialized,
    ]
  );

  // Initialize map when ready
  useEffect(() => {
    if (mapState === "ready" && isVisible) {
      // Wait for next render cycle to ensure container exists
      setTimeout(() => {
        console.log("🔄 Delayed map initialization...");
        initializeMap();
      }, 0);
    }
  }, [mapState, isVisible, initializeMap]);

  // Handle coordinate updates
  useEffect(() => {
    if (latitude && longitude && mapInstance) {
      console.log("🔄 Coordinates received, updating map...");
      updateMapWithCoordinates(latitude, longitude);
    }
  }, [latitude, longitude, mapInstance, updateMapWithCoordinates]);

  // Handle address updates
  useEffect(() => {
    if (address && mapInstance && !latitude && !longitude) {
      console.log("🔄 Address received, geocoding...");
      geocodeAddress(address);
    }
  }, [address, mapInstance, latitude, longitude, geocodeAddress]);

  // Handle visibility changes
  useEffect(() => {
    console.log("🔍 Visibility change:", { isVisible, mapState });
    if (!isVisible) {
      // Clean up when hidden
      if (infoWindowInstance) {
        infoWindowInstance.close();
      }
    }
  }, [isVisible, infoWindowInstance, mapState]);

  // Final render check
  useEffect(() => {
    console.log("🎯 MapComponent render state:", {
      isVisible,
      mapState,
      shouldRender: isVisible,
      shouldShowMap: isVisible && mapState === "ready",
      containerExists: !!mapRef.current,
      containerStyle: mapRef.current
        ? {
            display: mapRef.current.style.display,
            visibility: mapRef.current.style.visibility,
            height: mapRef.current.style.height,
          }
        : null,
    });
  }, [isVisible, mapState]);

  if (!isVisible) {
    console.log("🚫 MapComponent not visible, returning null");
    return null;
  }

  return (
    <div className="">
      {/* 드롭다운 지도 컨테이너 */}
      <div className="z-50 bg-white border border-light-border rounded-b-lg">
        {/* 지도 컨테이너 */}
        <div className="">
          {mapState === "loading" && (
            <div
              className="w-full flex items-center justify-center bg-gray-100"
              style={{ height: "300px" }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm">카카오맵 로딩 중...</p>
                <p className="text-xs text-gray-500 mt-1">SDK 초기화 중</p>
              </div>
            </div>
          )}

          {mapState === "error" && (
            <div
              className="w-full flex items-center justify-center bg-red-50"
              style={{ height: "300px" }}
            >
              <div className="text-center">
                <p className="text-sm text-red-600">지도 로딩 실패</p>
                <p className="text-xs text-red-500 mt-1">
                  API 키를 확인해주세요
                </p>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            className={`w-full rounded-b-lg ${mapState !== "ready" ? "hidden" : ""}`}
            style={{ height: "300px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
