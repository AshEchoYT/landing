import { create } from 'zustand';

interface OrganizerStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  upcomingEvents: number;
}

interface OrganizerStore {
  stats: OrganizerStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  setStats: (stats: OrganizerStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrganizerStore = create<OrganizerStore>((set, get) => ({
  stats: null,
  loading: false,
  error: null,

  setStats: (stats) => set({ stats }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error) => set({ error }),
}));