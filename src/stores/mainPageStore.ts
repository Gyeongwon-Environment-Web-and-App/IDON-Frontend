// stores/mainPageStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define main page state interface
interface MainPageState {
  // Background image state
  currentImageIndex: number;
  loadedImages: Set<number>;
  isTransitioning: boolean;

  // Actions
  setCurrentImageIndex: (index: number) => void;
  setLoadedImages: (images: Set<number>) => void;
  addLoadedImage: (index: number) => void;
  setIsTransitioning: (transitioning: boolean) => void;

  // Helper actions
  nextImage: (totalImages: number) => void;
  prevImage: (totalImages: number) => void;
  resetCarousel: () => void;
}

// Create the main page store
export const useMainPageStore = create<MainPageState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentImageIndex: 0,
      loadedImages: new Set([0]),
      isTransitioning: false,

      // Actions
      setCurrentImageIndex: (index) => set({ currentImageIndex: index }),

      setLoadedImages: (images) => set({ loadedImages: images }),

      addLoadedImage: (index) =>
        set((state) => ({
          loadedImages: new Set([...state.loadedImages, index]),
        })),

      setIsTransitioning: (transitioning) =>
        set({ isTransitioning: transitioning }),

      // Helper actions
      nextImage: (totalImages) => {
        const { currentImageIndex, isTransitioning } = get();
        if (isTransitioning) return;

        set({ isTransitioning: true });
        const nextIndex = (currentImageIndex + 1) % totalImages;
        set({ currentImageIndex: nextIndex });

        // Reset transition after delay
        setTimeout(() => set({ isTransitioning: false }), 200);
      },

      prevImage: (totalImages) => {
        const { currentImageIndex, isTransitioning } = get();
        if (isTransitioning) return;

        set({ isTransitioning: true });
        const prevIndex =
          currentImageIndex === 0 ? totalImages - 1 : currentImageIndex - 1;
        set({ currentImageIndex: prevIndex });

        // Reset transition after delay
        setTimeout(() => set({ isTransitioning: false }), 200);
      },

      resetCarousel: () =>
        set({
          currentImageIndex: 0,
          loadedImages: new Set([0]),
          isTransitioning: false,
        }),
    }),
    {
      name: 'main-page-storage', // localStorage key
      // Only persist currentImageIndex and loadedImages
      partialize: (state) => ({
        currentImageIndex: state.currentImageIndex,
        loadedImages: Array.from(state.loadedImages), // Convert Set to Array for persistence
      }),
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed.state?.loadedImages) {
            parsed.state.loadedImages = new Set(parsed.state.loadedImages);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = { ...value };
          if (toStore.state?.loadedImages) {
            toStore.state.loadedImages = Array.from(toStore.state.loadedImages);
          }
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
