import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface InitiatePaymentData {
  ticketId: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  amount: number;
  category?: string;
}

export interface ProcessPaymentData {
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
  upiId?: string;
}

export interface Payment {
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  expiresAt: string;
}

export const paymentApi = {
  initiatePayment: async (paymentData: InitiatePaymentData): Promise<{ success: boolean; message: string; data: { paymentId: string; transactionId: string; amount: number; currency: string; expiresAt: string } }> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.INITIATE, paymentData);
    return response.data;
  },

  processPayment: async (paymentId: string, processData: ProcessPaymentData): Promise<{ success: boolean; message: string; data: { paymentId: string; transactionId: string; status: string; ticket: { ticketId: string; ticketNumber: string; qrCode: string } } }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS.PROCESS}/${paymentId}/process`, processData);
    return response.data;
  },

  getPaymentDetails: async (paymentId: string): Promise<{ success: boolean; data: { payment: Payment } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.DETAILS}/${paymentId}`);
    return response.data;
  },

  getUserPayments: async (userId: string): Promise<{ success: boolean; data: { payments: Payment[] } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.USER}/${userId}`);
    return response.data;
  },

  cancelPayment: async (paymentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.PAYMENTS.CANCEL}/${paymentId}`);
    return response.data;
  },

  processRefund: async (paymentId: string, refundData: { amount: number; reason: string }): Promise<{ success: boolean; message: string; data: { paymentId: string; refundAmount: number; refundReason: string } }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS.REFUND}/${paymentId}/refund`, refundData);
    return response.data;
  },

  // Legacy support for mock payments
  processMockPayment: async (mockData: { attendeeId: string; ticketId: string; amount: number; mode: string }): Promise<{ success: boolean; message: string; data: { paymentId: string; status: string; amount: number; paymentMethod: string; transactionId: string; ticket: { ticketId: string; ticketNumber: string; qrCode: string } } }> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.MOCK, mockData);
    return response.data;
  },

  getPaymentStats: async (userId: string): Promise<{ success: boolean; data: { stats: { totalPayments: number; completedPayments: number; pendingPayments: number; failedPayments: number; totalAmount: number } } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.STATS}/${userId}`);
    return response.data;
  },
};