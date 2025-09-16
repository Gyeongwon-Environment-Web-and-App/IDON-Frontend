// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define user data interface
interface UserData {
  id: number;
  serial_no: string;
  phone_no: string;
  name: string;
  token: string;
}

// Define authentication state interface
interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  token: string | null;

  // Actions
  login: (userData: UserData) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now();
    const tokenExpTime = payload.exp * 1000; // Convert to milliseconds
    return tokenExpTime < currentTime;
  } catch {
    return true;
  }
};

// Create the authentication store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: true,
      userData: null,
      token: null,

      // Actions
      login: (userData: UserData) => {
        // Store data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('serial_no', userData.serial_no);
        localStorage.setItem('userToken', userData.token);

        // Update Zustand state
        set({
          isAuthenticated: true,
          userData,
          token: userData.token,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear all storage
        localStorage.removeItem('userData');
        localStorage.removeItem('serial_no');
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('serial_no');
        sessionStorage.removeItem('userToken');

        // Update Zustand state
        set({
          isAuthenticated: false,
          userData: null,
          token: null,
          isLoading: false,
        });
      },

      checkAuthStatus: () => {
        try {
          const userData = localStorage.getItem('userData');
          const token = localStorage.getItem('userToken');

          if (userData && token) {
            if (isTokenExpired(token)) {
              get().logout();
              return;
            }

            const parsedUserData = JSON.parse(userData);
            set({
              isAuthenticated: true,
              userData: parsedUserData,
              token,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              userData: null,
              token: null,
              isLoading: false,
            });
          }
        } catch {
          set({
            isAuthenticated: false,
            userData: null,
            token: null,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist authentication state, not loading state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userData: state.userData,
        token: state.token,
      }),
    }
  )
);
