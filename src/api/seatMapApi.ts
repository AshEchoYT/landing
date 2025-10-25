import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface SeatmapData {
  venue: {
    name: string;
    capacity: number;
    layout?: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
  };
  seats: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    occupiedSeats: number[];
    reservedSeats: number[];
  };
  pricing: Array<{
    category: string;
    price: number;
  }>;
}

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

export const seatMapApi = {
  getSeatmap: async (eventId: string): Promise<{ success: boolean; data: { seatmap: SeatmapData } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.SEATMAP.GET}/${eventId}`);
    return response.data;
  },

  reserveSeat: async (reservationData: ReservationData): Promise<{ success: boolean; message: string; data: Reservation }> => {
    const response = await apiClient.post(API_ENDPOINTS.SEATMAP.RESERVE, reservationData);
    return response.data;
  },

  cancelReservation: async (reservationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.SEATMAP.CANCEL_RESERVATION}/${reservationId}`);
    return response.data;
  },

  getAvailableSeats: async (eventId: string, category?: string): Promise<{ success: boolean; data: { eventId: string; totalSeats: number; availableSeats: number[]; availableCount: number; occupiedCount: number } }> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`${API_ENDPOINTS.SEATMAP.AVAILABLE}/${eventId}/available${params}`);
    return response.data;
  },

  checkSeatAvailability: async (eventId: string, seatNo: number): Promise<{ success: boolean; data: { eventId: string; seatNo: number; isAvailable: boolean; status: string; reservedUntil?: string } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.SEATMAP.AVAILABILITY}/${eventId}/seat/${seatNo}`);
    return response.data;
  },

  getSeatPricing: async (eventId: string): Promise<{ success: boolean; data: { eventId: string; pricing: any[] } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.SEATMAP.PRICING}/${eventId}/pricing`);
    return response.data;
  },

  updateSeatPricing: async (eventId: string, pricing: any[]): Promise<{ success: boolean; message: string; data: { pricing: any[] } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.SEATMAP.UPDATE_PRICING}/${eventId}/pricing`, { pricing });
    return response.data;
  },
};