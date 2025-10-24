import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface PaymentData {
  attendeeId: string;
  ticketId: string;
  amount: number;
  mode: 'card' | 'upi' | 'netbanking' | 'wallet';
}

export interface Payment {
  _id: string;
  attendee: string;
  ticket: string;
  amount: number;
  mode: string;
  status: 'Success' | 'Failed' | 'Pending';
  transactionId: string;
  date: string;
  refund?: {
    refundTransactionId: string;
    amount: number;
    reason: string;
    date: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: { payments: Payment[] };
}

export interface PaymentStatsResponse {
  success: boolean;
  data: { stats: any };
}

export const paymentsApi = {
  processMockPayment: async (paymentData: PaymentData): Promise<{ success: boolean; data: { paymentId: string; status: string; amount: number; mode: string; transactionId: string } }> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.MOCK, paymentData);
    return response.data;
  },

  getUserPayments: async (userId: string): Promise<PaymentHistoryResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.HISTORY}/${userId}`);
    return response.data;
  },

  getPaymentStats: async (userId: string): Promise<PaymentStatsResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.STATS}/${userId}`);
    return response.data;
  },

  processRefund: async (paymentId: string, refundData: { reason: string; amount?: number }): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS.REFUND}/${paymentId}/refund`, refundData);
    return response.data;
  },

  getPaymentDetails: async (paymentId: string): Promise<{ success: boolean; data: { payment: Payment } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS.HISTORY}/${paymentId}`);
    return response.data;
  },
};