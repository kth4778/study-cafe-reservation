import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';

export const isAxiosError = axios.isAxiosError;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);
