// // frontend/src/App.jsx
// import React, { useState, useEffect, Suspense } from 'react';
// import ChatBot from './components/ChatBot';
// import UserDashboard from './components/UserDashboard';
// import PricingPage from './components/PricingPage';
// import AuthModal from './components/AuthModal';
// import EmailVerificationPage from './components/EmailVerificationPage';
// import ResetPasswordPage from './components/ResetPasswordPage';
// import authService from './services/authService';

// // Error Boundary
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }
  
//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }
  
//   componentDidCatch(error, errorInfo) {
//     console.error('Error:', error, errorInfo);
//   }
  
//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50">
//           <div className="text-center p-8">
//             <h2 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Refresh Page
//             </button>
//           </div>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const App = () => {
//   const [currentPage, setCurrentPage] = useState('Generator');
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('signup');
//   const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
//   const [user, setUser] = useState(authService.getCurrentUser());

//   // Check auth on mount
//   useEffect(() => {
//     // Auth state is already initialized from authService
//     // Just set the current page from URL
//     const path = window.location.pathname.substring(1) || 'Generator';
//     setCurrentPage(path);
//   }, []);

//   // Handle navigation
//   useEffect(() => {
//     const handlePopState = () => {
//       const path = window.location.pathname.substring(1) || 'Generator';
//       setCurrentPage(path);
//     };
//     window.addEventListener('popstate', handlePopState);
//     return () => window.removeEventListener('popstate', handlePopState);
//   }, []);

//   // Listen for auth changes (e.g., token expiration, logout from another tab)
//   useEffect(() => {
//     const checkAuthStatus = () => {
//       const currentAuthState = authService.isAuthenticated();
//       const currentUser = authService.getCurrentUser();
      
//       if (currentAuthState !== isAuthenticated) {
//         setIsAuthenticated(currentAuthState);
//         setUser(currentUser);
        
//         // If user was logged out, redirect to Generator
//         if (!currentAuthState && currentPage !== 'Generator' && currentPage !== 'pricing') {
//           navigate('Generator');
//         }
//       }
//     };

//     // Check auth status periodically (every 30 seconds)
//     const interval = setInterval(checkAuthStatus, 30000);
    
//     // Also check on window focus (user switches back to tab)
//     window.addEventListener('focus', checkAuthStatus);
    
//     return () => {
//       clearInterval(interval);
//       window.removeEventListener('focus', checkAuthStatus);
//     };
//   }, [isAuthenticated, currentPage]);

//   const navigate = (page) => {
//     setCurrentPage(page);
//     window.history.pushState({}, '', `/${page === 'Generator' ? '' : page}`);
//     document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} - MIDI Generator`;
//   };

//   const handleAuthSuccess = (data) => {
//     // authService.login is called in AuthModal, so we just need to update state
//     setIsAuthenticated(true);
//     setUser(authService.getCurrentUser());
//     setShowAuthModal(false);
    
//     // Navigate to Generator after successful auth
//     navigate('Generator');
//   };

//   const handleLogout = () => {
//     authService.logout();
//     setIsAuthenticated(false);
//     setUser(null);
//     navigate('Generator');
//   };

//   const openAuthModal = (mode = 'signup') => {
//     setAuthMode(mode);
//     setShowAuthModal(true);
//   };

//   // Route components
//   const routes = {
//     Generator: () => (
//       <ChatBot
//         isAuthenticated={isAuthenticated}
//         user={user}
//         onOpenAuth={openAuthModal}
//         onNavigate={navigate}
//         onLogout={handleLogout}
//       />
//     ),
//     dashboard: () => (
//       isAuthenticated ? (
//         <UserDashboard
//           user={user}
//           onLogout={handleLogout}
//           onNavigate={navigate}
//         />
//       ) : (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
//             <button
//               onClick={() => openAuthModal('login')}
//               className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
//             >
//               Log In
//             </button>
//           </div>
//         </div>
//       )
//     ),
//     pricing: () => (
//       <PricingPage
//         isAuthenticated={isAuthenticated}
//         user={user}
//         onNavigate={navigate}
//         onOpenAuth={openAuthModal}
//       />
//     ),
//     // âœ… NEW: Email Verification Route
//     // 'verify-email': () => (
//     //   <EmailVerificationPage
//     //     onNavigate={navigate}
//     //   />
//     // ),

//     'verify-email': () => <EmailVerificationPage onNavigate={navigate} />,
    
