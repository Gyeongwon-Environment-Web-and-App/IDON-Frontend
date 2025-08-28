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
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
  setContent: (content: string) => void;
}

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
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [marker, setMarker] = useState<KakaoMarker | null>(null);
  const [infoWindow, setInfoWindow] = useState<KakaoInfoWindow | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [dongInfo, setDongInfo] = useState<string>("");
  const [dongInfoLoading, setDongInfoLoading] = useState(false);

  useEffect(() => {
    // 카카오맵 API가 로드되었는지 확인
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      setApiLoaded(true);
    } else {
      // 카카오맵 JavaScript API 로드
      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

      if (!apiKey) {
        console.error("카카오맵 JavaScript API 키가 설정되지 않았습니다.");
        return;
      }

      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services`;
      script.async = true;
      script.onload = () => {
        setApiLoaded(true);
      };
      script.onerror = (error) => {
        console.error("카카오맵 JavaScript API 로드 실패:", error);
      };
      document.head.appendChild(script);
    }
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

  // 지도 초기화 함수를 useCallback으로 메모이제이션
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !latitude || !longitude || !apiLoaded) {
      return;
    }

    try {
      const mapOptions = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
        mapTypeId: window.kakao.maps.MapTypeId.ROADMAP,
      };

      const newMap = new window.kakao.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // 마커 생성
      const newMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude),
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
          ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ""}
        </div>
      `;

      const newInfoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
      });
      setInfoWindow(newInfoWindow);

      // 마커 클릭 시 정보창 표시
      window.kakao.maps.event.addListener(newMarker, "click", () => {
        newInfoWindow.open(newMap, newMarker);
      });

      // 초기에 정보창 표시
      newInfoWindow.open(newMap, newMarker);

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
        infoWindow.close();
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
      const position = new window.kakao.maps.LatLng(latitude, longitude);
      map.setCenter(position);
      marker.setPosition(position);

      // 정보창 내용 업데이트
      if (infoWindow) {
        const updatedContent = `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
              민원 발생 위치${dongInfo ? `: ${dongInfo}` : ""}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address || "주소 정보 없음"}</p>
            ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ""}
          </div>
        `;
        infoWindow.setContent(updatedContent);
        infoWindow.open(map, marker);
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
    dongInfoLoading,
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
                  카카오맵 JavaScript API 초기화 중
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
            className={`w-full rounded-b-lg ${!apiLoaded || !mapInitialized ? "hidden" : ""}`}
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
