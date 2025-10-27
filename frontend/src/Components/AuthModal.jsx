// // frontend/src/Components/AuthModal.jsx
// import React, { useState } from 'react';
// import { Mail, Lock, User, AlertCircle, Loader2, X, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
// import authService from '../services/authService';
// import { getErrorMessage } from '../utils/errorUtils';
// import axiosInstance from '../services/axiosConfig'; // ✅ ADDED

// // ❌ REMOVED: const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

// const AuthModal = ({ mode, onClose, onSuccess, onSwitchMode }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     fullName: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [authMode, setAuthMode] = useState(mode);
//   const [resetToken, setResetToken] = useState('');
//   const [message, setMessage] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
//   // ✅ Real-time validation states
//   const [touched, setTouched] = useState({});
//   const [validationErrors, setValidationErrors] = useState({});

//   const isSignup = authMode === 'signup';
//   const isLogin = authMode === 'login';
//   const isForgotPassword = authMode === 'forgot-password';
//   const isResetPassword = authMode === 'reset-password';

//   // ✅ Validation functions
//   const validateEmail = (email) => {
//     if (!email) return 'Email is required';
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return 'Invalid email format';
//     return '';
//   };

//   const validatePassword = (password) => {
//     if (!password) return 'Password is required';
//     if (password.length < 8) return 'At least 8 characters';
//     if (!/[A-Z]/.test(password)) return 'At least one uppercase letter';
//     if (!/[a-z]/.test(password)) return 'At least one lowercase letter';
//     if (!/[0-9]/.test(password)) return 'At least one number';
//     if (!/[@#$%^&+=!]/.test(password)) return 'At least one symbol (@#$%^&+=!)';
//     return '';
//   };

//   const validateFullName = (name) => {
//     if (!name) return 'Full name is required';
//     if (name.trim().length < 2) return 'At least 2 characters';
//     if (name.trim().length > 50) return 'Maximum 50 characters';
//     return '';
//   };

//   const validateConfirmPassword = (password, confirmPassword) => {
//     if (!confirmPassword) return 'Please confirm password';
//     if (password !== confirmPassword) return 'Passwords do not match';
//     return '';
//   };

//   // ✅ Handle blur - show validation errors
//   const handleBlur = (field) => {
//     setTouched({ ...touched, [field]: true });
    
//     const errors = { ...validationErrors };
    
//     if (field === 'email') {
//       errors.email = validateEmail(formData.email);
//     } else if (field === 'password') {
//       errors.password = validatePassword(formData.password);
//     } else if (field === 'fullName') {
//       errors.fullName = validateFullName(formData.fullName);
//     } else if (field === 'confirmPassword') {
//       errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
//     }
    
//     setValidationErrors(errors);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     setError('');
//     setMessage('');
    
//     // ✅ Clear validation error when user starts typing
//     if (touched[name]) {
//       const errors = { ...validationErrors };
//       delete errors[name];
//       setValidationErrors(errors);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // ✅ Validate all fields before submit
//     if (isSignup) {
//       const errors = {
//         email: validateEmail(formData.email),
//         password: validatePassword(formData.password),
//         fullName: validateFullName(formData.fullName),
//         confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword)
//       };
      
//       const hasErrors = Object.values(errors).some(err => err !== '');
//       if (hasErrors) {
//         setValidationErrors(errors);
//         setTouched({ email: true, password: true, fullName: true, confirmPassword: true });
//         return;
//       }
//     }

//     if (isResetPassword) {
//       const passwordError = validatePassword(formData.password);
//       const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
      
//       if (passwordError || confirmError) {
//         setValidationErrors({ password: passwordError, confirmPassword: confirmError });
//         setTouched({ password: true, confirmPassword: true });
//         return;
//       }
//     }

//     if (isLogin && !formData.email) {
//       setError('Please enter your email');
//       return;
//     }

//     if (isLogin && !formData.password) {
//       setError('Please enter your password');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       let data;

