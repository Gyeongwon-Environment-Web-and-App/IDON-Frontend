import { useRef, useState } from "react";
import MapSideMenu from "@/components/map/MapSideMenu";
import SimpleKakaoMap from "@/components/map/SimpleKakaoMap";
import MapFilters from "@/components/map/MapFilters";

export default function MapOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-screen w-screen relative">
      <SimpleKakaoMap
        ref={mapRef}
        center={{ lat: 37.6714001064975, lng: 127.041485813197 }}
        zoom={2}
      />
      <MapSideMenu onSidebarChange={setSidebarOpen} />
      <MapFilters sidebarOpen={sidebarOpen} />
    </div>
  );
}
