import React, { forwardRef, useEffect } from "react";

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

const KakaoMap = forwardRef<HTMLElement, KakaoMapProps>(
  ({ center = { lat: 37.6714001064975, lng: 127.041485813197 }, zoom = 2 }, ref) => {
    useEffect(() => {
      const apiKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

      if (!apiKey) {
        console.error("Kakao Maps API key is not defined");
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;

      script.onload = () => {
        (window.kakao.maps as unknown as { load: (callback: () => void) => void }).load(() => {
          const container = document.getElementById("map");
          if (container) {
            const options = {
              center: new window.kakao.maps.LatLng(center.lat, center.lng),
              level: zoom,
            };
            new window.kakao.maps.Map(container, options);

            if (ref) {
              (ref as React.RefObject<HTMLElement>).current = container;
            }
          }
        });
      };

      script.onerror = () => {
        console.error("Failed to load Kakao Maps SDK");
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }, [center, zoom, ref]);

    return <div id="map" className="w-full h-full" />;
  }
);

KakaoMap.displayName = "KakaoMap";
export default KakaoMap;