//       if (isSignup) {
//         console.log('📝 Attempting signup for:', formData.email);
//         data = await authService.signup(
//           formData.email,
//           formData.password,
//           formData.fullName
//         );
//         console.log('✅ Signup response:', data);
        
//         setMessage('✅ Account created! Please check your email to verify before generating music.');
        
//         setTimeout(() => {
//           onSuccess(data);
//         }, 3000);
//       } else if (isLogin) {
//         console.log('🔐 Attempting login for:', formData.email);
//         data = await authService.login(formData.email, formData.password);
//         console.log('✅ Login response:', data);
        
//         if (data.emailVerified === false) {
//           setMessage('⚠️ Please verify your email. Check your inbox!');
//           setTimeout(() => {
//             onSuccess(data);
//           }, 2000);
//         } else {
//           onSuccess(data);
//         }
//       } else if (isForgotPassword) {
//         console.log('📧 Sending password reset for:', formData.email);
//         // ✅ UPDATED: Use axiosInstance
//         const response = await axiosInstance.post('/auth/forgot-password', {
//           email: formData.email
//         });

//         const result = response.data;
//         setMessage('✅ ' + result.message + ' Check your inbox and spam folder.');
//         setFormData({ ...formData, email: '' });
//       } else if (isResetPassword) {
//         console.log('🔒 Resetting password');
//         // ✅ UPDATED: Use axiosInstance
//         const response = await axiosInstance.post('/auth/reset-password', {
//           token: resetToken,
//           newPassword: formData.password,
//           confirmPassword: formData.confirmPassword
//         });

//         const result = response.data;
//         data = result;
//         setMessage('✅ Password reset successfully! Logging you in...');
//         setTimeout(() => {
//           onSuccess(data);
//         }, 1500);
//       }
//     } catch (err) {
//       console.error('❌ Auth error:', err);
//       setError(getErrorMessage(err, `${authMode === 'signup' ? 'Signup' : authMode === 'login' ? 'Login' : 'Operation'} failed. Please try again.`));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getTitle = () => {
//     switch (authMode) {
//       case 'signup': return 'Create Account';
//       case 'login': return 'Welcome Back';
//       case 'forgot-password': return 'Reset Password';
//       case 'reset-password': return 'Create New Password';
//       default: return 'Auth';
//     }
//   };

