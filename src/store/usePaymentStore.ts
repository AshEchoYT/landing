import { create } from 'zustand';

interface Payment {
  _id: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStore {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;

  // Actions
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  setCurrentPayment: (payment: Payment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,

  setPayments: (payments) => set({ payments }),

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment]
  })),

  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map(payment =>
      payment._id === id ? { ...payment, ...updates } : payment
    )
  })),

  setCurrentPayment: (payment) => set({ currentPayment: payment }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error) => set({ error }),
}));