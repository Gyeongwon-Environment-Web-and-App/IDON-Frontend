// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const userData = sessionStorage.getItem("userData");
      const token = sessionStorage.getItem("userToken");

      if (userData && token) {
        if (isTokenExpired(token)) {
          logout();
          return;
        }

        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now();
      const tokenExpTime = payload.exp * 1000; // Convert to milliseconds

      // Check if token is expired (expiration time is set by server)
      return tokenExpTime < currentTime;
    } catch {
      return true;
    }
  };

  const login = (userData: {
    serial_no: number;
    token: string;
    [key: string]: unknown;
  }) => {
    // Store data
    sessionStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("serial_no", userData.serial_no.toString());
    sessionStorage.setItem("userToken", userData.token);

    // Update state immediately
    setIsAuthenticated(true);

    // Navigate after state update
    setTimeout(() => {
      navigate("/");
    }, 0);
  };

  const logout = () => {
    // 스토리지 정리
    localStorage.removeItem("userData");
    localStorage.removeItem("serial_no");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("serial_no");
    sessionStorage.removeItem("userToken");

    // 상태 업데이트
    setIsAuthenticated(false);

    // Navigate after state update
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  return { isAuthenticated, isLoading, logout, login, checkAuthStatus };
};
