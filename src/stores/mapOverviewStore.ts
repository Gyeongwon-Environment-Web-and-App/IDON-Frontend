// stores/mapOverviewStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define complaint interface (matching complaintTableStore)
interface Complaint {
  id: string;
  date: string;
  address: string;
  type: string;
  status: "처리중" | "완료";
  content: string;
  [key: string]: unknown;
}

// Define map overview state interface
interface MapOverviewState {
  // Selected complaint state
  selectedComplaintId: string | null;
  selectedComplaint: Complaint | null;

  // Sidebar state
  sidebarOpen: boolean;
  activeSidebar: "complaint" | "vehicle" | "stats" | null;

  // Map state
  mapCenter: { lat: number; lng: number };
  mapZoom: number;

  // Actions
  setSelectedComplaintId: (id: string | null) => void;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSidebar: (sidebar: "complaint" | "vehicle" | "stats" | null) => void;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;

  // Helper actions
  clearSelectedComplaint: () => void;
  openComplaintDetail: (complaintId: string) => void;
  resetMapOverview: () => void;
}

// Create the map overview store
export const useMapOverviewStore = create<MapOverviewState>()(
  persist(
    (set) => ({
      // Initial state
      selectedComplaintId: null,
      selectedComplaint: null,
      sidebarOpen: false,
      activeSidebar: null,
      mapCenter: { lat: 37.6714001064975, lng: 127.041485813197 },
      mapZoom: 2,

      // Actions
      setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),

      setSelectedComplaint: (complaint) =>
        set({ selectedComplaint: complaint }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setActiveSidebar: (sidebar) =>
        set({
          activeSidebar: sidebar,
          sidebarOpen: sidebar !== null,
        }),

      setMapCenter: (center) => set({ mapCenter: center }),

      setMapZoom: (zoom) => set({ mapZoom: zoom }),

      // Helper actions
      clearSelectedComplaint: () =>
        set({
          selectedComplaintId: null,
          selectedComplaint: null,
        }),

      openComplaintDetail: (complaintId) =>
        set({
          selectedComplaintId: complaintId,
          activeSidebar: "complaint",
          sidebarOpen: true,
        }),

      resetMapOverview: () =>
        set({
          selectedComplaintId: null,
          selectedComplaint: null,
          sidebarOpen: false,
          activeSidebar: null,
          mapCenter: { lat: 37.6714001064975, lng: 127.041485813197 },
          mapZoom: 2,
        }),
    }),
    {
      name: "map-overview-storage", // localStorage key
      // Only persist essential state, not UI state
      partialize: (state) => ({
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom,
      }),
    }
  )
);

// Export types for use in components
export type { MapOverviewState };
