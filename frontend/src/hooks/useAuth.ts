import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { User, LoginRequest, SignupRequest } from '../types';

export const useAuth = () => {
  const { user, token, setUser, setToken, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setToken]);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signup(data);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setToken]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      storeLogout();
    } catch (err: any) {
      console.error('Logout error:', err);
      storeLogout();
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const isAuthenticated = !!token && !!user;

  return { user, token, isAuthenticated, isLoading, error, login, signup, logout };
};
