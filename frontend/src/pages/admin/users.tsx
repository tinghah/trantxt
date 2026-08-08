import { Header } from '../../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { AdminUser } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminUsers = () => {
  const { data: users, get, put } = useApi<AdminUser[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    get(`/api/admin/users?page=${page}&limit=20`).finally(() => setIsLoading(false));
  }, [page, get]);

  const handleApprove = async (userId: string) => {
    try {
      await put(`/api/admin/users/${userId}/approve`, {});
      get(`/api/admin/users?page=${page}&limit=20`);
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">User Management</h1>

        <div className="card">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isApproved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-neutral-500">No users found</p>
          )}
        </div>
      </main>
    </div>
  );
};
