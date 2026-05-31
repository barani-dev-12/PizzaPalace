import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000, // Render free tier can take ~30–60s to wake up
  headers: {
    'Content-Type': 'application/json',
  },
});

if (process.env.NODE_ENV === 'development') {
  console.info('[Pizza Palace] API base URL:', API_URL);
}

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const isAuthRoute =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    const token = localStorage.getItem('token');
    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or general errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
