import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: {
    _id: string;
    name: string;
    location: string;
    capacity: number;
    layout?: string;
  };
  organizer: string;
  category: string;
  tags: string[];
  pricing: Array<{
    category: 'standard' | 'vip' | 'premium';
    price: number;
    available: number;
  }>;
  capacity: number;
  status: 'active' | 'inactive' | 'cancelled' | 'completed';
  image?: string;
  staffCount?: number;
  sponsor?: string;
  staff?: Array<{
    staff: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    role: string;
    assignedAt: string;
  }>;
  sponsors?: Array<{
    sponsor: {
      _id: string;
      name: string;
      company: string;
      sponsorshipLevel: string;
      amount: number;
    };
    contributionAmount: number;
    sponsorshipType: string;
    perks: string[];
  }>;
  vendors?: Array<{
    vendor: {
      _id: string;
      name: string;
      serviceType: string;
    };
    serviceType: string;
    contractAmount: number;
  }>;
  analytics: {
    ticketsSold: number;
    attendees: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  venue?: string;
  date?: string;
  organizer?: string;
}

export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface EventResponse {
  success: boolean;
  data: { event: Event };
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  capacity: number;
  pricing: Array<{
    category: string;
    price: number;
  }>;
  tags?: string[];
  image?: string;
  staff?: Array<{
    staffId: string;
    role: string;
  }>;
  sponsors?: Array<{
    sponsorId: string;
    contributionAmount: number;
    sponsorshipType: string;
    perks: string[];
  }>;
  vendors?: Array<{
    vendorId: string;
    serviceType: string;
    contractAmount: number;
  }>;
  theme?: string;
  ageRestriction?: number;
  budget?: number;
  visibility?: 'public' | 'private' | 'invite-only';
}

export const eventsApi = {
  getEvents: async (filters: EventFilters = {}): Promise<EventsResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.venue) params.append('venue', filters.venue);
    if (filters.date) params.append('date', filters.date);
    if (filters.organizer) params.append('organizer', filters.organizer);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.EVENTS.LIST}?${queryString}` : API_ENDPOINTS.EVENTS.LIST;

    const response = await apiClient.get(url);
    return response.data;
  },

  getEvent: async (id: string): Promise<EventResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.EVENTS.DETAIL}/${id}`);
    return response.data;
  },

  createEvent: async (eventData: CreateEventData): Promise<EventResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<CreateEventData>): Promise<EventResponse> => {
    const response = await apiClient.put(`${API_ENDPOINTS.EVENTS.UPDATE}/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.EVENTS.DELETE}/${id}`);
    return response.data;
  },

  registerForEvent: async (eventId: string, attendeeId: string, ticketType?: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`${API_ENDPOINTS.EVENTS.REGISTER}/${eventId}/register`, {
      attendeeId,
      ticketType
    });
    return response.data;
  },

  getEventAnalytics: async (eventId: string): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.EVENTS.ANALYTICS}/${eventId}/analytics`);
    return response.data;
  },
};