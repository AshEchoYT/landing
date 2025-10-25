import { create } from 'zustand';
import { BackendSeat } from '@/types/seat';

interface SeatStore {
  selectedSeats: BackendSeat[];
  seatmap: any | null;
  availableSeats: number[];
  occupiedSeats: number[];
  loading: boolean;
  error: string | null;

  // Actions
  addSeat: (seat: BackendSeat) => void;
  removeSeat: (seatNo: number) => void;
  clearSeats: () => void;
  setSeatmap: (seatmap: any) => void;
  setAvailableSeats: (seats: number[]) => void;
  setOccupiedSeats: (seats: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  selectedSeats: [],
  seatmap: null,
  availableSeats: [],
  occupiedSeats: [],
  loading: false,
  error: null,

  addSeat: (seat) => set((state) => ({
    selectedSeats: [...state.selectedSeats, seat]
  })),

  removeSeat: (seatNo) => set((state) => ({
    selectedSeats: state.selectedSeats.filter(seat => seat.seatNo !== seatNo)
  })),

  clearSeats: () => set({ selectedSeats: [] }),

  setSeatmap: (seatmap) => set({ seatmap }),

  setAvailableSeats: (seats) => set({ availableSeats: seats }),

  setOccupiedSeats: (seats) => set({ occupiedSeats: seats }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));