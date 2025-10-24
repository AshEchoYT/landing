import { create } from 'zustand';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  organizer: string;
  image: string;
  tags: string[];
  price: number;
  capacity: number;
  availableSeats: number;
}

interface EventStore {
  events: Event[];
  currentEvent: Event | null;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  currentEvent: null,
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
}));