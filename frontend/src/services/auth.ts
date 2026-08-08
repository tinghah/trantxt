import api from './api';
import { LoginRequest, SignupRequest, AuthResponse, ResetPasswordRequest, NewPasswordRequest } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    const { token, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    return { token, refreshToken, user };
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', data);
    const { token, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    return { token, refreshToken, user };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/api/auth/reset-password', data);
  },

  setNewPassword: async (data: NewPasswordRequest): Promise<void> => {
    await api.post('/api/auth/set-password', data);
  },

  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data.data;
  },

  updateProfile: async (data: Record<string, any>) => {
    const response = await api.put('/api/user/profile', data);
    return response.data.data;
  },
};
