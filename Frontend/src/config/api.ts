// Axios must be installed in the project (`npm install axios`).
// @ts-expect-error Allow the file to compile until the dependency is installed.
import axios from 'axios';
// @ts-expect-error Allow the file to compile until the dependency is installed.
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // <-- Ini kuncinya, harus 5000
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);