import axios from 'axios';

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://20.200.145.224:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error);
    console.log('Error details:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      token: localStorage.getItem('userToken') ? 'exists' : 'missing',
      baseURL: error.config?.baseURL,
    });

    // Handle 401 Unauthorized - redirect to login
    // Only clear tokens and redirect if we actually have a token and get a real 401
    if (error.response?.status === 401 && localStorage.getItem('userToken')) {
      console.log(
        '401 Unauthorized - clearing tokens and redirecting to login'
      );
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('serial_no');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check server connection');
    }

    // Handle CORS errors
    if (error.code === 'ERR_CANCELED' || error.message?.includes('CORS')) {
      console.error('CORS error - check server CORS configuration');
    }

    return Promise.reject(error);
  }
);

// Utility function to get current API configuration
export const getApiConfig = () => {
  return {
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    hasToken: !!localStorage.getItem('userToken'),
    token: localStorage.getItem('userToken') ? 'exists' : 'missing',
  };
};

// Utility function to update base URL (for debugging)
export const updateApiBaseURL = (newBaseURL: string) => {
  apiClient.defaults.baseURL = newBaseURL;
  console.log('API base URL updated to:', newBaseURL);
};

export default apiClient;