//     // âœ… NEW: Reset Password Route
//     'reset-password': () => (
//       <ResetPasswordPage
//         onNavigate={navigate}
//         onSuccess={handleAuthSuccess}
//       />
//     ),
//   };

//   const RenderedComponent = routes[currentPage] || (() => (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
//         <button
//           onClick={() => navigate('Generator')}
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Go Home
//         </button>
//       </div>
//     </div>
//   ));

//   return (
//     <ErrorBoundary>
//       <Suspense
//         fallback={
//           <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//             <div className="flex flex-col items-center">
//               <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mb-4"></div>
//               <p className="text-white font-medium">Loading...</p>
//             </div>
//           </div>
//         }
//       >
//         <RenderedComponent />
//         {showAuthModal && (
//           <AuthModal
//             mode={authMode}
//             onClose={() => setShowAuthModal(false)}
//             onSuccess={handleAuthSuccess}
//             onSwitchMode={(mode) => setAuthMode(mode)}
//           />
//         )}
//       </Suspense>
//     </ErrorBoundary>
//   );
// };

// export default App;













// frontend/src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import ChatBot from './components/ChatBot';
import UserDashboard from './components/UserDashboard';
import PricingPage from './components/PricingPage';
import AuthModal from './components/AuthModal';
import EmailVerificationPage from './components/EmailVerificationPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import authService from './services/authService';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [currentPage, setCurrentPage] = useState('Generator');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());

  // Check auth on mount
  useEffect(() => {
    // Auth state is already initialized from authService
    // Just set the current page from URL
    const path = window.location.pathname.substring(1) || 'Generator';
    setCurrentPage(path);
  }, []);

  // Handle navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || 'Generator';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for auth changes (e.g., token expiration, logout from another tab)
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentAuthState = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      if (currentAuthState !== isAuthenticated) {
        setIsAuthenticated(currentAuthState);
        setUser(currentUser);
        
        // If user was logged out, redirect to Generator
        if (!currentAuthState && currentPage !== 'Generator' && currentPage !== 'pricing') {
          navigate('Generator');
        }
      } else if (currentAuthState && currentUser) {
        // ✅ FIX: Update user object even if auth state hasn't changed
        // This ensures we get updated emailVerified status
        const currentUserString = JSON.stringify(currentUser);
        const stateUserString = JSON.stringify(user);
        
        if (currentUserString !== stateUserString) {
          console.log('🔄 User data updated:', currentUser);
          setUser(currentUser);
        }
      }
    };

    // Check auth status periodically (every 30 seconds)
    const interval = setInterval(checkAuthStatus, 30000);
    
    // Also check on window focus (user switches back to tab)
    window.addEventListener('focus', checkAuthStatus);
    
    // ✅ Check immediately on mount
    checkAuthStatus();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, [isAuthenticated, currentPage, user]);

  const navigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page === 'Generator' ? '' : page}`);
    document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} - MIDI Generator`;
  };

  const handleAuthSuccess = (data) => {
    // authService.login is called in AuthModal, so we just need to update state
    const updatedUser = authService.getCurrentUser();
    setIsAuthenticated(true);
    setUser(updatedUser);
    setShowAuthModal(false);
    
    console.log('✅ Auth success - User:', updatedUser);
    
    // Navigate to Generator after successful auth
    navigate('Generator');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('Generator');
  };

  const openAuthModal = (mode = 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Route components
  const routes = {
    Generator: () => (
      <ChatBot
        isAuthenticated={isAuthenticated}
        user={user}
        onOpenAuth={openAuthModal}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    ),
    dashboard: () => (
      isAuthenticated ? (
        <UserDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Log In
            </button>
          </div>
        </div>
      )
    ),
    pricing: () => (
      <PricingPage
        isAuthenticated={isAuthenticated}
        user={user}
        onNavigate={navigate}
        onOpenAuth={openAuthModal}
      />
    ),
    'verify-email': () => <EmailVerificationPage onNavigate={navigate} />,
    'reset-password': () => (
      <ResetPasswordPage
        onNavigate={navigate}
        onSuccess={handleAuthSuccess}
      />
    ),
  };

  const RenderedComponent = routes[currentPage] || (() => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <button
          onClick={() => navigate('Generator')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    </div>
  ));

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-white font-medium">Loading...</p>
            </div>
          </div>
        }
      >
        <RenderedComponent />
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;