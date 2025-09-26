// stores/complaintFormStore.ts
import { create } from 'zustand';

import apiClient from '@/lib/api';

import {
  type ComplaintExtended,
  type ComplaintFormData,
  type DriverData,
  type DriverDataResponse,
} from '../types/complaint';

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
  driverData: DriverData;

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
  fetchDriverData: (address: string, categories: string[]) => Promise<void>;
  setDriverData: (data: DriverData) => void;
  resetDriverData: () => void;

  // Edit mode actions
  populateFormForEdit: (complaintData: ComplaintExtended) => void;
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

const initialDriverData: DriverData = {
  teams: [],
  loading: false,
  error: null,
};

// Step 3: Create the store
export const useComplaintFormStore = create<ComplaintFormState>()((set) => ({
  // Initial state
  formData: initialFormData,
  showAddressSearch: false,
  addresses: [],
  loading: false,
  error: null,
  tempAddress: '',
  addressFrequencyInfo: null,
  phoneFrequencyInfo: null,
  driverData: initialDriverData,

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

  setAddressFrequencyInfo: (addressInfo) => set({ addressFrequencyInfo: addressInfo }),

  setPhoneFrequencyInfo: (phoneInfo) => set({ phoneFrequencyInfo: phoneInfo }),

  resetForm: () =>
    set({
      formData: initialFormData,
      driverData: initialDriverData,
      showAddressSearch: false,
      addresses: [],
      loading: false,
      error: null,
      tempAddress: '',
      addressFrequencyInfo: null,
      phoneFrequencyInfo: null,
    }),

  // Edit mode actions
  populateFormForEdit: (complaintData) =>
    set(() => {
      const formData = {
        address: complaintData.address?.address || '',
        datetime: complaintData.datetime || new Date().toISOString(),
        categories: complaintData.categories || [],
        type: complaintData.type || '',
        content: complaintData.content || '',
        route: complaintData.route || '',
        source: {
          phone_no: complaintData.source?.phone_no || '',
          bad: complaintData.source?.bad || false,
        },
        notify: {
          usernames: [],
        },
        uploadedFiles: [],
        coordinates: undefined,
      };

      return {
        formData,
        tempAddress: formData.address,
      };
    }),

  // 차량 기사 정보 가져오기
  fetchDriverData: async (address: string, categories: string[]) => {
    set((state) => ({
      driverData: { ...state.driverData, loading: true, error: null },
    }));

    try {
      const response = await apiClient.post<DriverDataResponse>(
        '/complaint/getTeamsDriversForComplaint',
        { address, categories }
      );

      set((state) => ({
        driverData: {
          ...state.driverData,
          teams: response.data.teams,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        driverData: {
          ...state.driverData,
          loading: false,
          error: `드라이버 정보를 가져오는데 실패했습니다: ${error}`,
        },
      }));
    }
  },

  setDriverData: (data) => set({ driverData: data }),

  resetDriverData: () => set({ driverData: initialDriverData }),
}));
