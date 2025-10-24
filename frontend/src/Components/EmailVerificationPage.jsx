// // frontend/src/Components/EmailVerificationPage.jsx
// import React, { useState, useEffect } from 'react';
// import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import axios from 'axios';
// import { getErrorMessage } from '../utils/errorUtils';



// const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

// const EmailVerificationPage = ({ onNavigate }) => {
//   const [status, setStatus] = useState('loading');
//   const [message, setMessage] = useState('');
//   const [email, setEmail] = useState('');

//   useEffect(() => {
//     const verifyEmail = async () => {
//       // Extract token from URL
//       const urlParams = new URLSearchParams(window.location.search);
//       const token = urlParams.get('token');

//       console.log('ðŸ” Full URL:', window.location.href);
//       console.log('ðŸ” Search params:', window.location.search);
//       console.log('ðŸ” Token extracted:', token);

//       if (!token || token.trim() === '') {
//         console.error('âŒ No token in URL');
//         setStatus('error');
//         setMessage('Invalid verification link. No token found in URL.');
//         return;
//       }

//       try {
//         console.log('ðŸ“¤ Sending verification request...');
//         const response = await axios.post(
//           `${API_BASE_URL}/auth/verify-email`,
//           { token: token.trim() },
//           {
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         console.log('âœ… Response:', response.data);

//         if (response.data.verified === true) {
//           setStatus('success');
//           setMessage(response.data.message || 'Email verified successfully!');
//           setEmail(response.data.email || '');

//           // Redirect after 3 seconds
//           setTimeout(() => {
//             if (onNavigate) {
//               onNavigate('Generator');
//             } else {
//               window.location.href = '/';
//             }
//           }, 3000);
//         } else {
//           setStatus('error');
//           setMessage(response.data.message || 'Verification failed');
//         }
//       } catch (error) {
//         console.error('âŒ Verification error:', error);
//         setStatus('error');
//         setMessage(getErrorMessage(error, 'Email verification failed. The link may be expired or invalid.'));
//       }
//     };

//     verifyEmail();
//   }, [onNavigate]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
//         {status === 'loading' && (
//           <div className="text-center">
//             <div className="flex justify-center mb-6">
//               <Loader2 className="w-16 h-16 text-gray-900 animate-spin" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
//             <p className="text-gray-600">Please wait while we verify your email address...</p>
//           </div>
//         )}

//         {status === 'success' && (
//           <div className="text-center">
//             <div className="flex justify-center mb-6">
//               <div className="bg-green-100 p-4 rounded-full">
//                 <CheckCircle className="w-16 h-16 text-green-600" />
//               </div>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
//             <p className="text-gray-600 mb-4">{message}</p>
//             {email && <p className="text-sm text-gray-500 mb-6">Email: {email}</p>}
//             <p className="text-sm text-gray-600">Redirecting you in 3 seconds...</p>
//           </div>
//         )}

//         {status === 'error' && (
//           <div className="text-center">
//             <div className="flex justify-center mb-6">
//               <div className="bg-red-100 p-4 rounded-full">
//                 <AlertCircle className="w-16 h-16 text-red-600" />
//               </div>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
//             <p className="text-gray-600 mb-6">{message}</p>
//             <button
//               onClick={() => onNavigate ? onNavigate('Generator') : window.location.href = '/'}
//               className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
//             >
//               Back to Home
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmailVerificationPage;
















// frontend/src/Components/EmailVerificationPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getErrorMessage } from '../utils/errorUtils';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

const EmailVerificationPage = ({ onNavigate }) => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  
  // Prevent double execution with ref
  const hasVerified = useRef(false);

  useEffect(() => {
    // Skip if already verified
    if (hasVerified.current) {
      console.log('⏭️ Verification already attempted, skipping...');
      return;
    }

    const verifyEmail = async () => {
      // Mark as verified immediately
      hasVerified.current = true;

      // Extract token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      console.log('🔍 Full URL:', window.location.href);
      console.log('🔍 Search params:', window.location.search);
      console.log('🔍 Token extracted:', token);

      if (!token || token.trim() === '') {
        console.error('❌ No token in URL');
        setStatus('error');
        setMessage('Invalid verification link. No token found in URL.');
        return;
      }

      try {
        console.log('📤 Sending verification request...');
        const response = await axios.post(
          `${API_BASE_URL}/auth/verify-email`,
          { token: token.trim() },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Response:', response.data);

        if (response.data.verified === true) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
          setEmail(response.data.email || '');

          // Redirect after 3 seconds
          setTimeout(() => {
            if (onNavigate) {
              onNavigate('Generator');
            } else {
              window.location.href = '/';
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        
        // Better error handling for "already used" case
        const errorMsg = error.response?.data?.message || error.message;
        
        if (errorMsg.includes('already been used') || errorMsg.includes('already verified')) {
          setStatus('success');
          setMessage('Email already verified! Redirecting...');
          setTimeout(() => {
            if (onNavigate) {
              onNavigate('Generator');
            } else {
              window.location.href = '/';
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(getErrorMessage(error, 'Email verification failed. The link may be expired or invalid.'));
        }
      }
    };

    verifyEmail();
  }, [onNavigate]); // Only run once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-gray-900 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            {email && <p className="text-sm text-gray-500 mb-6">Email: {email}</p>}
            <p className="text-sm text-gray-600">Redirecting you in a moment...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => onNavigate ? onNavigate('Generator') : window.location.href = '/'}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;