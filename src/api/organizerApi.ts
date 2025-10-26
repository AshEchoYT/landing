import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface OrganizerPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark';
  language: string;
}

export interface Organizer {
  _id: string;
  name: string;
  email: string;
  phoneNumbers?: string[];
  role: 'organizer';
  companyName?: string;
  website?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isVerified: boolean;
  totalEvents: number;
  rating: number;
  isActive: boolean;
  preferences: OrganizerPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerDashboard {
  metrics: {
    totalEvents: number;
    activeEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
    totalAttendees: number;
  };
  recentEvents: any[];
  upcomingEvents: any[];
}

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface Sponsor {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
  company?: string; // For backward compatibility
  sponsorshipType?: string;
  sponsorshipLevel?: string; // For backward compatibility
  contributionAmount?: number;
  amount?: number; // For backward compatibility
  perks?: string[];
  benefits?: string[]; // For backward compatibility
  contactPerson?: string;
  contactNo?: string;
  isActive?: boolean;
}

export interface UpdateOrganizerProfileData {
  name?: string;
  phoneNumbers?: string[];
  companyName?: string;
  website?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    theme?: 'light' | 'dark';
    language?: string;
  };
}

export const organizerApi = {
  getDashboard: async (): Promise<{ success: boolean; data: OrganizerDashboard }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZER.DASHBOARD);
    return response.data;
  },

  getOrganizerEvents: async (filters: { page?: number; limit?: number; status?: string } = {}): Promise<{ success: boolean; data: { events: any[]; pagination: any } }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ORGANIZER.EVENTS}?${queryString}` : API_ENDPOINTS.ORGANIZER.EVENTS;

    const response = await apiClient.get(url);
    return response.data;
  },

  getEventAnalytics: async (eventId: string): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZER.EVENT_ANALYTICS}/${eventId}/analytics`);
    return response.data;
  },

  // Staff Management
  getStaff: async (): Promise<{ success: boolean; data: { staff: StaffMember[] } }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZER.STAFF);
    return response.data;
  },

  addStaffMember: async (staffData: { name: string; email: string; role: string; permissions: string[] }): Promise<{ success: boolean; message: string; data: { staff: StaffMember } }> => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZER.STAFF, staffData);
    return response.data;
  },

  updateStaffMember: async (staffId: string, updates: Partial<StaffMember>): Promise<{ success: boolean; message: string; data: { staff: StaffMember } }> => {
    const response = await apiClient.put(`${API_ENDPOINTS.ORGANIZER.STAFF}/${staffId}`, updates);
    return response.data;
  },

  removeStaffMember: async (staffId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ORGANIZER.STAFF}/${staffId}`);
    return response.data;
  },

  // Sponsor Management
  getSponsors: async (): Promise<{ success: boolean; data: { sponsors: Sponsor[] } }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZER.SPONSORS);
    return response.data;
  },

  addSponsor: async (sponsorData: { name: string; email: string; company: string; sponsorshipLevel: string; amount: number; benefits: string[] }): Promise<{ success: boolean; message: string; data: { sponsor: Sponsor } }> => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZER.SPONSORS, sponsorData);
    return response.data;
  },

  // Vendor Management
  getVendors: async (): Promise<{ success: boolean; data: { vendors: Vendor[] } }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZER.VENDORS);
    return response.data;
  },

  addVendor: async (vendorData: { name: string; email: string; company: string; serviceType: string; boothNumber?: string; contractValue: number }): Promise<{ success: boolean; message: string; data: { vendor: Vendor } }> => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZER.VENDORS, vendorData);
    return response.data;
  },

  // Profile Management
  getProfile: async (): Promise<{ success: boolean; data: { organizer: Organizer } }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZER.PROFILE);
    return response.data;
  },

  updateProfile: async (profileData: UpdateOrganizerProfileData): Promise<{ success: boolean; message: string; data: { organizer: Organizer } }> => {
    const response = await apiClient.put(API_ENDPOINTS.ORGANIZER.PROFILE, profileData);
    return response.data;
  },
};