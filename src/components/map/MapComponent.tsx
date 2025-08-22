import React, { useEffect, useRef, useState, useCallback } from "react";
import { getDongInfo } from "../../utils/dongMapping";

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  isVisible: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  address,
  isVisible,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<unknown>(null);
  const [marker, setMarker] = useState<unknown>(null);
  const [infoWindow, setInfoWindow] = useState<unknown>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  // 동 정보 추출
  const dongInfo = address ? getDongInfo(address) : "";

  useEffect(() => {
    // 네이버 지도 API가 로드되었는지 확인
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      setApiLoaded(true);
    } else {
      // 네이버 지도 Open API 로드
      const script = document.createElement("script");
      const clientId = import.meta.env.VITE_NAVER_CLOUD_API_KEY_ID;

      if (!clientId) {
        console.error("네이버 지도 Open API Client ID가 설정되지 않았습니다.");
        return;
      }

      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.onload = () => {
        setApiLoaded(true);
      };
      script.onerror = (error) => {
        console.error("네이버 지도 Open API 로드 실패:", error);
      };
      document.head.appendChild(script);
    }
  }, []);

  // 지도 초기화 함수를 useCallback으로 메모이제이션
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !latitude || !longitude || !apiLoaded) {
      return;
    }

    try {
      const mapOptions = {
        center: new window.naver.maps.LatLng(latitude, longitude),
        zoom: 15,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.DROPDOWN,
        },
      };

      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // 마커 생성
      const newMarker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(latitude, longitude),
        map: newMap,
      });
      setMarker(newMarker);

      // 정보창 생성 (동 정보 포함)
      const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
            민원 발생 위치${dongInfo ? `: ${dongInfo}` : ""}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address || "주소 정보 없음"}</p>
        </div>
      `;

      const newInfoWindow = new window.naver.maps.InfoWindow({
        content: infoContent,
      });
      setInfoWindow(newInfoWindow);

      // 마커 클릭 시 정보창 표시
      window.naver.maps.Event.addListener(newMarker, "click", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newInfoWindow as any).open(newMap, newMarker);
      });

      // 초기에 정보창 표시
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newInfoWindow as any).open(newMap, newMarker);

      setMapInitialized(true);
    } catch (error) {
      console.error("지도 초기화 실패:", error);
    }
  }, [latitude, longitude, apiLoaded, address, dongInfo]);

  // API 로드 완료 후 지도 초기화
  useEffect(() => {
    // 지도가 숨겨질 때 상태 리셋
    if (!isVisible && mapInitialized) {
      if (infoWindow) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (infoWindow as any).close();
      }
      setMapInitialized(false);
      setMap(null);
      setMarker(null);
      setInfoWindow(null);
      return;
    }

    if (apiLoaded && isVisible && latitude && longitude && !mapInitialized) {
      initializeMap();
    }
  }, [
    apiLoaded,
    isVisible,
    latitude,
    longitude,
    initializeMap,
    mapInitialized,
    infoWindow,
  ]);

  // 좌표 변경 시 지도 업데이트
  useEffect(() => {
    if (map && marker && latitude && longitude && apiLoaded && mapInitialized) {
      const position = new window.naver.maps.LatLng(latitude, longitude);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).setCenter(position);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (marker as any).setPosition(position);

      // 정보창 내용 업데이트
      if (infoWindow) {
        const updatedContent = `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
              민원 발생 위치${dongInfo ? `: ${dongInfo}` : ""}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address || "주소 정보 없음"}</p>
          </div>
        `;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (infoWindow as any).setContent(updatedContent);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (infoWindow as any).open(map, marker);
      }
    }
  }, [
    latitude,
    longitude,
    map,
    marker,
    apiLoaded,
    address,
    dongInfo,
    infoWindow,
    mapInitialized,
  ]);

  if (!isVisible) return null;

  return (
    <div className="">
      {/* 드롭다운 지도 컨테이너 */}
      <div className="z-50 bg-white border border-light-border rounded-b-lg">
        {/* 지도 컨테이너 */}
        <div className="">
          {!apiLoaded && (
            <div
              className="w-full flex items-center justify-center bg-gray-100"
              style={{ height: "300px" }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm">지도 로딩 중...</p>
                <p className="text-xs text-gray-500 mt-1">
                  네이버 지도 Open API 초기화 중
                </p>
              </div>
            </div>
          )}
          {apiLoaded && !mapInitialized && (
            <div
              className="w-full flex items-center justify-center bg-gray-100"
              style={{ height: "300px" }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                <p className="text-sm">지도 초기화 중...</p>
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className={`w-full ${!apiLoaded || !mapInitialized ? "hidden" : ""}`}
            style={{ height: "300px" }}
          />
        </div>

        {/* 주소 정보 */}
        {address && (
          <div className="p-3 border-t bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600">
              <strong>주소:</strong> {address}
            </p>
            {dongInfo && (
              <p className="text-xs text-gray-600">
                <strong>동 정보:</strong> {dongInfo}
              </p>
            )}
            {latitude && longitude && (
              <p className="text-xs text-gray-600">
                <strong>좌표:</strong> {latitude.toFixed(6)},{" "}
                {longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
