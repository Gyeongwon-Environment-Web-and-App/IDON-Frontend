import { useRef } from "react";
import MapSideMenu from "@/components/map/MapSideMenu";
import KakaoMap from "@/components/map/KakaoMap";

export default function MapOverview() {
  const mapRef = useRef<HTMLElement>(null);

  return (
    <div className="h-screen w-screen relative">
      <KakaoMap ref={mapRef} />
      <MapSideMenu />
    </div>
  );
}
