/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import type { User, LoginRequest } from '../api/types';
import { APIException } from '../utils/api-error';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize: Check if user is authenticated
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = authAPI.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Then verify with backend
        const currentUser = await authAPI.me();
        setUser(currentUser);
        authAPI.setStoredUser(currentUser);
      } catch (error) {
        // If verification fails, clear stored data
        setUser(null);
        authAPI.clearStoredUser();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with username/password
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      authAPI.setStoredUser(response.user);
    } catch (error) {
      setUser(null);
      authAPI.clearStoredUser();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authAPI.clearStoredUser();
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(() => {
    authAPI.loginWithGoogle();
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authAPI.me();
      setUser(currentUser);
      authAPI.setStoredUser(currentUser);
    } catch (error) {
      if (error instanceof APIException && error.statusCode === 401) {
        setUser(null);
        authAPI.clearStoredUser();
      }
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    loginWithGoogle,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
