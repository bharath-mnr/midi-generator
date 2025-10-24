// frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // Request interceptor - Add token to every request
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.url.includes(API_BASE_URL)) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401/403 errors with token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request is to auth endpoints, reject immediately
        if (
          error.response?.status !== 401 || 
          originalRequest.url.includes('/auth/') ||
          originalRequest._retry
        ) {
          return Promise.reject(error);
        }

        // If we're already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshSubscribers.push((token) => {
              if (token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(axios(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          
          // Notify all queued requests
          this.refreshSubscribers.forEach(callback => callback(newToken));
          this.refreshSubscribers = [];
          
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          this.refreshSubscribers.forEach(callback => callback(null));
          this.refreshSubscribers = [];
          
          this.logout();
          window.location.href = '/';
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.token) {
        this.saveTokens(response.data);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async signup(email, password, fullName) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        fullName
      });

      if (response.data.token) {
        this.saveTokens(response.data);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('ðŸ”„ Refreshing access token...');
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });

      this.saveTokens(response.data);
      console.log('âœ… Access token refreshed successfully');
      return response.data.token;
    } catch (error) {
      console.error('âŒ Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  saveTokens(data) {
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      subscriptionTier: data.subscriptionTier,
      remainingGenerations: data.remainingGenerations
    }));
  }

  getAccessToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
  setAuthData(data) {
  this.saveTokens(data);
  }
}

export default new AuthService();