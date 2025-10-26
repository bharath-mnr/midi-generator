// frontend/src/Components/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Lock, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';
import axiosInstance from '../services/axiosConfig'; // ✅ ADDED

const ResetPasswordPage = ({ onNavigate, onSuccess }) => {
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // ✅ FIXED: Get token from URL properly
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('token');
    
    console.log('🔐 Full URL:', window.location.href);
    console.log('🔐 Search params:', window.location.search);
    console.log('🔐 Reset token from URL:', resetToken);
    
    if (!resetToken || resetToken.trim() === '') {
      setError('Invalid reset link. No token provided.');
    } else {
      setToken(resetToken.trim());
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Sending reset request with token:', token);
      
      // ✅ UPDATED: Use axiosInstance
      const response = await axiosInstance.post('/auth/reset-password', {
        token: token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword
      });

      console.log('📨 Response status:', response.status);

      const result = response.data;
      console.log('✅ Password reset successful:', result);
      
      setSuccess(true);
      
      // Store auth data
      authService.saveTokens(result);
      
      // Call onSuccess to update auth state and navigate
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Fallback: redirect after delay
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('Generator');
          } else {
            window.location.href = '/';
          }
        }, 3000);
      }
      
    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError(getErrorMessage(err, 'Failed to reset password. The link may be expired or already used.'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking token
  if (!token && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
            <p className="text-gray-600 mb-4">Your password has been successfully reset.</p>
            <p className="text-sm text-gray-500 mb-6">Redirecting you to home page...</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Lock className="w-8 h-8 text-gray-900" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
              <p className="text-gray-600 text-sm">Enter your new password below</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter new password"
                    minLength="6"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button 
                  onClick={() => onNavigate ? onNavigate('Generator') : window.location.href = '/'}
                  className="text-gray-900 font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;