// frontend/src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import ChatBot from './components/ChatBot';
import UserDashboard from './components/UserDashboard';
import PricingPage from './components/PricingPage';
import AuthModal from './components/AuthModal';
import EmailVerificationPage from './components/EmailVerificationPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import authService from './services/authService';
import { ensureCsrfReady } from './services/axiosConfig';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Reload Page
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
  const [appReady, setAppReady] = useState(false);

  // ✅ CRITICAL: Initialize CSRF before app renders
  useEffect(() => {
    const initializeApp = async () => {
      try {
        
        // Block app startup until CSRF is ready
        await ensureCsrfReady();
        
        setAppReady(true);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Still allow app to render, but warn user
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const path = window.location.pathname.substring(1) || 'Generator';
    setCurrentPage(path);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || 'Generator';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const currentAuthState = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      if (currentAuthState !== isAuthenticated) {
        setIsAuthenticated(currentAuthState);
        setUser(currentUser);
        
        if (!currentAuthState && currentPage !== 'Generator' && currentPage !== 'pricing') {
          navigate('Generator');
        }
      } else if (currentAuthState && currentUser) {
        const currentUserString = JSON.stringify(currentUser);
        const stateUserString = JSON.stringify(user);
        
        if (currentUserString !== stateUserString) {
          setUser(currentUser);
        }
      }
    };

    const interval = setInterval(checkAuthStatus, 30000);
    window.addEventListener('focus', checkAuthStatus);
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
    const updatedUser = authService.getCurrentUser();
    setIsAuthenticated(true);
    setUser(updatedUser);
    setShowAuthModal(false);
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

  // ✅ Show loading screen until CSRF is ready
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mb-4"></div>
          <p className="text-white font-medium">Initializing security...</p>
        </div>
      </div>
    );
  }

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