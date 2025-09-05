import { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapSideMenu from "@/components/map/MapSideMenu";
import SimpleKakaoMap from "@/components/map/SimpleKakaoMap";
import MapFilters from "@/components/map/MapFilters";
import { useMapOverviewStore } from "@/stores/mapOverviewStore";

export default function MapOverview() {
  const { complaintId } = useParams<{ complaintId?: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    sidebarOpen,
    mapCenter,
    mapZoom,
    setSelectedComplaintId,
    setSidebarOpen,
    openComplaintDetail,
    clearSelectedComplaint,
  } = useMapOverviewStore();

  // Handle URL parameter changes
  useEffect(() => {
    if (complaintId) {
      // Set the selected complaint ID and open complaint sidebar
      setSelectedComplaintId(complaintId);
      openComplaintDetail(complaintId);
    } else {
      // Clear selection if no complaint ID in URL
      clearSelectedComplaint();
    }
  }, [
    complaintId,
    setSelectedComplaintId,
    openComplaintDetail,
    clearSelectedComplaint,
  ]);

  // Handle sidebar change and sync with URL
  const handleSidebarChange = (isOpen: boolean) => {
    setSidebarOpen(isOpen);

    // If sidebar is closed and we have a complaint ID, navigate back to overview
    if (!isOpen && complaintId) {
      navigate("/map/overview");
    }
  };

  return (
    <div className="h-screen w-screen relative">
      <SimpleKakaoMap ref={mapRef} center={mapCenter} zoom={mapZoom} />
      <MapSideMenu onSidebarChange={handleSidebarChange} />
      <MapFilters sidebarOpen={sidebarOpen} />
    </div>
  );
}
