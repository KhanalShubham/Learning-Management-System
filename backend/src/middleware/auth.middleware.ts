import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.utils';
import { errorResponse } from '@/utils/api-response';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization credentials missing or invalid', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
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

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { permissions } = req.user;
    const hasPermission = permissions.includes(permission) || permissions.includes('*');

    if (!hasPermission) {
      return errorResponse(res, 'Permission denied', null, 403);
    }

    return next();
  };
};
