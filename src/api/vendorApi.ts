import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface Vendor {
  _id: string;
  name: string;
  serviceType: 'catering' | 'sound' | 'lighting' | 'security' | 'decoration' | 'photography' | 'videography' | 'transportation' | 'medical' | 'cleaning' | 'ticketing' | 'merchandise' | 'other';
  contactNo: string;
  email: string;
  contactPerson?: string;
  companyName?: string;
  website?: string;
  contractStart: string;
  contractEnd: string;
  serviceDetails?: string;
  pricing?: {
    baseRate?: number;
    currency: string;
    additionalFees?: Array<{
      name: string;
      amount: number;
      type: 'fixed' | 'percentage';
    }>;
  };
  portfolio?: Array<{
    title: string;
    description: string;
    images: string[];
    eventDate: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    document: string;
  }>;
  rating: number;
  totalEvents: number;
  isActive: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contractDuration?: string;
  formattedBaseRate?: string;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  serviceType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VendorSearchFilters {
  q?: string;
  serviceType?: string;
  minRating?: number;
}

export interface VendorsResponse {
  success: boolean;
  data: {
    vendors: Vendor[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface VendorResponse {
  success: boolean;
  data: { vendor: Vendor };
}

export interface CreateVendorData {
  name: string;
  serviceType: 'catering' | 'sound' | 'lighting' | 'security' | 'decoration' | 'photography' | 'videography' | 'transportation' | 'medical' | 'cleaning' | 'ticketing' | 'merchandise' | 'other';
  contactNo: string;
  email: string;
  contactPerson?: string;
  companyName?: string;
  website?: string;
  contractStart: string;
  contractEnd: string;
  serviceDetails?: string;
  pricing?: {
    baseRate?: number;
    currency: string;
    additionalFees?: Array<{
      name: string;
      amount: number;
      type: 'fixed' | 'percentage';
    }>;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export const vendorApi = {
  // Public endpoints
  getVendors: async (filters: VendorFilters = {}): Promise<VendorsResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.VENDORS.LIST}?${queryString}` : API_ENDPOINTS.VENDORS.LIST;

    const response = await apiClient.get(url);
    return response.data;
  },

  getVendor: async (id: string): Promise<VendorResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS.DETAIL}/${id}`);
    return response.data;
  },

  searchVendors: async (filters: VendorSearchFilters = {}): Promise<VendorsResponse> => {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.VENDORS.SEARCH}?${queryString}` : API_ENDPOINTS.VENDORS.SEARCH;

    const response = await apiClient.get(url);
    return response.data;
  },

  getVendorsByServiceType: async (serviceType: string, page = 1, limit = 10): Promise<VendorsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS.BY_SERVICE_TYPE}/${serviceType}?${params}`);
    return response.data;
  },

  // Admin only endpoints
  createVendor: async (vendorData: CreateVendorData): Promise<VendorResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.VENDORS.CREATE, vendorData);
    return response.data;
  },

  updateVendor: async (id: string, vendorData: Partial<CreateVendorData>): Promise<VendorResponse> => {
    const response = await apiClient.put(`${API_ENDPOINTS.VENDORS.UPDATE}/${id}`, vendorData);
    return response.data;
  },

  deleteVendor: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.VENDORS.DELETE}/${id}`);
    return response.data;
  },

  getVendorStats: async (vendorId: string): Promise<{ success: boolean; data: { vendorId: string; vendorName: string; totalEvents: number; averageRating: number; associatedVenues: number } }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS.STATS}/${vendorId}/stats`);
    return response.data;
  },
};