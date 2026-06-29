/**
 * Authentication Types
 * 
 * Houses types, interfaces, and enums representing users, privileges,
 * and context state properties for the modular authentication feature.
 */

/**
 * Valid user roles within the enterprise ERP ecosystem.
 */
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

/**
 * Standardized system permissions for granular security checks.
 */
export type Permission =
  | '*' // Super privileges (typically ADMIN)
  | 'academics:read'
  | 'academics:write'
  | 'students:read'
  | 'students:write'
  | 'teachers:read'
  | 'teachers:write'
  | 'attendance:read'
  | 'attendance:write'
  | 'exams:read'
  | 'exams:write'
  | 'fees:read'
  | 'fees:write'
  | 'cms:read'
  | 'cms:write'
  | 'settings:read'
  | 'settings:write';

/**
 * Repesents an authenticated ERP user profile.
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  status?: string;
  lastLogin?: string;
}

/**
 * Context properties provided by the AuthProvider.
 */
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
