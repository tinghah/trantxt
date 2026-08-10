import { Header } from '../../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { UserGroup } from '../../types';

export const AdminGroups = () => {
  const { data: groups, get, post } = useApi<UserGroup[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPageLimit: 100,
    fileSizeLimitMb: 50,
    concurrentUploads: 5,
    tokenQuota: 10000,
  });

  useEffect(() => {
    setIsLoading(true);
    get('/api/admin/groups').finally(() => setIsLoading(false));
  }, [get]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/api/admin/groups', formData);
      setFormData({
        name: '',
        description: '',
        monthlyPageLimit: 100,
        fileSizeLimitMb: 50,
        concurrentUploads: 5,
        tokenQuota: 10000,
      });
      setIsCreating(false);
      get('/api/admin/groups');
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Group Management</h1>
          <button onClick={() => setIsCreating(!isCreating)} className="btn-primary">
            {isCreating ? 'Cancel' : 'Create Group'}
          </button>
        </div>

        {isCreating && (
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Page Limit</label>
                  <input
                    type="number"
                    value={formData.monthlyPageLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyPageLimit: parseInt(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">File Size Limit (MB)</label>
                  <input
                    type="number"
                    value={formData.fileSizeLimitMb}
                    onChange={(e) => setFormData({ ...formData, fileSizeLimitMb: parseInt(e.target.value) })}
                    className="input-base"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Create Group
              </button>
            </form>
          </div>
        )}

        <div className="card">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-neutral-900">{group.name}</h3>
                      <p className="text-sm text-neutral-600">{group.description}</p>
                    </div>
                    <span className="text-sm bg-primary-100 text-primary-600 px-3 py-1 rounded-full">
                      {group.memberCount || 0} members
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Page Limit</p>
                      <p className="font-medium">{group.monthlyPageLimit}/month</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">File Size</p>
                      <p className="font-medium">{group.fileSizeLimitMb}MB</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Concurrent</p>
                      <p className="font-medium">{group.concurrentUploads}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Token Quota</p>
                      <p className="font-medium">{group.tokenQuota.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No groups found</p>
          )}
        </div>
      </main>
    </div>
  );
};
