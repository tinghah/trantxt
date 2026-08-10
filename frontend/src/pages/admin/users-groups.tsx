import { useState, useEffect, useCallback } from 'react';
import { Header } from '../../components/Common/Header';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isApproved: boolean;
  groupId?: string;
  group?: { id: string; name: string };
  createdAt: string;
  lastLogin?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  monthlyPageLimit: number;
  fileSizeLimitMb: number;
  concurrentUploads: number;
  tokenQuota: number;
  translationApisAllowed: string[];
  createdAt: string;
  memberCount?: number;
}

// Confirmation Dialog
const ConfirmDialog = ({
  open, title, message, onConfirm, onCancel, danger,
}: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const UsersGroupsManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const { get, put, del, post } = useApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Promote/demote dialog
  const [confirmAction, setConfirmAction] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Group detail view
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editForm, setEditForm] = useState<Partial<Group>>({});

  // Create group form
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', monthlyPageLimit: 100, fileSizeLimitMb: 50, concurrentUploads: 5, tokenQuota: 10000 });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await get('/api/admin/users?limit=100');
      setUsers(Array.isArray(res) ? res : []);
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await get('/api/admin/groups');
      setGroups(Array.isArray(res) ? res : []);
    } catch { setGroups([]); }
    setLoading(false);
  }, []);

  useEffect(() => { if (activeTab === 'users') loadUsers(); else loadGroups(); }, [activeTab]);

  const handleApprove = async (userId: string) => {
    try {
      await put(`/api/admin/users/${userId}/status`, { isApproved: true });
      toast.success('User approved');
      loadUsers();
    } catch { toast.error('Failed to approve user'); }
  };

  const handleAssignGroup = async (userId: string, groupId: string) => {
    try {
      await put(`/api/admin/users/${userId}/group`, { groupId });
      toast.success('Group assigned');
      loadUsers();
    } catch { toast.error('Failed to assign group'); }
  };

  const handlePromote = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Promote to Admin',
      message: `Are you sure you want to promote "${user.name}" to admin? They will have full admin access.`,
      danger: false,
      onConfirm: async () => {
        try {
          await put(`/api/admin/users/${user.id}/promote`, {});
          toast.success(`${user.name} promoted to admin`);
          setConfirmAction({ ...confirmAction, open: false });
          loadUsers();
        } catch { toast.error('Failed to promote user'); }
      },
    });
  };

  const handleDemote = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Demote Admin',
      message: `Are you sure you want to demote "${user.name}" to regular user?`,
      danger: true,
      onConfirm: async () => {
        try {
          await put(`/api/admin/users/${user.id}/demote`, {});
          toast.success(`${user.name} demoted to regular user`);
          setConfirmAction({ ...confirmAction, open: false });
          loadUsers();
        } catch { toast.error('Failed to demote user'); }
      },
    });
  };

  const handleDeleteUser = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await del(`/api/admin/users/${user.id}`);
          toast.success('User deleted');
          setConfirmAction({ ...confirmAction, open: false });
          loadUsers();
        } catch { toast.error('Failed to delete user'); }
      },
    });
  };

  const handleDeleteGroup = (group: Group) => {
    setConfirmAction({
      open: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? Members will be moved to the default Users group.`,
      danger: true,
      onConfirm: async () => {
        try {
          await del(`/api/admin/groups/${group.id}`);
          toast.success('Group deleted');
          setConfirmAction({ ...confirmAction, open: false });
          setSelectedGroup(null);
          loadGroups();
        } catch { toast.error('Failed to delete group'); }
      },
    });
  };

  const openGroupDetail = async (group: Group) => {
    setSelectedGroup(group);
    try {
      const res: any = await get(`/api/admin/groups/${group.id}/members`);
      const members = res?.members || (Array.isArray(res) ? res : []);
      setGroupMembers(members);
    } catch { setGroupMembers([]); }
  };

  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res: any = await get(`/api/admin/users/search?q=${encodeURIComponent(q)}`);
      setSearchResults(Array.isArray(res) ? res : []);
    } catch { setSearchResults([]); }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      await post(`/api/admin/groups/${selectedGroup.id}/members`, { userId });
      toast.success('User added to group');
      setShowAddMember(false);
      setSearchQuery('');
      setSearchResults([]);
      openGroupDetail(selectedGroup);
    } catch { toast.error('Failed to add user'); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      await del(`/api/admin/groups/${selectedGroup.id}/members/${userId}`);
      toast.success('User removed from group');
      openGroupDetail(selectedGroup);
    } catch { toast.error('Failed to remove user'); }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    try {
      await put(`/api/admin/groups/${editingGroup.id}`, editForm);
      toast.success('Group updated');
      setEditingGroup(null);
      setSelectedGroup({ ...selectedGroup!, ...editForm } as Group);
      loadGroups();
    } catch { toast.error('Failed to update group'); }
  };

  const handleCreateGroup = async () => {
    if (!createForm.name) { toast.error('Group name is required'); return; }
    try {
      await post('/api/admin/groups', createForm);
      toast.success('Group created');
      setShowCreateGroup(false);
      setCreateForm({ name: '', description: '', monthlyPageLimit: 100, fileSizeLimitMb: 50, concurrentUploads: 5, tokenQuota: 10000 });
      loadGroups();
    } catch { toast.error('Failed to create group'); }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <ConfirmDialog open={confirmAction.open} title={confirmAction.title} message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction({ ...confirmAction, open: false })} danger={confirmAction.danger} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">User & Group Management</h1>
          <p className="text-neutral-600">Manage users, groups, roles, and permissions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-200 rounded-lg p-1 mb-6 w-fit">
          <button onClick={() => { setActiveTab('users'); setSelectedGroup(null); }} className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'users' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>
            Users ({users.length})
          </button>
          <button onClick={() => { setActiveTab('groups'); setSelectedGroup(null); }} className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'groups' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>
            Groups ({groups.length})
          </button>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : activeTab === 'users' ? (
          /* ===================== USERS TAB ===================== */
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Group</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select value={user.groupId || ''} onChange={(e) => handleAssignGroup(user.id, e.target.value)} className="text-sm border border-neutral-200 rounded-lg px-2 py-1 bg-white">
                          <option value="">Unassigned</option>
                          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${user.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!user.isApproved && (
                            <button onClick={() => handleApprove(user.id)} className="text-xs font-semibold text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50">Approve</button>
                          )}
                          {!user.isAdmin ? (
                            <button onClick={() => handlePromote(user)} className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50">Promote</button>
                          ) : (
                            <button onClick={() => handleDemote(user)} className="text-xs font-semibold text-orange-600 hover:text-orange-800 px-2 py-1 rounded hover:bg-orange-50">Demote</button>
                          )}
                          <button onClick={() => handleDeleteUser(user)} className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <p className="text-center py-8 text-neutral-500">No users found</p>}
          </div>
        ) : (
          /* ===================== GROUPS TAB ===================== */
          selectedGroup ? (
            /* Group Detail View */
            <div>
              <button onClick={() => setSelectedGroup(null)} className="text-primary-600 hover:text-primary-700 font-medium mb-4 text-sm">← Back to Groups</button>
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{selectedGroup.name}</h2>
                    <p className="text-neutral-500 text-sm">{selectedGroup.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingGroup(selectedGroup); setEditForm(selectedGroup); }} className="btn-outline text-sm">Edit Quota</button>
                    <button onClick={() => handleDeleteGroup(selectedGroup)} className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50">Delete Group</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 mb-1">Monthly Pages</p>
                    <p className="text-lg font-bold text-primary-600">{selectedGroup.monthlyPageLimit}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 mb-1">File Size Limit</p>
                    <p className="text-lg font-bold text-secondary-600">{selectedGroup.fileSizeLimitMb} MB</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 mb-1">Concurrent Uploads</p>
                    <p className="text-lg font-bold text-info">{selectedGroup.concurrentUploads}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 mb-1">Token Quota</p>
                    <p className="text-lg font-bold text-success">{selectedGroup.tokenQuota.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-900">Members ({groupMembers.length})</h3>
                  <button onClick={() => setShowAddMember(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Member
                  </button>
                </div>

                {groupMembers.length > 0 ? (
                  <div className="space-y-2">
                    {groupMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">{m.name}</p>
                          <p className="text-xs text-neutral-500">{m.email}</p>
                        </div>
                        <button onClick={() => handleRemoveMember(m.id)} className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-neutral-500">No members in this group</p>
                )}
              </div>

              {/* Add Member Modal */}
              {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddMember(false)}>
                  <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Add Member to {selectedGroup.name}</h3>
                    <input type="text" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)} placeholder="Search by name or email..." className="input-base mb-4" autoFocus />
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.filter((u) => u.groupId !== selectedGroup.id).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100">
                            <div>
                              <p className="font-medium text-neutral-900 text-sm">{u.name}</p>
                              <p className="text-xs text-neutral-500">{u.email} · {u.group?.name || 'No group'}</p>
                            </div>
                            <button onClick={() => handleAddMember(u.id)} className="text-xs font-semibold text-primary-600 hover:text-primary-800 px-3 py-1 rounded-lg hover:bg-primary-50">Add</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className="text-center py-4 text-neutral-500 text-sm">No users found</p>
                    )}
                    <button onClick={() => setShowAddMember(false)} className="w-full mt-4 btn-ghost text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* Edit Group Quota Modal */}
              {editingGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingGroup(null)}>
                  <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Edit {editingGroup.name} Quota</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Page Limit</label>
                        <input type="number" value={editForm.monthlyPageLimit || 0} onChange={(e) => setEditForm({ ...editForm, monthlyPageLimit: parseInt(e.target.value) || 0 })} className="input-base" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">File Size Limit (MB)</label>
                        <input type="number" value={editForm.fileSizeLimitMb || 0} onChange={(e) => setEditForm({ ...editForm, fileSizeLimitMb: parseInt(e.target.value) || 0 })} className="input-base" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Concurrent Uploads</label>
                        <input type="number" value={editForm.concurrentUploads || 0} onChange={(e) => setEditForm({ ...editForm, concurrentUploads: parseInt(e.target.value) || 0 })} className="input-base" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Token Quota</label>
                        <input type="number" value={editForm.tokenQuota || 0} onChange={(e) => setEditForm({ ...editForm, tokenQuota: parseInt(e.target.value) || 0 })} className="input-base" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={handleUpdateGroup} className="btn-primary flex-1">Save Changes</button>
                      <button onClick={() => setEditingGroup(null)} className="btn-ghost flex-1">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Groups List */
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowCreateGroup(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Create Group
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div key={group.id} className="card-hover" onClick={() => openGroupDetail(group)}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-neutral-900">{group.name}</h3>
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full font-medium">{group.translationApisAllowed?.length || 0} APIs</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{group.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-neutral-50 rounded-lg p-2"><p className="text-neutral-500">Pages/mo</p><p className="font-bold text-neutral-900">{group.monthlyPageLimit.toLocaleString()}</p></div>
                      <div className="bg-neutral-50 rounded-lg p-2"><p className="text-neutral-500">File Size</p><p className="font-bold text-neutral-900">{group.fileSizeLimitMb} MB</p></div>
                      <div className="bg-neutral-50 rounded-lg p-2"><p className="text-neutral-500">Concurrent</p><p className="font-bold text-neutral-900">{group.concurrentUploads}</p></div>
                      <div className="bg-neutral-50 rounded-lg p-2"><p className="text-neutral-500">Token Quota</p><p className="font-bold text-neutral-900">{group.tokenQuota.toLocaleString()}</p></div>
                    </div>
                  </div>
                ))}
              </div>
              {groups.length === 0 && <div className="card text-center py-12"><p className="text-neutral-500">No groups yet. Create one to get started.</p></div>}
            </div>
          )
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateGroup(false)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Create New Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Group Name *</label>
                  <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="input-base" placeholder="e.g. Premium Users" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="input-base" rows={2} placeholder="Describe this group's purpose..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Pages</label>
                    <input type="number" value={createForm.monthlyPageLimit} onChange={(e) => setCreateForm({ ...createForm, monthlyPageLimit: parseInt(e.target.value) || 100 })} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">File Size (MB)</label>
                    <input type="number" value={createForm.fileSizeLimitMb} onChange={(e) => setCreateForm({ ...createForm, fileSizeLimitMb: parseInt(e.target.value) || 50 })} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Concurrent Uploads</label>
                    <input type="number" value={createForm.concurrentUploads} onChange={(e) => setCreateForm({ ...createForm, concurrentUploads: parseInt(e.target.value) || 5 })} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Token Quota</label>
                    <input type="number" value={createForm.tokenQuota} onChange={(e) => setCreateForm({ ...createForm, tokenQuota: parseInt(e.target.value) || 10000 })} className="input-base" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleCreateGroup} className="btn-primary flex-1">Create Group</button>
                <button onClick={() => setShowCreateGroup(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
