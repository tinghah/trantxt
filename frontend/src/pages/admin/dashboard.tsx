import { Header } from '../../components/Common/Header';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { AdminStats } from '../../types';

export const AdminDashboard = () => {
  const { data: stats, get } = useApi<AdminStats>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    get('/api/admin/analytics/dashboard').finally(() => setIsLoading(false));
  }, [get]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">Loading...</main>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'primary' },
    { label: 'Total Groups', value: stats?.totalGroups || 0, color: 'secondary' },
    { label: 'Total Documents', value: stats?.totalDocuments || 0, color: 'info' },
    { label: 'Active Users', value: stats?.activeUsers || 0, color: 'success' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">System analytics and overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="card">
              <p className="text-neutral-600 text-sm mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color === 'primary' ? 'text-primary-600' : stat.color === 'secondary' ? 'text-secondary-600' : stat.color === 'success' ? 'text-success' : 'text-info'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Translation Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Translations</span>
                <span className="font-bold">{stats?.totalTranslations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Pages Processed</span>
                <span className="font-bold">{stats?.pagesProcessed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tokens Used</span>
                <span className="font-bold">{stats?.tokensUsed || 0}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/admin/users" className="block btn-outline w-full text-center">
                Manage Users
              </Link>
              <Link to="/admin/groups" className="block btn-outline w-full text-center">
                Manage Groups
              </Link>
              <Link to="/admin/translations" className="block btn-outline w-full text-center">
                Review Translations
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
