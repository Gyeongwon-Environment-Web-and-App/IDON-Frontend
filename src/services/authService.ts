import apiClient from "../lib/api";
import axios from "axios";

// Type definitions for API responses
export interface User {
  id: number;
  serial_no: string;
  phone_no: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginResult {
  success: boolean;
  data?: User & {
    token: string;
  };
  message?: string;
}

// Auth service with typed API calls
export const authService = {
  /**
   * Login with serial number
   * @param serialNo - The serial number to login with
   * @returns Promise with login result
   */
  login: async (serialNo: number): Promise<LoginResult> => {
    try {
      const response = await apiClient.get<LoginResponse>(
        `/user/login/${serialNo}`
      );

      if (response.status === 200) {
        const { message, user, token } = response.data;
        console.log(`Login message: ${message}`);

        // Combine user data with token
        const userData = {
          ...user,
          token: token,
        };

        return {
          success: true,
          data: userData,
        };
      }

      return {
        success: false,
        message: "Unexpected response status",
      };
    } catch (error) {
      console.error("Login failed:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: "존재하지 않는 시리얼 번호입니다.",
          };
        } else if (error.response?.status === 400) {
          return {
            success: false,
            message: "잘못된 요청입니다.",
          };
        } else if (error.response?.status === 500) {
          return {
            success: false,
            message: "서버 오류가 발생했습니다.",
          };
        }
      }

      return {
        success: false,
        message: "로그인 중 오류가 발생했습니다.",
      };
    }
  },

  /**
   * Logout user (clear local storage)
   */
  logout: () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("serial_no");
    localStorage.removeItem("userToken");
  },

  /**
   * Get current user data from localStorage
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("userToken");
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem("userToken");
  }
};
