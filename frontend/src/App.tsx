import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toast } from './components/Common/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect } from 'react';

// Pages
import { Index } from './pages/index';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { ResetPassword } from './components/Auth/ResetPassword';
import { Dashboard } from './pages/dashboard';
import { Upload } from './pages/upload';
import { History } from './pages/history';
import { TranslationDetail } from './pages/translations/detail';
import { Profile } from './pages/profile';
import { Settings } from './pages/settings';
import { AdminDashboard } from './pages/admin/dashboard';
import { AdminTranslations } from './pages/admin/translations';
import { UsersGroupsManagement } from './pages/admin/users-groups';

// Protected Route Component
const ProtectedRoute = ({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Try to load user from token on app load
    if (isAuthenticated && !user) {
      // Could fetch user profile here if needed
    }
  }, [isAuthenticated, user]);

  return (
    <ThemeProvider>
      <Toast />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
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
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/translations/:id"
            element={
              <ProtectedRoute>
                <TranslationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin>
                <UsersGroupsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute isAdmin>
                <UsersGroupsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users-groups"
            element={
              <ProtectedRoute isAdmin>
                <UsersGroupsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/translations"
            element={
              <ProtectedRoute isAdmin>
                <AdminTranslations />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
