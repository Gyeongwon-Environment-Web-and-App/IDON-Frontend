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
  getRepresentativeComplaint,
  groupComplaintsByAddress,
  complaintToPinDataWithGroup,
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
    // Always create dummy pin first
    const dummyPin: PinData = {
      id: 'pin-dummy-test',
      lat: 37.668875236,
      lng: 127.044191742,
      category: ['일반', '기타'],
      isRepeat: true,
      address: '서울특별시 도봉구 도봉로150다길 3',
      complaintId: 9999,
      content: '더미 핀 테스트용 민원내용을 추가하기 내용이 길어지면?',
      datetime: '2024-01-15T10:30:00',
      status: true,
    };

    const pinData: PinData[] = [dummyPin];

    // Add real complaints if available
    if (complaints && complaints.length > 0) {
      // 동일한 주소 그룹으로 묶기
      const groupedComplaints = groupComplaintsByAddress(complaints);

      // 그룹 -> 핀
      groupedComplaints.forEach((complaintsAtAddress, address) => {
        const representativeComplaint =
          getRepresentativeComplaint(complaintsAtAddress);
        const pin = complaintToPinDataWithGroup(representativeComplaint, complaintsAtAddress);
        pinData.push(pin);
        console.log(
          `🗺️ Created pin for address: ${address}, category: ${pin.category}, repeat: ${pin.isRepeat}`
        );
      });
    }

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
