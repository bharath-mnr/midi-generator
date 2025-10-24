// // frontend/src/Components/AuthModal.jsx
// import React, { useState } from 'react';
// import { Mail, Lock, User, AlertCircle, Loader2, X, CheckCircle, ArrowLeft } from 'lucide-react';
// import authService from '../services/authService';
// import { getErrorMessage } from '../utils/errorUtils';




// const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

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

//   const isSignup = authMode === 'signup';
//   const isLogin = authMode === 'login';
//   const isForgotPassword = authMode === 'forgot-password';
//   const isResetPassword = authMode === 'reset-password';

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError('');
//     setMessage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (isSignup) {
//       if (formData.password !== formData.confirmPassword) {
//         setError('Passwords do not match');
//         return;
//       }
//       if (formData.password.length < 6) {
//         setError('Password must be at least 6 characters');
//         return;
//       }
//     }

//     if (isResetPassword) {
//       if (formData.password !== formData.confirmPassword) {
//         setError('Passwords do not match');
//         return;
//       }
//       if (formData.password.length < 6) {
//         setError('Password must be at least 6 characters');
//         return;
//       }
//     }

//     setLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       let data;

//       if (isSignup) {
//         console.log('ðŸ“§ Attempting signup for:', formData.email);
//         data = await authService.signup(
//           formData.email,
//           formData.password,
//           formData.fullName
//         );
//         console.log('âœ… Signup response:', data);
        
//         // âœ… Show email verification message
//         setMessage('âœ… Account created! Please check your email to verify your account before generating music.');
        
//         // âœ… Wait longer before closing to let user read the message
//         setTimeout(() => {
//           onSuccess(data);
//         }, 3000);
//       } else if (isLogin) {
//         console.log('ðŸ” Attempting login for:', formData.email);
//         data = await authService.login(formData.email, formData.password);
//         console.log('âœ… Login response:', data);
        
//         // âœ… Check if email is verified
//         if (data.emailVerified === false) {
//           setMessage('âš ï¸ Please verify your email before generating music. Check your inbox!');
//           setTimeout(() => {
//             onSuccess(data);
//           }, 2000);
//         } else {
//           onSuccess(data);
//         }
//       } else if (isForgotPassword) {
//         console.log('ðŸ“§ Sending password reset for:', formData.email);
//         const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
//           method: 'POST',
//           headers: { 
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ email: formData.email })
//         });

//         console.log('ðŸ“¨ Reset response status:', response.status);

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({ 
//             message: 'Failed to send reset email' 
//           }));
//           throw new Error(errorData.message || 'Failed to send reset email');
//         }

//         const result = await response.json();
//         console.log('âœ… Reset email result:', result);
        
//         setMessage('âœ… ' + result.message + ' Check your inbox and spam folder.');
//         setFormData({ ...formData, email: '' });
//       } else if (isResetPassword) {
//         console.log('ðŸ” Resetting password with token');
//         const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
//           method: 'POST',
//           headers: { 
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             token: resetToken,
//             newPassword: formData.password,
//             confirmPassword: formData.confirmPassword
//           })
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({ 
//             message: 'Failed to reset password' 
//           }));
//           throw new Error(errorData.message || 'Failed to reset password');
//         }

//         const result = await response.json();
//         data = result;
//         setMessage('âœ… Password reset successfully! Logging you in...');
//         setTimeout(() => {
//           onSuccess(data);
//         }, 1500);
//       }
//     } catch (err) {
//       console.error('âŒ Auth error:', err);
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
//                     required
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//                     placeholder="John Doe"
//                   />
//                 </div>
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
//                     required
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//                     placeholder="you@example.com"
//                   />
//                 </div>
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
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//                     placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
//                   />
//                 </div>
//                 {(isSignup || isResetPassword) && <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>}
//               </div>
//             )}

//             {(isSignup || isResetPassword) && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
//                     placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
//                   />
//                 </div>
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
//                 <br />
//                 <span className="font-semibold text-gray-700 mt-2 block">
//                   ðŸ“§ You'll receive an email verification link after signup.
//                 </span>
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
import { Mail, Lock, User, AlertCircle, Loader2, X, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

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
  
  // ✅ Real-time validation states
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const isSignup = authMode === 'signup';
  const isLogin = authMode === 'login';
  const isForgotPassword = authMode === 'forgot-password';
  const isResetPassword = authMode === 'reset-password';

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
        
        setTimeout(() => {
          onSuccess(data);
        }, 3000);
      } else if (isLogin) {
        console.log('🔐 Attempting login for:', formData.email);
        data = await authService.login(formData.email, formData.password);
        console.log('✅ Login response:', data);
        
        if (data.emailVerified === false) {
          setMessage('⚠️ Please verify your email. Check your inbox!');
          setTimeout(() => {
            onSuccess(data);
          }, 2000);
        } else {
          onSuccess(data);
        }
      } else if (isForgotPassword) {
        console.log('📧 Sending password reset for:', formData.email);
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: 'Failed to send reset email' 
          }));
          throw new Error(errorData.message || 'Failed to send reset email');
        }

        const result = await response.json();
        setMessage('✅ ' + result.message + ' Check your inbox and spam folder.');
        setFormData({ ...formData, email: '' });
      } else if (isResetPassword) {
        console.log('🔒 Resetting password');
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            newPassword: formData.password,
            confirmPassword: formData.confirmPassword
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: 'Failed to reset password' 
          }));
          throw new Error(errorData.message || 'Failed to reset password');
        }

        const result = await response.json();
        data = result;
        setMessage('✅ Password reset successfully! Logging you in...');
        setTimeout(() => {
          onSuccess(data);
        }, 1500);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      setError(getErrorMessage(err, `${authMode === 'signup' ? 'Signup' : authMode === 'login' ? 'Login' : 'Operation'} failed. Please try again.`));
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
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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