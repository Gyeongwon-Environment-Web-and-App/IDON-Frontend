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

export interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoSize {
  width: number;
  height: number;
}

export interface KakaoPoint {
  x: number;
  y: number;
}

export interface KakaoMarkerImage {
  src: string;
  size: KakaoSize;
  options: { offset: KakaoPoint };
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => KakaoLatLng;
}

interface KakaoEvent {
  addListener: (target: unknown, type: string, handler: () => void) => void;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        MarkerImage: new (
          src: string,
          size: KakaoSize,
          options: { offset: KakaoPoint }
        ) => KakaoMarkerImage;
        Marker: new (options: {
          position: KakaoLatLng;
          image?: KakaoMarkerImage;
          map?: KakaoMap;
        }) => KakaoMarker;
        event: KakaoEvent;
        services: KakaoServices;
      };
    };
  }
}

export {};
