// stores/complaintFormUIStore.ts
import { create } from "zustand";

// Define focus state interface
interface FocusState {
  routeInput: boolean;
  trashInput: boolean;
  input3: boolean;
}

// Define map coordinates interface
interface MapCoordinates {
  latitude: number;
  longitude: number;
}

// Define complaint form UI state interface
interface ComplaintFormUIState {
  // Focus states
  focus: FocusState;

  // Map related state
  showMap: boolean;
  mapCoordinates: MapCoordinates | null;
  resetMapCenter: boolean;

  // Timeout management
  frequencyTimeout: NodeJS.Timeout | null;

  // Actions
  setFocus: (focus: Partial<FocusState>) => void;
  setShowMap: (show: boolean) => void;
  setMapCoordinates: (coordinates: MapCoordinates | null) => void;
  setResetMapCenter: (reset: boolean) => void;
  setFrequencyTimeout: (timeout: NodeJS.Timeout | null) => void;

  // Helper actions
  resetFocus: () => void;
  resetMap: () => void;
}

// Create the complaint form UI store
export const useComplaintFormUIStore = create<ComplaintFormUIState>()(
  (set, get) => ({
    // Initial state
    focus: {
      routeInput: false,
      trashInput: false,
      input3: false,
    },
    showMap: false,
    mapCoordinates: null,
    resetMapCenter: false,
    frequencyTimeout: null,

    // Actions
    setFocus: (newFocus) =>
      set((state) => ({
        focus: { ...state.focus, ...newFocus },
      })),

    setShowMap: (show) => set({ showMap: show }),

    setMapCoordinates: (coordinates) => set({ mapCoordinates: coordinates }),

    setResetMapCenter: (reset) => set({ resetMapCenter: reset }),

    setFrequencyTimeout: (timeout) => set({ frequencyTimeout: timeout }),

    // Helper actions
    resetFocus: () =>
      set({
        focus: {
          routeInput: false,
          trashInput: false,
          input3: false,
        },
      }),

    resetMap: () =>
      set({
        showMap: false,
        mapCoordinates: null,
        resetMapCenter: false,
      }),
  })
);
