// frontend/src/services/axiosConfig.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000,
  withCredentials: false, // ✅ No cookies needed
});

// ✅ Request Interceptor - JWT only
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🔵 [${config.method?.toUpperCase()}] ${config.url}`);
    
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`❌ [${error.config?.method?.toUpperCase()}] ${error.config?.url} - ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
    } else {
      console.error('❌ Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ No CSRF initialization needed
export const ensureCsrfReady = async () => {
  console.log('✅ Using JWT authentication - no CSRF needed');
  return Promise.resolve();
};

export default axiosInstance;