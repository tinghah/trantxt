import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="bg-blue-900 border-b border-blue-950 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold text-lg text-white">TranTxt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className={`text-sm font-medium ${
                location.pathname === '/dashboard' ? 'text-blue-300' : 'text-blue-100 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className={`text-sm font-medium ${
                location.pathname === '/upload' ? 'text-blue-300' : 'text-blue-100 hover:text-white'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/history"
              className={`text-sm font-medium ${
                location.pathname === '/history' ? 'text-blue-300' : 'text-blue-100 hover:text-white'
              }`}
            >
              History
            </Link>
            <Link
              to="/settings"
              className={`text-sm font-medium ${
                location.pathname === '/settings' ? 'text-blue-300' : 'text-blue-100 hover:text-white'
              }`}
            >
              Settings
            </Link>
            {user?.isAdmin && (
              <Link
                to="/admin/users-groups"
                className={`text-sm font-medium ${
                  location.pathname.startsWith('/admin') ? 'text-blue-300' : 'text-blue-100 hover:text-white'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600"
              >
                {user?.name.charAt(0).toUpperCase()}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    Profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
