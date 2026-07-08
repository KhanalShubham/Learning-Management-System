import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/utils/api-response';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

// Initialize instances for middleware execution
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

/**
 * Authentication Middleware
 * 
 * Verifies client Access Token passed in the Authorization Bearer header.
 * Attaches the verified user payload onto the Request object.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization credentials missing or invalid', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      return errorResponse(
        res,
        'ACCESS_TOKEN_EXPIRED',
        [{ field: 'token', message: 'ACCESS_TOKEN_EXPIRED' }],
        401
      );
    }
    return errorResponse(res, 'Invalid authorization token', null, 401);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Guards routes, only allowing requests from users with pre-approved roles.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, 'Permission denied: Insufficient role permissions.', null, 403);
    }

    return next();
  };
};

/**
 * Permission-Based Access Control Middleware
 *
 * Checks the active user permissions matrix against the required action permission.
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    if (!hasPermission(req, permission)) {
      return errorResponse(res, 'Permission denied: Required access permission is missing.', null, 403);
    }

    return next();
  };
};

/**
 * Inline capability check for controllers that need to branch behavior by
 * permission rather than reject the whole request — e.g. stripping a
 * sensitive field (Faculty Engine's basicSalary) from a response instead of
 * a hard 403, or picking which permission a status transition requires.
 */
export const hasPermission = (req: Request, permission: string): boolean => {
  if (!req.user) return false;
  const { permissions } = req.user;
  return permissions.includes(permission) || permissions.includes('*');
};

/**
 * Route-level gate for endpoints whose exact required permission depends on
 * the request body (e.g. Faculty Engine's teacher status endpoint: a
 * non-terminal transition needs teachers.update, a terminal one needs
 * teachers.archive). Passes if the caller holds ANY of the listed
 * permissions; the service layer still enforces the precise rule using
 * hasPermission() for each specific check.
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    if (!permissions.some((permission) => hasPermission(req, permission))) {
      return errorResponse(res, 'Permission denied: Required access permission is missing.', null, 403);
    }

    return next();
  };
};
