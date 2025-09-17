// stores/complaintFormStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ComplaintFormData } from '../types/complaint';

// Define address interface for type safety
interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  x: string;
  y: string;
  name?: string;
}

// Step 1: Define the state interface
interface ComplaintFormState {
  // Form data
  formData: ComplaintFormData;

  // UI state
  showAddressSearch: boolean;
  addresses: AddressData[];
  loading: boolean;
  error: string | null;
  tempAddress: string;
  addressFrequencyInfo: number | null;
  phoneFrequencyInfo: number | null;

  // Actions (functions that update state)
  updateFormData: (updates: Partial<ComplaintFormData>) => void;
  setShowAddressSearch: (show: boolean) => void;
  setAddresses: (addresses: AddressData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTempAddress: (address: string) => void;
  setAddressFrequencyInfo: (addressInfo: number | null) => void;
  setPhoneFrequencyInfo: (phoneInfo: number | null) => void;
  resetForm: () => void;
}

// Step 2: Initial form data
const initialFormData: ComplaintFormData = {
  address: '',
  datetime: new Date().toISOString(),
  categories: [],
  type: '',
  content: '',
  route: '',
  source: {
    phone_no: '',
    bad: false,
  },
  notify: {
    usernames: [],
  },
  uploadedFiles: [],
};

// Step 3: Create the store
export const useComplaintFormStore = create<ComplaintFormState>()(
  // Step 4: Add persistence middleware (auto-saves to sessionStorage)
  persist(
    (set) => ({
      // Initial state
      formData: initialFormData,
      showAddressSearch: false,
      addresses: [],
      loading: false,
      error: null,
      tempAddress: '',
      addressFrequencyInfo: null,
      phoneFrequencyInfo: null,

      // Actions
      updateFormData: (updates) =>
        set((state) => ({
          formData: { ...state.formData, ...updates },
        })),

      setShowAddressSearch: (show) => set({ showAddressSearch: show }),

      setAddresses: (addresses) => set({ addresses }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setTempAddress: (address) => set({ tempAddress: address }),

      setAddressFrequencyInfo: (addressInfo) =>
        set({ addressFrequencyInfo: addressInfo }),
      setPhoneFrequencyInfo: (phoneInfo) =>
        set({ phoneFrequencyInfo: phoneInfo }),

      resetForm: () =>
        set({
          formData: initialFormData,
          showAddressSearch: false,
          addresses: [],
          loading: false,
          error: null,
          tempAddress: '',
          addressFrequencyInfo: null,
          phoneFrequencyInfo: null,
        }),
    }),
    {
      name: 'complaint-form-storage', // localStorage key
      // Only persist form data, not UI state
      partialize: (state) => ({
        formData: state.formData,
        tempAddress: state.tempAddress,
      }),
      // Migration function to handle old data structure
      migrate: (persistedState: unknown) => {
        const state = persistedState as {
          formData?: { categories?: string[] };
        };
        if (state.formData && !state.formData.categories) {
          state.formData.categories = [];
        }
        return state;
      },
      version: 1,
    }
  )
);
