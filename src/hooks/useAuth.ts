// hooks/useAuth.ts
import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const navigate = useNavigate();

  // Get state and actions from Zustand store
  const {
    isAuthenticated,
    isLoading,
    userData,
    token,
    login: storeLogin,
    logout: storeLogout,
    checkAuthStatus,
    setLoading,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Enhanced login function with navigation
  const login = (userData: {
    id: number;
    serial_no: string;
    phone_no: string;
    name: string;
    token: string;
  }) => {
    storeLogin(userData);

    // Navigate after state update
    setTimeout(() => {
      navigate('/');
    }, 0);
  };

  // Enhanced logout function with navigation
  const logout = () => {
    storeLogout();

    // Navigate after state update
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  return {
    isAuthenticated,
    isLoading,
    userData,
    token,
    logout,
    login,
    checkAuthStatus,
    setLoading,
  };
};
