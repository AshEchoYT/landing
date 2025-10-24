import { create } from 'zustand';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  category: 'vip' | 'fan-pit' | 'general' | 'balcony';
}

interface SeatStore {
  selectedSeats: Seat[];
  reservationId: string | null;
  expiresAt: Date | null;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setReservation: (id: string, expiresAt: Date) => void;
  clearReservation: () => void;
}

export const useSeatStore = create<SeatStore>((set) => ({
  selectedSeats: [],
  reservationId: null,
  expiresAt: null,
  addSeat: (seat) => set((state) => ({ selectedSeats: [...state.selectedSeats, seat] })),
  removeSeat: (seatId) => set((state) => ({
    selectedSeats: state.selectedSeats.filter(seat => seat.id !== seatId)
  })),
  clearSeats: () => set({ selectedSeats: [] }),
  setReservation: (id, expiresAt) => set({ reservationId: id, expiresAt }),
  clearReservation: () => set({ reservationId: null, expiresAt: null }),
}));