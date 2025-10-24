import axios from 'axios';

const API_BASE = '/api';

export const paymentsApi = {
  createIntent: async (paymentData: { reservationId: string; amount: number }) => {
    const response = await axios.post(`${API_BASE}/payments/create-intent`, paymentData);
    return response.data;
  },
};