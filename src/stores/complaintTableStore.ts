// stores/complaintTableStore.ts
import type { DateRange } from 'react-day-picker';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { complaintService } from '../services/complaintService';
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
  selectedComplaintStatus: boolean | null;
  selectedRows: Set<number>;

  // Pagination
  currentPage: number;
  pageSize: number;

  // Actions
  setDateRange: (range: DateRange | undefined) => void;
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: '최근' | '옛') => void;
  setComplaints: (complaints: Complaint[]) => void;
  setFilteredComplaints: (complaints: Complaint[]) => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  setSelectedComplaintId: (id: string | null) => void;
  setSelectedComplaintStatus: (status: boolean | null) => void;
  setSelectedRows: (rows: Set<number>) => void;
  // Pagination Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;

  // Pagination Helper Functions
  getTotalPages: () => number;
  getPaginatedComplaints: () => Complaint[];
  getPaginationInfo: () => {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Helper actions
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: number, updates: Partial<Complaint>) => void;
  deleteComplaint: (id: number) => void;
  deleteSelectedComplaints: () => Promise<void>;
  selectAllRows: () => void;
  clearSelection: () => void;
  toggleRowSelection: (id: number) => void;
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
      // Pagination
      currentPage: 1,
      pageSize: 8,

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

      deleteSelectedComplaints: async () => {
        const { selectedRows } = get();

        if (selectedRows.size === 0) {
          console.warn('삭제할 민원 선택되지 않음');
          return;
        }

        try {
          const idsToDelete = Array.from(selectedRows);
          await complaintService.deleteComplaints(idsToDelete);

          // Remove deleted complaints from both arrays
          set((state) => ({
            complaints: state.complaints.filter(
              (complaint) => !selectedRows.has(complaint.id)
            ),
            filteredComplaints: state.filteredComplaints.filter(
              (complaint) => !selectedRows.has(complaint.id)
            ),
            selectedRows: new Set(), // Clear selection after deletion
          }));

          console.log(`Successfully deleted ${idsToDelete.length} complaints`);
        } catch (error) {
          console.error('Failed to delete complaints:', error);
          throw error; // Re-throw to allow component to handle the error
        }
      },

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
          currentPage: 1,
          pageSize: 8,
        }),

      // Pagination Actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setPageSize: (size) => set({ currentPage: 1, pageSize: size }),
      resetPagination: () => set({ currentPage: 1 }),

      // Pagination Helper Functions
      getTotalPages: () => {
        const { filteredComplaints, pageSize } = get();
        return Math.ceil(filteredComplaints.length / pageSize);
      },

      getPaginatedComplaints: () => {
        const { filteredComplaints, currentPage, pageSize } = get();
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredComplaints.slice(startIndex, endIndex);
      },

      getPaginationInfo: () => {
        const { filteredComplaints, currentPage, pageSize } = get();
        const totalItems = filteredComplaints.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);

        return {
          totalItems,
          totalPages,
          currentPage,
          startItem,
          endItem,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        };
      },
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
            parsed.state.selectedRows = new Set(
              parsed.state.selectedRows.map(Number)
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = { ...value } as {
            state?: { selectedRows?: Set<number> | number[] };
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
