import { useEffect, useMemo, useRef, useState } from 'react';

import type { DateRange } from 'react-day-picker';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import MapFilters from '@/components/map/MapFilters';
import MapSideMenu from '@/components/map/MapSideMenu';
import SimpleKakaoMap from '@/components/map/SimpleKakaoMap';
import { useComplaints } from '@/hooks/useComplaints';
import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import type { PinClickEvent, PinData } from '@/types/map';
import {
  complaintToPinData,
  getRepresentativeComplaint,
  groupComplaintsByAddress,
} from '@/utils/pinUtils';

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
    setActiveSidebar,
  } = useMapOverviewStore();

  // Fetch complaints data
  const { complaints } = useComplaints(dateRange);

  // Convert complaints to pin data with clustering
  const pins = useMemo((): PinData[] => {
    if (!complaints || complaints.length === 0) {
      console.log('🗺️ No complaints data available for pins');
      return [];
    }

    console.log('🗺️ Processing complaints for pins:', complaints.length);

    // 동일한 주소 그룹으로 묶기
    const groupedComplaints = groupComplaintsByAddress(complaints);
    console.log('🗺️ Grouped complaints by address:', groupedComplaints.size);

    // 그룹 -> 핀
    const pinData: PinData[] = [];

    groupedComplaints.forEach((complaintsAtAddress, address) => {
      const representativeComplaint =
        getRepresentativeComplaint(complaintsAtAddress);
      const pin = complaintToPinData(representativeComplaint);
      pinData.push(pin);
      console.log(
        `🗺️ Created pin for address: ${address}, category: ${pin.category}, repeat: ${pin.isRepeat}`
      );
    });

    console.log('🗺️ Total pins created:', pinData.length);
    return pinData;
  }, [complaints]);

  //! 핀 클릭 이벤트
  const handlePinClick = (event: PinClickEvent) => {
    const { pin } = event;
    navigate(`/map/overview/complaints/${pin.complaintId}`);
  };

  // Handle URL parameter changes and route-based navigation
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes('/complaints/') && complaintId) {
      // Navigate to complaint detail view
      setSelectedComplaintId(complaintId);
      setCurrentView('detail');
      openComplaintDetail(complaintId);
      setSidebarOpen(true);
      setActiveSidebar('complaint');
    } else if (pathname.includes('/complaints') && !complaintId) {
      // Navigate to complaint list view
      setCurrentView('list');
      openComplaintList();
      setSidebarOpen(true);
      setActiveSidebar('complaint');
    } else if (pathname === '/map/overview') {
      // Base map overview - no specific view
      setCurrentView(null);
      clearSelectedComplaint();
      setSidebarOpen(false);
      setActiveSidebar(null);
    }
  }, [
    location.pathname,
    complaintId,
    setSelectedComplaintId,
    setCurrentView,
    openComplaintDetail,
    openComplaintList,
    clearSelectedComplaint,
    setSidebarOpen,
    setActiveSidebar,
  ]);

  // Handle sidebar change and sync with URL
  const handleSidebarChange = (isOpen: boolean) => {
    setSidebarOpen(isOpen);

    // If sidebar is closed, navigate back to base overview
    if (!isOpen) {
      navigate('/map/overview');
    }
  };

  return (
    <div className="h-screen w-screen relative">
      <SimpleKakaoMap
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        pins={pins}
        onPinClick={handlePinClick}
      />
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
