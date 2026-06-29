import { authApi } from '../api/api-client';
import type { User } from '../types';

/**
 * Authentication Service
 * 
 * Handles client-side API contract calls to the backend auth endpoints.
 */
export const authService = {
  /**
   * Submit login credentials to authenticate session.
   */
  async login(credentials: Record<string, unknown>): Promise<{ user: User; accessToken: string }> {
    const response = await authApi.post('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Discard server refresh token cookies and clean local sessions.
   */
  async logout(): Promise<void> {
    // Pass withCredentials to ensure cookies are clear-flushed by the server
    await authApi.post('/auth/logout', {}, { withCredentials: true });
  },

  /**
   * Exchange active refresh token cookies for fresh Access Token details.
   */
  async refreshToken(): Promise<{ user: User; accessToken: string }> {
    const response = await authApi.post('/auth/refresh', {}, { withCredentials: true });
    return response.data.data;
  },

  /**
   * Fetch details of the active authenticated session.
   */
  async getCurrentUser(): Promise<{ user: User }> {
    const response = await authApi.get('/auth/me');
    return response.data.data;
  },
};
export default authService;
