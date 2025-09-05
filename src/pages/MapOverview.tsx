import { useRef, useState } from "react";
import MapSideMenu from "@/components/map/MapSideMenu";
import UnifiedKakaoMap from "@/components/map/UnifiedKakaoMap";
import MapFilters from "@/components/map/MapFilters";

export default function MapOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-screen w-screen relative">
      <UnifiedKakaoMap
        ref={mapRef}
        mode="simple"
        center={{ lat: 37.6714001064975, lng: 127.041485813197 }}
        zoom={2}
      />
      <MapSideMenu onSidebarChange={setSidebarOpen} />
      <MapFilters sidebarOpen={sidebarOpen} />
    </div>
  );
}
