import { create } from 'zustand';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api`;

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setToken: (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token });
  },

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const { data } = await axios.get(`${API}/auth/me`);
      set({ user: data, token });
    } catch {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, token: null });
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(`${API}/auth/register`, { username, email, password });
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Registration failed';
      set({ error, loading: false });
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Login failed';
      set({ error, loading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateUser: (user) => set({ user }),
}));
