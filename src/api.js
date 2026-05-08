import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('afpsat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('afpsat_token');
      localStorage.removeItem('afpsat_user');
    }
    return Promise.reject(error);
  },
);

export function getApiError(error) {
  return error.response?.data?.message || error.message || 'Something went wrong.';
}