//   const switchMode = (newMode) => {
//     setAuthMode(newMode);
//     setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
//     setError('');
//     setMessage('');
//     setResetToken('');
//     setTouched({});
//     setValidationErrors({});
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {(isForgotPassword || isResetPassword) && (
//               <button
//                 onClick={() => switchMode('login')}
//                 className="p-1 hover:bg-gray-100 rounded transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
//             )}
//             <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <X className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>

//         <div className="p-6">
//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}

//           {message && (
//             <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
//               <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-green-800">{message}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {isSignup && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('fullName')}
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
//                       touched.fullName && validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Your Name"
//                   />
//                 </div>
//                 {touched.fullName && validationErrors.fullName && (
//                   <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>
//                 )}
//               </div>
//             )}

//             {!isResetPassword && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('email')}
//                     className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
//                       touched.email && validationErrors.email ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 {touched.email && validationErrors.email && (
//                   <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
//                 )}
//               </div>
//             )}

//             {!isForgotPassword && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   {isResetPassword ? 'New Password' : 'Password'}
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('password')}
//                     className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
//                       touched.password && validationErrors.password ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {touched.password && validationErrors.password && (
//                   <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
//                 )}
//                 {(isSignup || isResetPassword) && !validationErrors.password && (
//                   <p className="mt-1 text-xs text-gray-500">
//                     Min 8 chars, uppercase, lowercase, number, symbol
//                   </p>
//                 )}
//               </div>
//             )}

//             {(isSignup || isResetPassword) && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('confirmPassword')}
//                     className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
//                       touched.confirmPassword && validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {touched.confirmPassword && validationErrors.confirmPassword && (
//                   <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
//                 )}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Processing...</span>
//                 </>
//               ) : (
//                 <span>
//                   {isSignup ? 'Create Account' : 
//                    isLogin ? 'Log In' : 
//                    isForgotPassword ? 'Send Reset Link' : 
//                    'Reset Password'}
//                 </span>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             {isForgotPassword ? (
//               <p className="text-gray-600">
//                 Remember your password?{' '}
//                 <button
//                   onClick={() => switchMode('login')}
//                   className="text-gray-900 font-semibold hover:underline"
//                 >
//                   Log In
//                 </button>
//               </p>
//             ) : isSignup ? (
//               <p className="text-gray-600">
//                 Already have an account?{' '}
//                 <button
//                   onClick={() => switchMode('login')}
//                   className="text-gray-900 font-semibold hover:underline"
//                 >
//                   Log In
//                 </button>
//               </p>
//             ) : isLogin && !isResetPassword ? (
//               <>
//                 <p className="text-gray-600 mb-3">
//                   Don't have an account?{' '}
//                   <button
//                     onClick={() => switchMode('signup')}
//                     className="text-gray-900 font-semibold hover:underline"
//                   >
//                     Sign Up
//                   </button>
//                 </p>
//                 <button
//                   onClick={() => switchMode('forgot-password')}
//                   className="text-sm text-gray-600 hover:text-gray-900 underline"
//                 >
//                   Forgot your password?
//                 </button>
//               </>
//             ) : null}
//           </div>

//           {isSignup && (
//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <p className="text-xs text-gray-500 text-center">
//                 By signing up, you agree to our Terms of Service and Privacy Policy.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;



















// frontend/src/Components/AuthModal.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, X, CheckCircle, ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';
import axiosInstance from '../services/axiosConfig';

const AuthModal = ({ mode, onClose, onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState(mode);
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ✅ Resend email states
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // ✅ Real-time validation states
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const isSignup = authMode === 'signup';
  const isLogin = authMode === 'login';
  const isForgotPassword = authMode === 'forgot-password';
  const isResetPassword = authMode === 'reset-password';

  // ✅ Resend verification email
  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setResendingEmail(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axiosInstance.post('/auth/resend-verification', {
        email: formData.email
      });
      
      if (response.data.success) {
        setMessage('✅ ' + response.data.message);
        setShowResendOption(false);
      } else {
        setError(response.data.message || 'Failed to send verification email');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend verification email'));
    } finally {
      setResendingEmail(false);
    }
  };

  // ✅ Validation functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'At least 8 characters';
    if (!/[A-Z]/.test(password)) return 'At least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'At least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'At least one number';
    if (!/[@#$%^&+=!]/.test(password)) return 'At least one symbol (@#$%^&+=!)';
    return '';
  };

  const validateFullName = (name) => {
    if (!name) return 'Full name is required';
    if (name.trim().length < 2) return 'At least 2 characters';
    if (name.trim().length > 50) return 'Maximum 50 characters';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  // ✅ Handle blur - show validation errors
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    const errors = { ...validationErrors };
    
    if (field === 'email') {
      errors.email = validateEmail(formData.email);
    } else if (field === 'password') {
      errors.password = validatePassword(formData.password);
    } else if (field === 'fullName') {
      errors.fullName = validateFullName(formData.fullName);
    } else if (field === 'confirmPassword') {
      errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    }
    
    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setMessage('');
    
    // ✅ Clear validation error when user starts typing
    if (touched[name]) {
      const errors = { ...validationErrors };
      delete errors[name];
      setValidationErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate all fields before submit
    if (isSignup) {
      const errors = {
        email: validateEmail(formData.email),
        password: validatePassword(formData.password),
        fullName: validateFullName(formData.fullName),
        confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword)
      };
      
      const hasErrors = Object.values(errors).some(err => err !== '');
      if (hasErrors) {
        setValidationErrors(errors);
        setTouched({ email: true, password: true, fullName: true, confirmPassword: true });
        return;
      }
    }

    if (isResetPassword) {
      const passwordError = validatePassword(formData.password);
      const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
      
      if (passwordError || confirmError) {
        setValidationErrors({ password: passwordError, confirmPassword: confirmError });
        setTouched({ password: true, confirmPassword: true });
        return;
      }
    }

    if (isLogin && !formData.email) {
      setError('Please enter your email');
      return;
    }

    if (isLogin && !formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setShowResendOption(false);

    try {
      let data;

      if (isSignup) {
        console.log('📝 Attempting signup for:', formData.email);
        data = await authService.signup(
          formData.email,
          formData.password,
          formData.fullName
        );
        console.log('✅ Signup response:', data);
        
        setMessage('✅ Account created! Please check your email to verify before generating music.');
        setShowResendOption(true); // Show resend option after signup
        
        setTimeout(() => {
          onSuccess(data);
        }, 3000);
      } else if (isLogin) {
        console.log('🔐 Attempting login for:', formData.email);
        data = await authService.login(formData.email, formData.password);
        console.log('✅ Login response:', data);
        
        if (data.emailVerified === false) {
          setMessage('⚠️ Please verify your email. Check your inbox!');
          setShowResendOption(true); // Show resend option for unverified users
          setTimeout(() => {
            onSuccess(data);
          }, 2000);
        } else {
          onSuccess(data);
        }
      } else if (isForgotPassword) {
        console.log('📧 Sending password reset for:', formData.email);
        const response = await axiosInstance.post('/auth/forgot-password', {
          email: formData.email
        });

        const result = response.data;
        setMessage('✅ ' + result.message + ' Check your inbox and spam folder.');
        setFormData({ ...formData, email: '' });
      } else if (isResetPassword) {
        console.log('🔒 Resetting password');
        const response = await axiosInstance.post('/auth/reset-password', {
          token: resetToken,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword
        });

        const result = response.data;
        data = result;
        setMessage('✅ Password reset successfully! Logging you in...');
        setTimeout(() => {
          onSuccess(data);
        }, 1500);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      const errorMsg = getErrorMessage(err, `${authMode === 'signup' ? 'Signup' : authMode === 'login' ? 'Login' : 'Operation'} failed. Please try again.`);
      setError(errorMsg);
      
      // ✅ Show resend option if verification-related error
      if (errorMsg.includes('verify') || errorMsg.includes('verification')) {
        setShowResendOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return 'Create Account';
      case 'login': return 'Welcome Back';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Create New Password';
      default: return 'Auth';
    }
  };

  const switchMode = (newMode) => {
    setAuthMode(newMode);
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
    setError('');
    setMessage('');
    setResetToken('');
    setTouched({});
    setValidationErrors({});
    setShowResendOption(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(isForgotPassword || isResetPassword) && (
              <button
                onClick={() => switchMode('login')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {/* ✅ Resend Verification Option */}
          {showResendOption && formData.email && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Didn't receive the email?
                    </p>
                    <p className="text-xs text-blue-700">
                      Check your spam folder or request a new verification email
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('fullName')}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      touched.fullName && validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your Name"
                  />
                </div>
                {touched.fullName && validationErrors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>
                )}
              </div>
            )}

            {/* Email Field (All except reset password) */}
            {!isResetPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      touched.email && validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {touched.email && validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                )}
              </div>
            )}

            {/* Password Field (All except forgot password) */}
            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isResetPassword ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      touched.password && validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.password && validationErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
                )}
                {(isSignup || isResetPassword) && !validationErrors.password && (
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, uppercase, lowercase, number, symbol
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field (Signup and reset password) */}
            {(isSignup || isResetPassword) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      touched.confirmPassword && validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.confirmPassword && validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {isSignup ? 'Create Account' : 
                   isLogin ? 'Log In' : 
                   isForgotPassword ? 'Send Reset Link' : 
                   'Reset Password'}
                </span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <p className="text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-gray-900 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            ) : isSignup ? (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-gray-900 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            ) : isLogin && !isResetPassword ? (
              <>
                <p className="text-gray-600 mb-3">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-gray-900 font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
                <button
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Forgot your password?
                </button>
              </>
            ) : null}
          </div>

          {/* Terms Notice (Signup only) */}
          {isSignup && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;