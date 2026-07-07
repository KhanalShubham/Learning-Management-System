import { api } from '@/services/api';
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
  async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ user: User; accessToken: string }> {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    return response.data.data;
  },

  /**
   * Discard server refresh token cookies and clean local sessions.
   */
  async logout(): Promise<void> {
    // Pass withCredentials to ensure cookies are clear-flushed by the server
    await api.post('/auth/logout', {}, { withCredentials: true });
  },

  /**
   * Exchange active refresh token cookies for fresh Access Token details.
   */
  async refreshToken(): Promise<{ user: User; accessToken: string }> {
    const response = await api.post('/auth/refresh', {}, { withCredentials: true });
    return response.data.data;
  },

  /**
   * Fetch details of the active authenticated session.
   */
  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  /**
   * Request a password reset link be emailed to the given address.
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Consume a password reset token to set a new password.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Change the password of the currently authenticated user.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};
export default authService;
