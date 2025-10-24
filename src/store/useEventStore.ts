import { create } from 'zustand';
import { Event } from '../api/eventsApi';

interface EventStore {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map(event =>
      event._id === id ? { ...event, ...updates } : event
    ),
    currentEvent: state.currentEvent?._id === id
      ? { ...state.currentEvent, ...updates }
      : state.currentEvent
  })),
  removeEvent: (id) => set((state) => ({
    events: state.events.filter(event => event._id !== id),
    currentEvent: state.currentEvent?._id === id ? null : state.currentEvent
  })),
}));