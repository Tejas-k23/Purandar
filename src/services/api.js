import axios from 'axios';
import env from '../config/env';

const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const wrappedError = new Error(
      error.response?.data?.message || error.message || 'Request failed',
    );

    wrappedError.status = error.response?.status || 500;
    wrappedError.data = error.response?.data || null;

    return Promise.reject(wrappedError);
  },
);

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token);
    return;
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
};

export default api;

