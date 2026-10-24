import apiClient from './client';

export const register = async (payload) => {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await apiClient.post('/api/auth/login', payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

