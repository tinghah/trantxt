import { Header } from '../components/Common/Header';
import { RecentTranslations } from '../components/Dashboard/RecentTranslations';
import { Stats } from '../components/Dashboard/Stats';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-neutral-600">Here's your translation activity overview.</p>
        </div>
        <Stats />
        <div className="mt-8">
          <RecentTranslations />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link to="/upload" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📤</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Upload Document</p>
              <p className="text-sm text-neutral-500">Upload a new file for translation</p>
            </div>
          </Link>
          <Link to="/history" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">View History</p>
              <p className="text-sm text-neutral-500">Browse all your translations</p>
            </div>
          </Link>
          <Link to="/settings" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Settings</p>
              <p className="text-sm text-neutral-500">Manage API keys & preferences</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
