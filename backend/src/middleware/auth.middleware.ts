/**
 * Legacy Global Auth Middleware
 * 
 * Re-exports authentication and authorization guards from the modular auth module
 * to prevent duplicate logic and support legacy imports.
 */

export { requireAuth, requireRole, requirePermission } from '@/modules/auth/auth.middleware';
