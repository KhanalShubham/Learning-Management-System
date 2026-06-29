import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '@/utils/api-response';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { loginSchema } from './auth.validator';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

/**
 * Parses cookies manually from the Request headers since cookie-parser middleware is not loaded.
 */
const getCookieByName = (cookieHeader: string | undefined, name: string): string | null => {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const parts = cookie.split('=');
    const key = parts[0].trim();
    if (key === name) {
      return decodeURIComponent(parts.slice(1).join('='));
    }
  }
  return null;
};

/**
 * Auth Controller
 * 
 * Maps incoming HTTP routes to business service operations and constructs
 * standard REST responses.
 */
export class AuthController {
  /**
   * Handle Login requests (Mock/infrastructure implementation for Sprint 3.1)
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate bounds using Zod validator
      const validated = loginSchema.parse(req.body);
      const { email } = validated;

      // Temporary mock role assignments based on email matching
      let role = 'STUDENT';
      let permissions = ['academics:read', 'attendance:read', 'exams:read', 'billing:read'];
      
      if (email.includes('admin')) {
        role = 'ADMIN';
        permissions = ['*'];
      } else if (email.includes('teacher')) {
        role = 'TEACHER';
        permissions = [
          'academics:read',
          'students:read',
          'teachers:read',
          'attendance:read',
          'attendance:write',
          'exams:read',
          'exams:write',
        ];
      }

      const user = {
        id: 'usr_mock123',
        fullName: email.split('@')[0].toUpperCase(),
        email,
        role,
        permissions,
        status: 'ACTIVE',
      };

      const accessToken = authService.signAccessToken(user);
      const refreshToken = authService.signRefreshToken({ id: user.id });

      // Persist refresh token version in HTTP-Only Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, 'Authentication successful.', { user, accessToken });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Token Refresh cycles
   */
  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = getCookieByName(req.headers.cookie, 'refreshToken');

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token missing.', null, 401);
      }

      try {
        const decoded = authService.verifyRefreshToken(refreshToken);
        
        // Mock user details lookup
        const user = {
          id: decoded.id,
          fullName: 'ADMINISTRATOR',
          email: 'admin@deukhuri.edu',
          role: 'ADMIN',
          permissions: ['*'],
          status: 'ACTIVE',
        };

        const accessToken = authService.signAccessToken(user);

        return successResponse(res, 'Session credentials refreshed.', { user, accessToken });
      } catch (error) {
        return errorResponse(res, 'Invalid or expired session token.', null, 401);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetch current authenticated session profile
   */
  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication context missing.', null, 401);
      }

      return successResponse(res, 'User session retrieved.', { user: req.user });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Terminate user session and flush HTTP-Only Cookies
   */
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return successResponse(res, 'Session logged out successfully.');
    } catch (error) {
      next(error);
    }
  };
}
