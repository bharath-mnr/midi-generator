// frontend/src/services/authService.js
import axiosInstance from './axiosConfig';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', {
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
      const response = await axiosInstance.post('/auth/signup', {
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
      console.log('🔄 Refreshing access token...');
      const response = await axiosInstance.post('/auth/refresh', {
        refreshToken
      });

      this.saveTokens(response.data);
      console.log('✅ Access token refreshed successfully');
      return response.data.token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
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
      remainingGenerations: data.remainingGenerations,
      emailVerified: data.emailVerified
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










