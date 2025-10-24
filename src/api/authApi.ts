import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/config';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'attendee' | 'organizer';
  phone?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin' | 'staff';
  profilePicture?: string;
  phoneNumbers?: string[];
  preferences?: {
    notifications: boolean;
    marketingEmails: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    // Store token in localStorage
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    // Update token in localStorage
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    // Clear token from localStorage
    localStorage.removeItem('accessToken');
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },
};