import { Header } from '../../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isApproved: boolean;
  groupId?: string;
  groupName?: string;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  monthlyPageLimit: number;
  fileSizeLimitMb: number;
  concurrentUploads: number;
  tokenQuota: number;
  memberCount?: number;
}

export const UsersGroupsManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const { get, put, del } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, groupsRes] = await Promise.all([
        get('/api/admin/users'),
        get('/api/admin/groups'),
      ]);
      setUsers(usersRes || []);
      setGroups(groupsRes || []);
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await put(`/api/admin/users/${userId}/status`, { isApproved: true });
      toast.success('User approved');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleAssignGroup = async (userId: string, groupId: string) => {
    try {
      await put(`/api/admin/users/${userId}`, { groupId });
      toast.success('Group assigned');
      setAssigningUser(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign group');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await del(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await del(`/api/admin/groups/${groupId}`);
      toast.success('Group deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">User & Group Management</h1>
          <p className="text-neutral-600">Manage users, assign groups, and configure quotas</p>
        </div>

        {/* Toggle Switch */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 border-b border-neutral-200 pb-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'groups'
                  ? 'bg-blue-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Assigned Group</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userGroup = groups.find((g) => g.id === user.groupId);
                    return (
                      <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isAdmin
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {assigningUser === user.id ? (
                            <select
                              onChange={(e) => handleAssignGroup(user.id, e.target.value)}
                              className="input-base text-sm py-1"
                              defaultValue={user.groupId || ''}
                            >
                              <option value="">No Group</option>
                              {groups.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.name}
                                </option>
                              ))}
                            </select>
                          ) : userGroup ? (
                            <div>
                              <p className="font-medium text-neutral-900">{userGroup.name}</p>
                              <p className="text-xs text-neutral-500">
                                {userGroup.monthlyPageLimit} pages/month · {userGroup.tokenQuota.toLocaleString()} tokens
                              </p>
                            </div>
                          ) : (
                            <span className="text-neutral-400">No group</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {!user.isApproved && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setAssigningUser(assigningUser === user.id ? null : user.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              {assigningUser === user.id ? 'Cancel' : 'Assign Group'}
                            </button>
                            {!user.isAdmin && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-error hover:text-red-800 text-xs font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Groups Table */
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="p-4 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">{group.name}</h3>
                      <p className="text-sm text-neutral-600">{group.description}</p>
                    </div>
                    {group.name !== 'Administrators' && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-error hover:bg-error/10 p-2 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-600 text-xs mb-1">Monthly Pages</p>
                      <p className="font-bold text-neutral-900">{group.monthlyPageLimit.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-600 text-xs mb-1">File Size Limit</p>
                      <p className="font-bold text-neutral-900">{group.fileSizeLimitMb} MB</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-600 text-xs mb-1">Token Quota</p>
                      <p className="font-bold text-neutral-900">{group.tokenQuota.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-600 text-xs mb-1">Concurrent Uploads</p>
                      <p className="font-bold text-neutral-900">{group.concurrentUploads}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold">{users.filter((u) => u.groupId === group.id).length}</span> users in this group
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
