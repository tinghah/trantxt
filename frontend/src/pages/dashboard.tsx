import { Header } from '../components/Common/Header';
import { RecentTranslations } from '../components/Dashboard/RecentTranslations';
import { Stats } from '../components/Dashboard/Stats';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-neutral-600">Welcome back! Here's your translation activity.</p>
        </div>

        <Stats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <RecentTranslations />
          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/upload" className="btn-primary w-full block text-center">
                Upload New Document
              </Link>
              <Link to="/history" className="btn-outline w-full block text-center">
                View Full History
              </Link>
              <Link to="/profile" className="btn-ghost w-full block text-center">
                Manage Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
