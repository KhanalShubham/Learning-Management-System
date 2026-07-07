import React, { createContext, useEffect, useCallback } from 'react';
import type { User, AuthContextType } from '../types';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/store/auth-store';

/**
 * Authentication React Context object.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider Component
 *
 * Provides session state and auth operations to children components.
 * The Zustand auth store is the single source of truth for session state
 * (it's also read directly by the Axios interceptor during silent token
 * refreshes) — this provider only exposes it through context and owns the
 * imperative login/logout/bootstrap actions.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialLoading = useAuthStore((state) => state.isInitialLoading);

  const setSession = useCallback((newUser: User, newToken: string) => {
    useAuthStore.getState().setSession(newUser, newToken);
  }, []);

  const clearSession = useCallback(() => {
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
    async (email: string, password: string, rememberMe = false) => {
      try {
        const data = await authService.login(email, password, rememberMe);
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
    } catch {
      // Local session is cleared regardless of whether the server call succeeded.
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
      }
    };

    bootstrapSession();
  }, [setSession, clearSession]);

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading: isInitialLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
