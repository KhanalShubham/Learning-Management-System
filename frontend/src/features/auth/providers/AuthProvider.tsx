import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthContextType } from '../types';
import { authService } from '../services/auth.service';
import { setAccessToken } from '../api/api-client';
import { useAuthStore } from '@/store/auth-store';

/**
 * Authentication React Context object.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider Component
 * 
 * Provides session states and auth operations to children components.
 * Manages Access Token storage and synchronizes session states with the Zustand store.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state helpers
  const setSession = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setAccessTokenState(newToken);
    setAccessToken(newToken);
    
    // Bridge to Zustand store to keep legacy hooks in sync
    useAuthStore.getState().setSession(newUser, newToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
    
    // Bridge to Zustand store to keep legacy hooks in sync
    useAuthStore.getState().clearSession();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const data = await authService.refreshToken();
      setSession(data.user, data.accessToken);
    } catch {
      clearSession();
    }
  }, [setSession, clearSession]);

  const login = useCallback(
    async (email: string, _role?: string) => {
      try {
        const data = await authService.login({ email, password: 'Password123' });
        setSession(data.user, data.accessToken);
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [setSession, clearSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Bootstrap user session on initial application load
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        useAuthStore.getState().setInitialLoading(true);
        const data = await authService.refreshToken();
        setSession(data.user, data.accessToken);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
        useAuthStore.getState().setInitialLoading(false);
      }
    };

    bootstrapSession();
  }, [setSession, clearSession]);

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
