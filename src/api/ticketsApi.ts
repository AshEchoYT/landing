import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface TicketData {
  attendeeId: string;
  eventId: string;
  seatNo: number;
  category: 'standard' | 'vip' | 'premium';
  price: number;
}

export interface Ticket {
  _id: string;
  attendee: {
    _id: string;
    name: string;
    email: string;
  };
  event: {
    _id: string;
    name: string;
    startDate: string;
    venue: {
      _id: string;
      name: string;
      location: string;
      capacity: number;
    } | string; // Can be string if not populated
  } | string; // Can be string if not populated
  seatNo: number;
  category: string;
  price: number;
  status: 'active' | 'cancelled' | 'refunded' | 'reserved';
  ticketNumber: string;
  qrCode: string;
  issuedAt: string;
  payment?: string;
  reservedAt?: string;
  reservationExpiresAt?: string;
}

export interface UserTicketsResponse {
  success: boolean;
  data: { tickets: Ticket[] };
}

export const ticketsApi = {
  issueTicket: async (ticketData: TicketData): Promise<{ success: boolean; data: { ticket: Ticket } }> => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.ISSUE, ticketData);
    return response.data;
  },

  getUserTickets: async (userId: string): Promise<UserTicketsResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.USER_TICKETS}/${userId}`);
    return response.data;
  },

  getTicketDetails: async (ticketId: string): Promise<{ success: boolean; data: { ticket: Ticket } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.DETAIL}/${ticketId}`);
    return response.data;
  },

  cancelTicket: async (ticketId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.TICKETS.CANCEL}/${ticketId}/cancel`, { reason });
    return response.data;
  },

  transferTicket: async (ticketId: string, newAttendeeId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.TICKETS.TRANSFER}/${ticketId}/transfer`, { newAttendeeId });
    return response.data;
  },

  getEventTickets: async (eventId: string): Promise<{ success: boolean; data: { tickets: Ticket[] } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.EVENT_TICKETS}/${eventId}`);
    return response.data;
  },

  validateTicket: async (ticketId: string, eventId: string): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.VALIDATE, { ticketId, eventId });
    return response.data;
  },

  downloadTicket: async (ticketId: string): Promise<void> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS.DOWNLOAD}/${ticketId}/download`, {
      responseType: 'blob'
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticketId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};