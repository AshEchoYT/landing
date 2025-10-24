import { create } from 'zustand';

interface Ticket {
  _id: string;
  eventId: string;
  userId: string;
  seatNo: number;
  price: number;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
  issuedAt: string;
  expiresAt: string;
}

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;

  // Actions
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  setTickets: (tickets) => set({ tickets }),

  addTicket: (ticket) => set((state) => ({
    tickets: [...state.tickets, ticket]
  })),

  updateTicket: (id, updates) => set((state) => ({
    tickets: state.tickets.map(ticket =>
      ticket._id === id ? { ...ticket, ...updates } : ticket
    )
  })),

  removeTicket: (id) => set((state) => ({
    tickets: state.tickets.filter(ticket => ticket._id !== id)
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));