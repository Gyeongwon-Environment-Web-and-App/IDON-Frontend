import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import MapSideMenu from "@/components/map/MapSideMenu";
import SimpleKakaoMap from "@/components/map/SimpleKakaoMap";
import MapFilters from "@/components/map/MapFilters";
import { useMapOverviewStore } from "@/stores/mapOverviewStore";
import type { DateRange } from "react-day-picker";

export default function MapOverview() {
  const { complaintId } = useParams<{ complaintId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);

  // Date range state - lifted up from MapFilters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    sidebarOpen,
    mapCenter,
    mapZoom,
    setSelectedComplaintId,
    setSidebarOpen,
    setCurrentView,
    openComplaintDetail,
    openComplaintList,
    clearSelectedComplaint,
  } = useMapOverviewStore();

  // Handle URL parameter changes and route-based navigation
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes("/complaints/") && complaintId) {
      // Navigate to complaint detail view
      setSelectedComplaintId(complaintId);
      setCurrentView("detail");
      openComplaintDetail(complaintId);
    } else if (pathname.includes("/complaints") && !complaintId) {
      // Navigate to complaint list view
      setCurrentView("list");
      openComplaintList();
    } else if (pathname === "/map/overview") {
      // Base map overview - no specific view
      setCurrentView(null);
      clearSelectedComplaint();
    }
  }, [
    location.pathname,
    complaintId,
    setSelectedComplaintId,
    setCurrentView,
    openComplaintDetail,
    openComplaintList,
    clearSelectedComplaint,
  ]);

  // Handle sidebar change and sync with URL
  const handleSidebarChange = (isOpen: boolean) => {
    setSidebarOpen(isOpen);

    // If sidebar is closed, navigate back to base overview
    if (!isOpen) {
      navigate("/map/overview");
    }
  };

  return (
    <div className="h-screen w-screen relative">
      <SimpleKakaoMap ref={mapRef} center={mapCenter} zoom={mapZoom} />
      <MapSideMenu
        onSidebarChange={handleSidebarChange}
        dateRange={dateRange}
      />
      <MapFilters
        sidebarOpen={sidebarOpen}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      {/* Render nested routes with dateRange context */}
      <Outlet context={{ dateRange }} />
    </div>
  );
}
