import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'attendee' | 'organizer';
  // Add other user fields
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { email: string; password: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      setUser({ id: '1', email: 'user@example.com', name: 'John Doe', role: 'attendee' }); // Placeholder
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData: { email: string; password: string; role: string }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { accessToken, user: userInfo } = response.data;
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userInfo);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};