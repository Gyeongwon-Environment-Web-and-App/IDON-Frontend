// hooks/useAuth.ts
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userDataStr = sessionStorage.getItem("userData");
    if (userDataStr) {
      setUserData(JSON.parse(userDataStr));
      setIsAuthenticated(true);
    }
  }, []);

  return { userData, isAuthenticated };
};
