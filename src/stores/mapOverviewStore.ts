// stores/mapOverviewStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Complaint } from '@/types/complaint';
import type { PinData } from '@/types/map';

// import { is } from 'date-fns/locale';

// Define map overview state interface
interface MapOverviewState {
  // Selected complaint state
  selectedComplaintId: string | null;
  selectedComplaint: Complaint | null;

  selectedPinCoordinates: { lat: number; lng: number } | null;

  // Geocoding state tracking
  isGeocoding: boolean;
  geocodedPins: PinData[];

  // Sidebar state
  sidebarOpen: boolean;
  activeSidebar: 'complaint' | 'vehicle' | 'stats' | null;

  // Map state
  mapCenter: { lat: number; lng: number };
  mapZoom: number;

  // Actions
  setSelectedComplaintId: (id: string | null) => void;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSidebar: (sidebar: 'complaint' | 'vehicle' | 'stats' | null) => void;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setSelectedPinCoordinates: (
    coordinates: { lat: number; lng: number } | null
  ) => void;

  // Geocoding state actions
  setIsGeocoding: (isGeocoding: boolean) => void;
  setGeocodedPins: (pins: PinData[]) => void;

  // Centering actions
  centerMapOnSelectedPin: () => void;
  centerMapOnSelectedPinWithRetry: () => void;

  // Helper actions
  clearSelectedComplaint: () => void;
  openComplaintDetail: (complaintId: string) => void;
  openComplaintList: () => void;
  resetMapOverview: () => void;

  // Navigation state
  currentView: 'list' | 'detail' | null;

  // Navigation actions
  setCurrentView: (view: 'list' | 'detail' | null) => void;
  setLastComplaintListPath: (path: string | null) => void;

  // URL state management
  currentComplaintPath: string | null;
  lastComplaintListPath: string | null;

  // New actions
  setCurrentComplaintPath: (path: string | null) => void;
  preserveCurrentPath: () => void;
  restoreComplaintPath: () => string | null;
}

const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    lat !== 0 &&
    lng !== 0 &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Create the map overview store
export const useMapOverviewStore = create<MapOverviewState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedComplaintId: null,
      selectedComplaint: null,
      sidebarOpen: false,
      activeSidebar: null,
      currentView: null,
      lastComplaintListPath: null,
      currentComplaintPath: null,
      mapCenter: { lat: 37.657463236, lng: 127.035542772 },
      mapZoom: 5,

      selectedPinCoordinates: null,
      isGeocoding: false,
      geocodedPins: [],

      // Actions
      setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),

      setSelectedComplaint: (complaint) =>
        set({ selectedComplaint: complaint }),

      setSelectedPinCoordinates: (coordinates) =>
        set({ selectedPinCoordinates: coordinates }),

      // Geocoding actions
      setIsGeocoding: (isGeocoding) => set({ isGeocoding }),
      setGeocodedPins: (pins) => set({ geocodedPins: pins }),

      centerMapOnSelectedPin: () => {
        const state = get();
        if (state.selectedPinCoordinates) {
          const { lat, lng } = state.selectedPinCoordinates;

          if (isValidCoordinate(lat, lng)) {
            set({
              mapCenter: state.selectedPinCoordinates,
              mapZoom: 5,
            });
          } else {
            console.warn('Invalid pin coordinates - mapOverviewStore', {
              lat,
              lng,
            });
          }
        }
      },

      centerMapOnSelectedPinWithRetry() {
        const state = get();

        if (state.isGeocoding) {
          console.log('Geocoding in progress, will retry centering');
          return;
        }

        if (state.selectedComplaintId && state.geocodedPins.length > 0) {
          const selectedPin = state.geocodedPins.find(
            (pin) => pin.complaintId.toString() === state.selectedComplaintId
          );

          if (
            selectedPin &&
            isValidCoordinate(selectedPin.lat, selectedPin.lng)
          ) {
            set({
              mapCenter: { lat: selectedPin.lat, lng: selectedPin.lng },
              mapZoom: 5,
            });
            console.log('center map on geocoded pin');
            return;
          }
        }

        if (state.selectedPinCoordinates) {
          const { lat, lng } = state.selectedPinCoordinates;
          if (isValidCoordinate(lat, lng)) {
            set({
              mapCenter: state.selectedPinCoordinates,
              mapZoom: 3,
            });
            return;
          }
        }
        console.warn('unable to center map - invalid coordinates');
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setActiveSidebar: (sidebar) =>
        set({
          activeSidebar: sidebar,
          sidebarOpen: sidebar !== null,
        }),

      setMapCenter: (center) => set({ mapCenter: center }),

      setMapZoom: (zoom) => set({ mapZoom: zoom }),

      // Navigation actions
      setCurrentView: (view) => set({ currentView: view }),

      setLastComplaintListPath: (path) => set({ lastComplaintListPath: path }),

      // New URL management actions
      setCurrentComplaintPath: (path) => set({ currentComplaintPath: path }),

      preserveCurrentPath: () => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/map/overview/complaints/')) {
          set({ currentComplaintPath: currentPath });
        }
      },

      restoreComplaintPath: () => {
        const state = get();
        return state.currentComplaintPath || '/map/overview/complaints';
      },

      // Helper actions
      clearSelectedComplaint: () =>
        set({
          selectedComplaintId: null,
          selectedComplaint: null,
          currentView: null,
        }),

      openComplaintDetail: (complaintId) =>
        set({
          selectedComplaintId: complaintId,
          activeSidebar: 'complaint',
          sidebarOpen: true,
          currentView: 'detail',
        }),

      openComplaintList: () => {
        const state = get();
        const targetPath =
          state.currentComplaintPath || '/map/overview/complaints';

        set({
          selectedComplaintId: null,
          selectedComplaint: null,
          activeSidebar: 'complaint',
          sidebarOpen: true,
          currentView: 'list',
        });

        return targetPath;
      },

      resetMapOverview: () =>
        set({
          selectedComplaintId: null,
          selectedComplaint: null,
          sidebarOpen: false,
          activeSidebar: null,
          currentView: null,
          lastComplaintListPath: null,
          mapCenter: { lat: 37.657463236, lng: 127.035542772 },
          mapZoom: 5,
        }),
    }),
    {
      name: 'map-overview-storage', // localStorage key
      // Only persist essential state, not UI state
      partialize: (state) => ({
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom,
        selectedPinCoordinates: state.selectedPinCoordinates,
      }),
    }
  )
);

export type { MapOverviewState };
