import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DateRange } from 'react-day-picker';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import MapFilters from '@/components/map/MapFilters';
import MapSideMenu from '@/components/map/MapSideMenu';
import SimpleKakaoMap from '@/components/map/SimpleKakaoMap';
import { useMapComplaints } from '@/hooks/useMapComplaints';
import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import type { PinClickEvent, PinData } from '@/types/map';
import { getEnglishId, getKoreanLabel } from '@/utils/categoryMapping';
import {
  complaintToPinDataWithGroup,
  getRepresentativeComplaint,
  groupComplaintsByAddress,
  isValidCoordinate
} from '@/utils/pinUtils';

export default function MapOverview() {
  const { complaintId } = useParams<{ complaintId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);

  // Date range state - lifted up from MapFilters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    selectedComplaintId,
    selectedPinCoordinates,
    centerMapOnSelectedPin,
    setSelectedPinCoordinates,
    centerMapOnSelectedPinWithRetry,
    isGeocoding,
    geocodedPins,
  } = useMapOverviewStore();

  // Callback to reset category to 'all'
  const handleCategoryReset = useCallback(() => {
    setSelectedCategory('all');
  }, []);

  // Fetch complaints data
  const { complaints } = useMapComplaints(
    selectedCategory,
    dateRange,
    handleCategoryReset
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleKoreanCategoryChange = (koreanLabel: string) => {
    const englishId = getEnglishId(koreanLabel);
    setSelectedCategory(englishId);
  };

  const currentKoreanLabel = getKoreanLabel(selectedCategory);

  // 민원 -> 지도 핀
  const pins = useMemo((): PinData[] => {
    const pinData: PinData[] = [];

    // Add real complaints if available
    if (complaints && complaints.length > 0) {
      // 동일한 주소 그룹으로 묶기
      const groupedComplaints = groupComplaintsByAddress(complaints);

      // 그룹 -> 핀
      groupedComplaints.forEach((complaintsAtAddress) => {
        const representativeComplaint =
          getRepresentativeComplaint(complaintsAtAddress);
        const pin = complaintToPinDataWithGroup(
          representativeComplaint,
          complaintsAtAddress
        );
        pinData.push(pin);
      });
    }

    return pinData;
  }, [complaints]);

  //! 핀 클릭 이벤트
  const handlePinClick = (event: PinClickEvent) => {
    const { pin } = event;

    setSelectedPinCoordinates({ lat: pin.lat, lng: pin.lng });

    navigate(`/map/overview/complaints/${pin.complaintId}`);
  };

  useEffect(() => {
    if (selectedComplaintId && selectedPinCoordinates) {
      centerMapOnSelectedPinWithRetry();
    }
  }, [selectedComplaintId, selectedPinCoordinates, centerMapOnSelectedPinWithRetry])

  useEffect(() => {
    if (selectedComplaintId && !isGeocoding && geocodedPins.length > 0) {
      // Retry centering when geocoding is complete
      centerMapOnSelectedPinWithRetry();
    }
  }, [selectedComplaintId, isGeocoding, geocodedPins, centerMapOnSelectedPinWithRetry]);

  const findPinCoordinatesByComplaintId = useCallback((complaintId: string) => {
    const pin = pins.find(p => p.complaintId.toString() === complaintId);
    return pin ? { lat: pin.lat, lng: pin.lng } : null;
  }, [pins]);

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

      const pinCoordinates = findPinCoordinatesByComplaintId(complaintId);
      if (pinCoordinates) {
        setSelectedPinCoordinates(pinCoordinates);
      }
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
      setSelectedPinCoordinates(null);
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
    setSelectedPinCoordinates,
    findPinCoordinatesByComplaintId,
  ]);

  useEffect(() => {
    if (selectedComplaintId && geocodedPins.length > 0) {
      // Check if we can now center on the selected pin
      const selectedPin = geocodedPins.find(
        pin => pin.complaintId.toString() === selectedComplaintId
      );
      
      if (selectedPin && isValidCoordinate(selectedPin.lat, selectedPin.lng)) {
        setSelectedPinCoordinates({ lat: selectedPin.lat, lng: selectedPin.lng });
        centerMapOnSelectedPin();
      }
    }
  }, [selectedComplaintId, geocodedPins, setSelectedPinCoordinates, centerMapOnSelectedPin]);

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
        selectedCategory={currentKoreanLabel}
        onCategoryChange={handleKoreanCategoryChange}
      />
      <MapFilters
        sidebarOpen={sidebarOpen}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      {/* Render nested routes with dateRange context */}
      <Outlet context={{ dateRange }} />
    </div>
  );
}
