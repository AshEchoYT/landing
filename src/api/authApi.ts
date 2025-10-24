import axios from 'axios';

const API_BASE = '/api';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
  },
  register: async (userData: { email: string; password: string; role: string }) => {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  },
  refresh: async () => {
    const response = await axios.post(`${API_BASE}/auth/refresh`);
    return response.data;
  },
};