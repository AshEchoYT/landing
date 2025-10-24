import axios from 'axios';

const API_BASE = '/api';

export const seatMapApi = {
  getSeatMap: async (eventId: string) => {
    const response = await axios.get(`${API_BASE}/events/${eventId}/seatmap`);
    return response.data;
  },
  createReservation: async (reservationData: { eventId: string; seatIds: string[] }) => {
    const response = await axios.post(`${API_BASE}/reservations`, reservationData);
    return response.data;
  },
  cancelReservation: async (reservationId: string) => {
    const response = await axios.delete(`${API_BASE}/reservations/${reservationId}`);
    return response.data;
  },
};