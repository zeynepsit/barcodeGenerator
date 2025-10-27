import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token'ı localStorage'dan yükle
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login({ username, password });
      
      setToken(response.token);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any): Promise<AuthResponse> => {
    try {
      const response: AuthResponse = await authApi.register(userData);
      
      // Token varsa otomatik login yap
      if (response.token) {
        setToken(response.token);
        setUser({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        });
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        }));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'ADMIN';

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

