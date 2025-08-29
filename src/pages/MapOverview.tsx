import { useRef, useState } from "react";
import MapSideMenu from "@/components/map/MapSideMenu";
import KakaoMap from "@/components/map/KakaoMap";
import MapFilters from "@/components/map/MapFilters";

export default function MapOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef<HTMLElement>(null);


  return (
    <div className="h-screen w-screen relative">
      <KakaoMap ref={mapRef} />
      <MapSideMenu onSidebarChange={setSidebarOpen}/>
      <MapFilters 
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
}