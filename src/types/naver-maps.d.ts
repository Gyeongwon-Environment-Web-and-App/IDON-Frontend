// 네이버맵 API 타입 정의
interface NaverLatLng {
  new (lat: number, lng: number): NaverLatLngInstance;
}

interface NaverLatLngInstance {
  lat: () => number;
  lng: () => number;
}

interface NaverMapOptions {
  center: NaverLatLngInstance;
  level?: number;
  zoom?: number;
  mapTypeControl?: boolean;
  mapTypeControlOptions?: {
    style: string;
  };
}

interface NaverMap {
  new (container: HTMLElement, options: NaverMapOptions): NaverMapInstance;
}

interface NaverMapInstance {
  setCenter: (position: NaverLatLngInstance) => void;
  getCenter: () => NaverLatLngInstance;
}

interface NaverMarkerOptions {
  position: NaverLatLngInstance;
  map?: NaverMapInstance;
}

interface NaverMarker {
  new (options: NaverMarkerOptions): NaverMarkerInstance;
}

interface NaverMarkerInstance {
  setPosition: (position: NaverLatLngInstance) => void;
  getPosition: () => NaverLatLngInstance;
}

interface NaverInfoWindowOptions {
  content: string;
  zIndex?: number;
}

interface NaverInfoWindow {
  new (options: NaverInfoWindowOptions): NaverInfoWindowInstance;
}

interface NaverInfoWindowInstance {
  open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void;
  close: () => void;
}

interface NaverEvent {
  addListener: (
    target: NaverMarkerInstance | NaverMapInstance,
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
}

interface NaverMapTypeControlStyle {
  DROPDOWN: string;
}

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

interface KakaoMaps {
  services: KakaoServices;
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: NaverMap;
        LatLng: NaverLatLng;
        Marker: NaverMarker;
        InfoWindow: NaverInfoWindow;
        Event: NaverEvent;
        MapTypeControlStyle: NaverMapTypeControlStyle;
      };
    };
    kakao: {
      maps: KakaoMaps;
    };
  }
}

export {};
