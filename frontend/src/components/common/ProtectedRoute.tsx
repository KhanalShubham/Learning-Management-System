/**
 * Legacy Global Protected Route Guard
 * 
 * Re-exports the protected route component from the modular auth module
 * to prevent duplicate logic and support legacy imports.
 */

export { ProtectedRoute, type ProtectedRouteProps } from '@/features/auth/components/ProtectedRoute';
export { default } from '@/features/auth/components/ProtectedRoute';
