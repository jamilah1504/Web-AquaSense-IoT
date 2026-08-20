import { api } from '../config/api'; // <-- Pastikan ini memanggil file api.ts Anda

export const login = async (email: string, password: string) => {
  // Gunakan 'api.post', BUKAN 'axios.post'
  const response = await api.post('/auth/login', { email, password });
  return response.data.data; 
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};