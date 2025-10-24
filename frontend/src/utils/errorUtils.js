// frontend/src/utils/errorUtils.js

/**
 * Extracts user-friendly error messages from API responses
 * @param {Error} error - Axios error object
 * @param {string} fallback - Fallback message if no specific error found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = 'An error occurred') => {
  // Rate limit error
  if (error?.response?.status === 429) {
    const retryAfter = error.response.data?.retryAfter || 60;
    return `Too many attempts. Please try again in ${retryAfter} seconds.`;
  }

  // Get backend message
  const backendMessage = error?.response?.data?.message;
  
  if (backendMessage) {
    // Email already exists
    if (backendMessage.includes('already exists') || backendMessage.includes('already registered')) {
      return 'This email is already registered. Try logging in instead.';
    }
    
    // Invalid credentials
    if (backendMessage.includes('Invalid email or password')) {
      return 'Invalid email or password. Please try again.';
    }
    
    // Email not verified
    if (backendMessage.includes('verify your email')) {
      return 'Please verify your email before logging in. Check your inbox!';
    }
    
    // Token expired
    if (backendMessage.includes('expired')) {
      return 'This link has expired. Please request a new one.';
    }
    
    // Token already used
    if (backendMessage.includes('already been used') || backendMessage.includes('already verified')) {
      return 'Your email is already verified! You can log in and start generating music.';
    }
    
    // Return original backend message
    return backendMessage;
  }

  // Network error
  if (error?.message === 'Network Error') {
    return 'Cannot connect to server. Please check your internet connection.';
  }

  // Timeout error
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  return fallback;
};

/**
 * Checks if error is a verification error
 */
export const isVerificationError = (error) => {
  const message = error?.response?.data?.message || error?.message || '';
  return message.includes('verify') || message.includes('verification');
};

/**
 * Checks if error indicates user is already verified
 */
export const isAlreadyVerified = (error) => {
  const message = error?.response?.data?.message || error?.message || '';
  return message.includes('already verified') || 
         message.includes('already been used');
};