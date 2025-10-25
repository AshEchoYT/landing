import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface AttendeePreferences {
  notifications: {
    email: boolean;
    sms: boolean;
  };
  categories: string[];
}

export interface Attendee {
  _id: string;
  name: string;
  email: string;
  phoneNumbers?: string[];
  role: 'attendee' | 'organizer' | 'admin';
  isActive: boolean;
  profilePicture?: string;
  preferences: AttendeePreferences;
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeProfile extends Attendee {
  // Additional fields that might be included in profile responses
}

export interface AttendeeTicket {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    venue: {
      name: string;
      location?: string;
    };
    category: string;
  };
  category: string;
  seatNo: string;
  price: number;
  status: 'active' | 'used' | 'cancelled' | 'refunded';
  issueDate: string;
  ticketNumber: string;
  qrCode: string;
}

export interface AttendeeEvent {
  _id: string;
  title: string;
  date: string;
  venue: {
    name: string;
    address?: {
      city: string;
    };
  };
  organizer: {
    name: string;
  };
  category: string;
  status: string;
  analytics?: {
    views?: number;
    registrations?: number;
    revenue?: number;
  };
  ticketStatus: string;
}

export interface AttendeePayment {
  _id: string;
  ticket: {
    _id: string;
    event: string;
    category: string;
    price: number;
  };
  amount: number;
  mode: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled' | 'Refunded';
  date: string;
  transactionId: string;
}

export interface AttendeeStats {
  totalTickets: number;
  activeTickets: number;
  totalSpent: number;
  eventsAttended: number;
  upcomingEvents: number;
  favoriteCategories: Array<{
    _id: string;
    count: number;
  }>;
}

export interface AttendeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface AttendeesResponse {
  success: boolean;
  data: {
    attendees: Attendee[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AttendeeResponse {
  success: boolean;
  data: { attendee: Attendee };
}

export interface AttendeeTicketsResponse {
  success: boolean;
  data: {
    tickets: AttendeeTicket[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AttendeeEventsResponse {
  success: boolean;
  data: {
    events: AttendeeEvent[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AttendeePaymentsResponse {
  success: boolean;
  data: {
    payments: AttendeePayment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AttendeeStatsResponse {
  success: boolean;
  data: { stats: AttendeeStats };
}

export interface UpdateAttendeeProfileData {
  name?: string;
  phoneNumbers?: string[];
  preferences?: AttendeePreferences;
  profilePicture?: string;
}

export const attendeeApi = {
  // Attendee profile management
  getProfile: async (): Promise<{ success: boolean; data: { attendee: AttendeeProfile } }> => {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDEES.PROFILE);
    return response.data;
  },

  updateProfile: async (profileData: UpdateAttendeeProfileData): Promise<{ success: boolean; message: string; data: { attendee: AttendeeProfile } }> => {
    const response = await apiClient.put(API_ENDPOINTS.ATTENDEES.PROFILE, profileData);
    return response.data;
  },

  // Attendee history and data
  getAttendeeTickets: async (filters: { page?: number; limit?: number; status?: string } = {}): Promise<AttendeeTicketsResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ATTENDEES.TICKETS}?${queryString}` : API_ENDPOINTS.ATTENDEES.TICKETS;

    const response = await apiClient.get(url);
    return response.data;
  },

  getAttendeeEvents: async (filters: { page?: number; limit?: number; status?: string } = {}): Promise<AttendeeEventsResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ATTENDEES.EVENTS}?${queryString}` : API_ENDPOINTS.ATTENDEES.EVENTS;

    const response = await apiClient.get(url);
    return response.data;
  },

  getAttendeePayments: async (filters: { page?: number; limit?: number; status?: string } = {}): Promise<AttendeePaymentsResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ATTENDEES.PAYMENTS}?${queryString}` : API_ENDPOINTS.ATTENDEES.PAYMENTS;

    const response = await apiClient.get(url);
    return response.data;
  },

  getAttendeeStats: async (): Promise<AttendeeStatsResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDEES.STATS);
    return response.data;
  },

  // Admin only endpoints
  getAttendees: async (filters: AttendeeFilters = {}): Promise<AttendeesResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ATTENDEES.LIST}?${queryString}` : API_ENDPOINTS.ATTENDEES.LIST;

    const response = await apiClient.get(url);
    return response.data;
  },

  getAttendee: async (id: string): Promise<AttendeeResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ATTENDEES.DETAIL}/${id}`);
    return response.data;
  },

  updateAttendee: async (id: string, attendeeData: Partial<Attendee>): Promise<{ success: boolean; message: string; data: { attendee: Attendee } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.ATTENDEES.UPDATE}/${id}`, attendeeData);
    return response.data;
  },

  deactivateAttendee: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ATTENDEES.DEACTIVATE}/${id}`);
    return response.data;
  },
};