import { useEffect, useRef, useState, useCallback } from "react";

// Global SDK state management
interface KakaoSDKState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadPromise: Promise<void> | null;
}

// Singleton pattern for SDK management
class KakaoSDKManager {
  private static instance: KakaoSDKManager;
  private state: KakaoSDKState = {
    isLoaded: false,
    isLoading: false,
    error: null,
    loadPromise: null,
  };
  private listeners: Set<(state: KakaoSDKState) => void> = new Set();

  static getInstance(): KakaoSDKManager {
    if (!KakaoSDKManager.instance) {
      KakaoSDKManager.instance = new KakaoSDKManager();
    }
    return KakaoSDKManager.instance;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: KakaoSDKState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): KakaoSDKState {
    return { ...this.state };
  }

  async loadSDK(): Promise<void> {
    // Return existing promise if already loading
    if (this.state.loadPromise) {
      return this.state.loadPromise;
    }

    // Return immediately if already loaded
    if (this.state.isLoaded) {
      return Promise.resolve();
    }

    // Check if already loaded globally
    if (window.kakao?.maps) {
      this.state.isLoaded = true;
      this.state.isLoading = false;
      this.state.error = null;
      this.notifyListeners();
      return Promise.resolve();
    }

    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    this.state.loadPromise = new Promise((resolve, reject) => {
      const apiKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

      if (!apiKey) {
        const error = "Kakao Maps API key is not defined";
        this.state.error = error;
        this.state.isLoading = false;
        this.state.loadPromise = null;
        this.notifyListeners();
        reject(new Error(error));
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        `script[src*="dapi.kakao.com/v2/maps/sdk.js"]`
      );
      if (existingScript) {
        // Script exists, wait for it to load
        existingScript.addEventListener("load", () => {
          this.initializeSDK().then(resolve).catch(reject);
        });
        existingScript.addEventListener("error", () => {
          const error = "Failed to load existing Kakao Maps SDK";
          this.state.error = error;
          this.state.isLoading = false;
          this.state.loadPromise = null;
          this.notifyListeners();
          reject(new Error(error));
        });
        return;
      }

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        this.initializeSDK().then(resolve).catch(reject);
      };

      script.onerror = () => {
        const error = "Failed to load Kakao Maps SDK";
        this.state.error = error;
        this.state.isLoading = false;
        this.state.loadPromise = null;
        this.notifyListeners();
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });

    return this.state.loadPromise;
  }

  private async initializeSDK(): Promise<void> {
    try {
      if (window.kakao?.maps && "load" in window.kakao.maps) {
        await new Promise<void>((resolve) => {
          (
            window.kakao.maps as unknown as {
              load: (callback: () => void) => void;
            }
          ).load(() => {
            resolve();
          });
        });
      }

      this.state.isLoaded = true;
      this.state.isLoading = false;
      this.state.error = null;
      this.state.loadPromise = null;
      this.notifyListeners();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize Kakao Maps SDK";
      this.state.error = errorMessage;
      this.state.isLoading = false;
      this.state.loadPromise = null;
      this.notifyListeners();
      throw error;
    }
  }

  cleanup() {
    // Only cleanup if no other components are using it
    if (this.listeners.size === 0) {
      this.state = {
        isLoaded: false,
        isLoading: false,
        error: null,
        loadPromise: null,
      };
    }
  }
}

// Custom hook for using Kakao Maps SDK
export const useKakaoMaps = () => {
  const [state, setState] = useState<KakaoSDKState>(() =>
    KakaoSDKManager.getInstance().getState()
  );
  const managerRef = useRef(KakaoSDKManager.getInstance());

  useEffect(() => {
    const manager = managerRef.current;
    const unsubscribe = manager.subscribe(setState);

    // Load SDK if not already loaded
    if (!state.isLoaded && !state.isLoading) {
      manager.loadSDK().catch(console.error);
    }

    return () => {
      unsubscribe();
      manager.cleanup();
    };
  }, []);

  const loadSDK = useCallback(() => {
    return managerRef.current.loadSDK();
  }, []);

  return {
    ...state,
    loadSDK,
  };
};

// Type definitions for Kakao Maps
export interface KakaoLatLng {
  lat: () => number;
  lng: () => number;
}

export interface KakaoMap {
  setCenter: (position: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

export interface KakaoMarker {
  setPosition: (position: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setMap: (map: KakaoMap | null) => void;
}

export interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
  setContent: (content: string) => void;
}

declare const window: Window & {
  kakao: {
    maps: {
      load?: (callback: () => void) => void;
      LatLng: new (lat: number, lng: number) => KakaoLatLng;
      Map: new (
        container: HTMLElement,
        options: { center: KakaoLatLng; level: number; mapTypeId?: string }
      ) => KakaoMap;
      Marker: new (options: {
        map: KakaoMap;
        position: KakaoLatLng;
      }) => KakaoMarker;
      InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
      event: {
        addListener: (
          target: unknown,
          event: string,
          handler: () => void
        ) => void;
      };
      services: {
        Geocoder: new () => {
          addressSearch: (
            address: string,
            callback: (result: unknown[], status: unknown) => void
          ) => void;
        };
        Status: {
          OK: string;
        };
      };
    };
  };
};
