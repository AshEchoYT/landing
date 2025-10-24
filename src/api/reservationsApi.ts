import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface Reservation {
  _id: string;
  attendee: string;
  event: {
    _id: string;
    title: string;
    date: string;
    venue: {
      name: string;
      location: string;
    };
  };
  seatNo: number;
  category: string;
  price: number;
  status: 'reserved' | 'cancelled' | 'confirmed';
  reservedAt: string;
  reservationExpiresAt: string;
}

export const reservationsApi = {
  createReservation: async (reservationData: {
    eventId: string;
    seatNo: number;
    attendeeId: string;
    duration?: number;
  }): Promise<{ success: boolean; message: string; data: { reservationId: string; seatNo: number; expiresAt: string; duration: number } }> => {
    const response = await apiClient.post(API_ENDPOINTS.RESERVATIONS.CREATE, reservationData);
    return response.data;
  },

  getUserReservations: async (userId: string): Promise<{ success: boolean; data: { reservations: Reservation[] } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVATIONS.USER_RESERVATIONS}/${userId}`);
    return response.data;
  },

  extendReservation: async (reservationId: string, additionalMinutes: number = 10): Promise<{ success: boolean; message: string; data: { reservationId: string; newExpiresAt: string } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.RESERVATIONS.EXTEND}/${reservationId}/extend`, { additionalMinutes });
    return response.data;
  },

  cancelReservation: async (reservationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.RESERVATIONS.CANCEL}/${reservationId}`);
    return response.data;
  },

  confirmReservation: async (reservationId: string, ticketData: { category: string; price: number }): Promise<{ success: boolean; message: string; data: { ticket: any } }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.RESERVATIONS.CONFIRM}/${reservationId}/confirm`, ticketData);
    return response.data;
  },

  getReservationDetails: async (reservationId: string): Promise<{ success: boolean; data: { reservation: Reservation } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVATIONS.DETAIL}/${reservationId}`);
    return response.data;
  },

  cleanupExpiredReservations: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.RESERVATIONS.CLEANUP);
    return response.data;
  },
};