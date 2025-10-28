// frontend/src/services/axiosConfig.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000,
  withCredentials: true,
});

// ✅ Track CSRF initialization state
let csrfInitialized = false;
let csrfInitPromise = null;

// ✅ Helper to get CSRF token from cookie
const getCsrfToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// ✅ CSRF initialization with proper blocking
const initializeCsrf = async () => {
  try {
    console.log('🛡️ Initializing CSRF protection...');
    
    // Just call health endpoint to get CSRF cookie
    await axios.get(`${API_BASE_URL}/health`, {
      withCredentials: true,
      timeout: 5000
    });
    
    console.log('✅ Health endpoint called, CSRF cookie should be set');
    
    // Wait a bit for cookie to be set
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const token = getCsrfToken();
    if (token) {
      console.log('✅ CSRF token found:');
    } else {
      console.warn('⚠️ CSRF token not found after initialization');
    }
    
    return token;
  } catch (error) {
    console.error('❌ CSRF initialization failed:', error.message);
    return null;
  }
};

// ✅ Ensure CSRF is ready before app starts
export const ensureCsrfReady = async () => {
  if (csrfInitialized) {
    console.log('✅ CSRF already initialized');
    return;
  }
  
  // If initialization is in progress, wait for it
  if (csrfInitPromise) {
    console.log('⏳ CSRF initialization in progress, waiting...');
    await csrfInitPromise;
    return;
  }
  
  // Start initialization
  console.log('🚀 Starting CSRF initialization...');
  csrfInitPromise = initializeCsrf();
  
  try {
    await csrfInitPromise;
    csrfInitialized = true;
    console.log('✅ CSRF initialization complete');
  } catch (error) {
    console.error('❌ CSRF initialization failed:', error);
    throw error;
  } finally {
    csrfInitPromise = null;
  }
};

// ✅ Request Interceptor - SIMPLE AND RELIABLE
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🔵 [${config.method?.toUpperCase()}] ${config.url}`);
    
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (protectedMethods.includes(config.method?.toUpperCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
        console.log('🛡️ CSRF token attached to request');
      } else {
        console.warn('⚠️ No CSRF token available for protected request');
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor - Handle CSRF errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 403 errors that might be CSRF-related
    if (error.response?.status === 403 && !originalRequest._retry) {
      console.log('🔄 403 error detected, attempting CSRF token refresh...');
      originalRequest._retry = true;
      
      // Reset initialization state and refresh token
      csrfInitialized = false;
      await ensureCsrfReady();
      
      const newToken = getCsrfToken();
      if (newToken) {
        console.log('🔄 Retrying request with fresh CSRF token');
        originalRequest.headers['X-XSRF-TOKEN'] = newToken;
        return axiosInstance(originalRequest);
      } else {
        console.error('❌ Failed to obtain CSRF token after refresh');
      }
    }

    // Log error details
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

export { initializeCsrf, getCsrfToken };
export default axiosInstance;