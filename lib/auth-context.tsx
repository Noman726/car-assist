"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authUtils, AuthState } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authState = authUtils.isAuthenticated();
    const currentUser = authUtils.getCurrentUser();
    
    setIsAuthenticated(authState);
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authUtils.login(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const result = await authUtils.register(userData);
    
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const logout = () => {
    authUtils.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
