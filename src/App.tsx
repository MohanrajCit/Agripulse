import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LocationProvider } from './contexts/LocationContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { LoadingOverlay } from './components/ui/Loading';
import { Landing, Login, Signup, Dashboard, Chat, DiseaseDetection } from './pages';
import { LanguageSelection } from './pages/LanguageSelection';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Language Protection Wrapper
function LanguageRoute({ children }: { children: React.ReactNode }) {
  // Check for the key used by LanguageContext
  const language = localStorage.getItem('agripulse_language');
  const { user } = useAuth();

  if (!language && !user) {
    return <Navigate to="/language-select" replace />;
  }

  return <>{children}</>;
}

// Redirect checking
// Redirect checking
function IndexRedirect() {
  // const language = localStorage.getItem('agripulse_language');
  // We no longer block on language, as it defaults to EN or can be picked on Login/Signup
  // const { user } = useAuth(); // Don't auto-redirect logged-in users. Let them see Landing.

  // if (user) return <Navigate to="/dashboard" replace />;
  // if (!language) return <Navigate to="/language-select" replace />;

  return <Landing />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Language Selection Route (Optional, kept if needed manually) */}
      <Route path="/language-select" element={<LanguageSelection />} />

      {/* Auth Routes - No longer wrapped in LanguageRoute */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Main Layout Routes - All in one Route block */}
      <Route path="/" element={<Layout />}>
        {/* Landing/Home Page */}
        <Route index element={<IndexRedirect />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="disease-detection"
          element={
            <ProtectedRoute>
              <DiseaseDetection />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <ScrollToTop />
              <AppRoutes />
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
