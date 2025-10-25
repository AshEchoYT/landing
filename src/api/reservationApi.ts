import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface ReservationData {
  eventId: string;
  seatNo: number;
  attendeeId: string;
  duration?: number;
}

export interface Reservation {
  reservationId: string;
  seatNo: number;
  expiresAt: string;
}

export interface ConfirmReservationData {
  category: 'standard' | 'vip' | 'premium';
  price: number;
}

export const reservationApi = {
  createReservation: async (reservationData: ReservationData): Promise<{ success: boolean; message: string; data: Reservation }> => {
    const response = await apiClient.post(API_ENDPOINTS.RESERVATIONS.CREATE, reservationData);
    return response.data;
  },

  getUserReservations: async (userId: string): Promise<{ success: boolean; data: { reservations: any[] } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVATIONS.USER_RESERVATIONS}/${userId}`);
    return response.data;
  },

  extendReservation: async (reservationId: string, additionalMinutes: number): Promise<{ success: boolean; message: string; data: { reservationId: string; newExpiresAt: string } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.RESERVATIONS.EXTEND}/${reservationId}/extend`, { additionalMinutes });
    return response.data;
  },

  cancelReservation: async (reservationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.RESERVATIONS.CANCEL}/${reservationId}`);
    return response.data;
  },

  confirmReservation: async (reservationId: string, confirmData: ConfirmReservationData): Promise<{ success: boolean; message: string; data: { ticket: any } }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.RESERVATIONS.CONFIRM}/${reservationId}/confirm`, confirmData);
    return response.data;
  },

  getReservationDetails: async (reservationId: string): Promise<{ success: boolean; data: { reservation: any } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVATIONS.DETAIL}/${reservationId}`);
    return response.data;
  },
};