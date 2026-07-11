/**
 * Authentication Types
 *
 * Houses types, interfaces, and enums representing users, privileges,
 * and context state properties for the modular authentication feature.
 */

/**
 * Valid user roles within the ERP (Version 1: two login roles only).
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN';

/**
 * Standardized system permissions for granular security checks.
 * Mirrors the dot-delimited permission codes seeded on the backend
 * (see backend/prisma/seed.ts) — keep both in sync.
 */
export type Permission =
  | '*' // Full, unrestricted access (Super Admin only)
  | 'users.read'
  | 'users.write'
  | 'roles.read'
  | 'roles.write'
  | 'students.read'
  | 'students.admit'
  | 'students.update'
  | 'students.archive'
  | 'teachers.read'
  | 'teachers.create'
  | 'teachers.update'
  | 'teachers.archive'
  | 'teachers.salary'
  | 'teachers.leave'
  | 'teachers.documents'
  | 'attendance.mark'
  | 'attendance.view'
  | 'attendance.teacher.mark'
  | 'attendance.teacher.view'
  | 'exams.publish'
  | 'exams.enter'
  | 'exams.view'
  | 'certificates.generate'
  | 'certificates.download'
  | 'certificates.view'
  | 'cms.publish'
  | 'cms.edit'
  | 'finance.read'
  | 'finance.write'
  | 'settings.read'
  | 'settings.write'
  | 'system.read'
  | 'system.write';

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
