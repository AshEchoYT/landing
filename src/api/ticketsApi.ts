import axios from 'axios';

const API_BASE = '/api';

export const ticketsApi = {
  getUserTickets: async (userId: string) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/tickets`);
    return response.data;
  },
  createTickets: async (userId: string, ticketData: { reservationId: string; eventId: string; seatIds: string[] }) => {
    const response = await axios.post(`${API_BASE}/users/${userId}/tickets`, ticketData);
    return response.data;
  },
};