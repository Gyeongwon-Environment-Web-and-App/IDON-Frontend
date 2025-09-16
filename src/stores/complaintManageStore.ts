// stores/complaintManageStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define complaint manage state interface
interface ComplaintManageState {
  // Tab and UI state
  activeTab: 'manage' | 'register' | 'stats';
  showConfirm: boolean;
  hasUnsavedChanges: boolean;
  isPopupOpen: boolean;

  // Actions
  setActiveTab: (tab: 'manage' | 'register' | 'stats') => void;
  setShowConfirm: (show: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsPopupOpen: (isOpen: boolean) => void;

  // Helper actions
  resetUI: () => void;
  checkUnsavedChanges: (formData: {
    address?: string;
    selectedRoute?: string;
    selectedTrash?: string;
    content?: string;
    trashDetail?: string;
    phone?: string;
  }) => void;
}

// Create the complaint manage store
export const useComplaintManageStore = create<ComplaintManageState>()(
  persist(
    (set) => ({
      // Initial state
      activeTab: 'register',
      showConfirm: false,
      hasUnsavedChanges: false,
      isPopupOpen: false,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),

      setShowConfirm: (show) => set({ showConfirm: show }),

      setHasUnsavedChanges: (hasChanges) =>
        set({ hasUnsavedChanges: hasChanges }),

      setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),

      // Helper actions
      resetUI: () =>
        set({
          showConfirm: false,
          hasUnsavedChanges: false,
          isPopupOpen: false,
        }),

      checkUnsavedChanges: (formData) => {
        const hasData = !!(
          formData.address ||
          formData.selectedRoute ||
          formData.selectedTrash ||
          formData.content ||
          formData.trashDetail ||
          formData.phone
        );
        set({ hasUnsavedChanges: hasData });
      },
    }),
    {
      name: 'complaint-manage-storage', // localStorage key
      // Only persist activeTab, not UI state
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    }
  )
);
