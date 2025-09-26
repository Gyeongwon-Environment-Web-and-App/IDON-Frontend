// Map-related types for pin management
export interface PinData {
  id: string;
  lat: number;
  lng: number;
  category: string[];
  isRepeat: boolean;
  address: string;
  complaintId: number;
  content: string;
  datetime: string;
  status: boolean;
}

export interface MapPinConfig {
  size: {
    width: number;
    height: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

export interface PinClickEvent {
  pin: PinData;
  marker: unknown; // Kakao Maps marker instance
  map: unknown; // Kakao Maps instance
}

// Polygon-related types
export interface PolygonCoordinates {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export interface PolygonFeature {
  type: 'Feature';
  properties: {
    team_id: number;
    truck_id: number;
  };
  geometry: PolygonCoordinates;
}

export interface RegionData {
  message: string;
  region_areas: {
    type: 'FeatureCollection';
    features: PolygonFeature[];
  };
}

export interface PolygonClickEvent {
  polygon: PolygonFeature;
  map: unknown; // Kakao Maps instance
}
