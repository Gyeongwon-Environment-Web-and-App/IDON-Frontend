// stores/complaintTableStore.ts
import type { DateRange } from 'react-day-picker';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Complaint } from '../types/complaint';

// Define complaint table state interface
interface ComplaintTableState {
  // Filter and search state
  dateRange: DateRange | undefined;
  searchTerm: string;
  sortOrder: '최근' | '옛';

  // Data state
  complaints: Complaint[];
  filteredComplaints: Complaint[];

  // UI state
  isPopupOpen: boolean;
  selectedComplaintId: string | null;
  selectedComplaintStatus: '처리중' | '완료' | null;
  selectedRows: Set<string>;

  // Actions
  setDateRange: (range: DateRange | undefined) => void;
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: '최근' | '옛') => void;
  setComplaints: (complaints: Complaint[]) => void;
  setFilteredComplaints: (complaints: Complaint[]) => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  setSelectedComplaintId: (id: string | null) => void;
  setSelectedComplaintStatus: (status: '처리중' | '완료' | null) => void;
  setSelectedRows: (rows: Set<string>) => void;

  // Helper actions
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  selectAllRows: () => void;
  clearSelection: () => void;
  toggleRowSelection: (id: string) => void;
  resetTable: () => void;
}

// Create the complaint table store
export const useComplaintTableStore = create<ComplaintTableState>()(
  persist(
    (set, get) => ({
      // Initial state
      dateRange: undefined,
      searchTerm: '',
      sortOrder: '최근',
      complaints: [],
      filteredComplaints: [],
      isPopupOpen: false,
      selectedComplaintId: null,
      selectedComplaintStatus: null,
      selectedRows: new Set(),

      // Actions
      setDateRange: (range) => set({ dateRange: range }),

      setSearchTerm: (term) => set({ searchTerm: term }),

      setSortOrder: (order) => set({ sortOrder: order }),

      setComplaints: (complaints) => set({ complaints }),

      setFilteredComplaints: (complaints) =>
        set({ filteredComplaints: complaints }),

      setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),

      setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),

      setSelectedComplaintStatus: (status) =>
        set({ selectedComplaintStatus: status }),

      setSelectedRows: (rows) => set({ selectedRows: rows }),

      // Helper actions
      addComplaint: (complaint) =>
        set((state) => ({
          complaints: [...state.complaints, complaint],
          filteredComplaints: [...state.filteredComplaints, complaint],
        })),

      updateComplaint: (id, updates) =>
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id ? { ...complaint, ...updates } : complaint
          ),
          filteredComplaints: state.filteredComplaints.map((complaint) =>
            complaint.id === id ? { ...complaint, ...updates } : complaint
          ),
        })),

      deleteComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter(
            (complaint) => complaint.id !== id
          ),
          filteredComplaints: state.filteredComplaints.filter(
            (complaint) => complaint.id !== id
          ),
          selectedRows: new Set(
            [...state.selectedRows].filter((rowId) => rowId !== id)
          ),
        })),

      selectAllRows: () => {
        const { filteredComplaints } = get();
        const allIds = new Set(
          filteredComplaints.map((complaint) => complaint.id)
        );
        set({ selectedRows: allIds });
      },

      clearSelection: () => set({ selectedRows: new Set() }),

      toggleRowSelection: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedRows);
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
          return { selectedRows: newSelected };
        }),

      resetTable: () =>
        set({
          dateRange: undefined,
          searchTerm: '',
          sortOrder: '최근',
          complaints: [],
          filteredComplaints: [],
          isPopupOpen: false,
          selectedComplaintId: null,
          selectedComplaintStatus: null,
          selectedRows: new Set(),
        }),
    }),
    {
      name: 'complaint-table-storage', // localStorage key
      // Only persist data, not UI state
      partialize: (state) => ({
        dateRange: state.dateRange,
        searchTerm: state.searchTerm,
        sortOrder: state.sortOrder,
        complaints: state.complaints,
        filteredComplaints: state.filteredComplaints,
        selectedRows: state.selectedRows,
      }),
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (
            parsed.state?.selectedRows &&
            Array.isArray(parsed.state.selectedRows)
          ) {
            parsed.state.selectedRows = new Set(parsed.state.selectedRows);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = { ...value } as {
            state?: { selectedRows?: Set<string> | string[] };
          };
          if (
            toStore.state?.selectedRows &&
            toStore.state.selectedRows instanceof Set
          ) {
            toStore.state.selectedRows = Array.from(toStore.state.selectedRows);
          }
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
