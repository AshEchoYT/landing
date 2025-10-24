import axios from 'axios';

const API_BASE = '/api';

export const ticketsApi = {
  getUserTickets: async (userId: string) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/tickets`);
    return response.data;
  },
};