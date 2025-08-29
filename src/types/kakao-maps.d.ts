// 카카오맵 API 타입 정의
interface KakaoPlace {
  place_name: string;
  road_address_name: string;
  address_name: string;
  x: string;
  y: string;
  phone: string;
}

interface KakaoPlacesCallback {
  (data: KakaoPlace[], status: string): void;
}

interface KakaoPlaces {
  keywordSearch: (query: string, callback: KakaoPlacesCallback) => void;
}

interface KakaoServicesStatus {
  OK: string;
  ZERO_RESULT: string;
  ERROR: string;
}

interface KakaoServices {
  Places: new () => KakaoPlaces;
  Status: KakaoServicesStatus;
}

interface MapOptions {
  center: KakaoLatLng;
  level: number;
}

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        services: KakaoServices;
      };
    };
  }
}

export {};
