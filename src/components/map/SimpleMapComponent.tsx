import React, { useEffect, useRef, useState } from "react";

interface SimpleMapComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  isVisible: boolean;
  onClose: () => void;
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  latitude,
  longitude,
  address,
  isVisible,
  onClose,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && latitude && longitude) {
      // 카카오 지도 API 로드
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY || "test"}&libraries=services`;
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeKakaoMap();
      };
      script.onerror = () => {
        console.error("카카오 지도 API 로드 실패");
        // 카카오 지도가 실패하면 네이버 지도로 폴백
        loadNaverMap();
      };
      document.head.appendChild(script);
    }
  }, [isVisible, latitude, longitude]);

  const initializeKakaoMap = () => {
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      const container = document.getElementById("map");
      if (container && latitude && longitude) {
        const options = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(latitude, longitude),
        });
        marker.setMap(map);
      }
    }
  };

  const loadNaverMap = () => {
    const script = document.createElement("script");
    const clientId =
      import.meta.env.VITE_NAVER_MAP_CLIENT_ID ||
      import.meta.env.VITE_NAVER_CLOUD_API_KEY_ID;
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      initializeNaverMap();
    };
    document.head.appendChild(script);
  };

  const initializeNaverMap = () => {
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      const container = document.getElementById("map");
      if (container && latitude && longitude) {
        const mapOptions = {
          center: new window.naver.maps.LatLng(latitude, longitude),
          zoom: 15,
        };
        const map = new window.naver.maps.Map(container, mapOptions);

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(latitude, longitude),
          map: map,
        });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold">민원 발생 위치 확인</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 지도 컨테이너 */}
        <div className="p-4 flex-1">
          {!mapLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p>지도 로딩 중...</p>
              </div>
            </div>
          )}
          <div
            id="map"
            className={`w-full h-full rounded-lg ${!mapLoaded ? "hidden" : ""}`}
            style={{ height: "500px" }}
          />
        </div>

        {/* 주소 정보 */}
        {address && (
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <p className="text-sm text-gray-600">
              <strong>주소:</strong> {address}
            </p>
            {latitude && longitude && (
              <p className="text-sm text-gray-600">
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

export default SimpleMapComponent;

