import { Header } from '../components/Common/Header';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { UserProfile } from '../types';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user } = useAuth();
  const { data: profile, get, put } = useApi<UserProfile>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    setIsLoading(true);
    get('/api/user/profile').then((data) => {
      setFormData({ name: data.name, email: data.email });
    }).finally(() => setIsLoading(false));
  }, [get]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await put('/api/user/profile', formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Profile Settings</h1>

        <div className="card">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-200">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{profile?.name}</h2>
              <p className="text-neutral-600">{profile?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-base"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Name</p>
                <p className="font-medium text-neutral-900">{profile?.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Email</p>
                <p className="font-medium text-neutral-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Account Status</p>
                <p className="font-medium text-neutral-900">{profile?.isApproved ? 'Approved' : 'Pending Approval'}</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="btn-outline">
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="card mt-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Usage Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Translations</p>
              <p className="text-2xl font-bold text-primary-600">{profile?.totalTranslations}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Pages</p>
              <p className="text-2xl font-bold text-secondary-600">{profile?.totalPages}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
