// hooks/useAuth.ts
import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const userData = sessionStorage.getItem("userData");

      if (userData) {
        JSON.parse(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("인증 확인 오류", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

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
    
    // 로그인 페이지로 이동
    window.location.href = "/login";
  };

  return { isAuthenticated, isLoading, logout };
};
