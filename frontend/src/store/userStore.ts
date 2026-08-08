import { create } from 'zustand';
import { UserProfile, UserQuota } from '../types';

interface UserStore {
  profile: UserProfile | null;
  quota: UserQuota | null;
  setProfile: (profile: UserProfile) => void;
  setQuota: (quota: UserQuota) => void;
  clear: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  quota: null,
  setProfile: (profile) => set({ profile }),
  setQuota: (quota) => set({ quota }),
  clear: () => set({ profile: null, quota: null }),
}));
