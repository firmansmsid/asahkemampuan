import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/axios';
import { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<{ needsApproval: boolean }>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          localStorage.setItem('auth_token', token);
          // Also set a cookie for middleware to check
          Cookies.set('auth-storage', JSON.stringify({
            state: { isAuthenticated: true, token, user }
          }), { path: '/' });
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await apiClient.post('/auth/register', data);
          set({ isLoading: false });
          return { needsApproval: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // silent
        } finally {
          localStorage.removeItem('auth_token');
          Cookies.remove('auth-storage', { path: '/' });
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        const token = get().token || localStorage.getItem('auth_token');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true });
        try {
          const response = await apiClient.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('auth_token');
          Cookies.remove('auth-storage', { path: '/' });
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
