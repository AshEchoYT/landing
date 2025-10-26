import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface VenueAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface VenueContact {
  phone?: string;
  email?: string;
  manager?: {
    name: string;
    phone: string;
  };
}

export interface VenuePricing {
  baseRate?: number;
  currency: string;
  additionalFees?: Array<{
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }>;
}

export interface VenueAvailability {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
}

export interface Venue {
  _id: string;
  name: string;
  address: VenueAddress;
  capacity: number;
  facilities: string[];
  venueType: 'indoor' | 'outdoor' | 'hybrid';
  contactInfo?: VenueContact;
  images?: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  pricing?: VenuePricing;
  availability?: VenueAvailability[];
  vendors?: Array<{
    _id: string;
    name: string;
    serviceType: string;
    contactNo: string;
    email: string;
    rating: number;
    companyName?: string;
    contactPerson?: string;
  }>;
  rating: number;
  totalEvents: number;
  isActive: boolean;
  description?: string;
  fullAddress?: string;
  primaryImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueFilters {
  page?: number;
  limit?: number;
  city?: string;
  venueType?: string;
  capacity?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VenueSearchFilters {
  q?: string;
  city?: string;
  venueType?: string;
  minCapacity?: number;
  maxCapacity?: number;
  facilities?: string[];
}

export interface VenuesResponse {
  success: boolean;
  data: {
    venues: Venue[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface VenueResponse {
  success: boolean;
  data: { venue: Venue };
}

export interface CreateVenueData {
  name: string;
  address: VenueAddress;
  capacity: number;
  facilities: string[];
  venueType: 'indoor' | 'outdoor' | 'hybrid';
  contactInfo?: VenueContact;
  images?: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  pricing?: VenuePricing;
  description?: string;
}

export interface VenueStats {
  venueId: string;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRevenue: number;
  averageRating: number;
  totalEventsHosted: number;
}

export const venueApi = {
  // Public endpoints
  getVenues: async (filters: VenueFilters = {}): Promise<VenuesResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.venueType) params.append('venueType', filters.venueType);
    if (filters.capacity) params.append('capacity', filters.capacity.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.VENUES.LIST}?${queryString}` : API_ENDPOINTS.VENUES.LIST;

    const response = await apiClient.get(url);
    return response.data;
  },

  getVenue: async (id: string): Promise<VenueResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.VENUES.DETAIL}/${id}`);
    return response.data;
  },

  searchVenues: async (filters: VenueSearchFilters = {}): Promise<VenuesResponse> => {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.city) params.append('city', filters.city);
    if (filters.venueType) params.append('venueType', filters.venueType);
    if (filters.minCapacity) params.append('minCapacity', filters.minCapacity.toString());
    if (filters.maxCapacity) params.append('maxCapacity', filters.maxCapacity.toString());
    if (filters.facilities) {
      filters.facilities.forEach(facility => params.append('facilities', facility));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.VENUES.SEARCH}?${queryString}` : API_ENDPOINTS.VENUES.SEARCH;

    const response = await apiClient.get(url);
    return response.data;
  },

  getVenueAvailability: async (venueId: string, date?: string): Promise<{ success: boolean; data: { venueId: string; venueName: string; availability: VenueAvailability[] } }> => {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get(`${API_ENDPOINTS.VENUES.AVAILABILITY}/${venueId}/availability${params}`);
    return response.data;
  },

  // Admin only endpoints
  createVenue: async (venueData: CreateVenueData): Promise<VenueResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.VENUES.CREATE, venueData);
    return response.data;
  },

  updateVenue: async (id: string, venueData: Partial<CreateVenueData>): Promise<VenueResponse> => {
    const response = await apiClient.put(`${API_ENDPOINTS.VENUES.UPDATE}/${id}`, venueData);
    return response.data;
  },

  deleteVenue: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.VENUES.DELETE}/${id}`);
    return response.data;
  },

  updateVenueAvailability: async (venueId: string, availability: VenueAvailability[]): Promise<{ success: boolean; message: string; data: { availability: VenueAvailability[] } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.VENUES.UPDATE_AVAILABILITY}/${venueId}/availability`, { availability });
    return response.data;
  },

  getVenueStats: async (venueId: string): Promise<{ success: boolean; data: { stats: VenueStats } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.VENUES.STATS}/${venueId}/stats`);
    return response.data;
  },
};