// Map-related types for pin management
export interface PinData {
  id: string;
  lat: number;
  lng: number;
  category: string;
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
