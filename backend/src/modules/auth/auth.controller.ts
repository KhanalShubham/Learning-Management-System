import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '@/utils/api-response';
import { AppError } from '@/middleware/error.middleware';
import { AuthRepository } from './auth.repository';
import { AuthService, UserJWTPayload } from './auth.service';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validator';
import { env } from '@/config/env';
import { sendPasswordResetEmail } from '@/config/mailer';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

const setRefreshTokenCookie = (res: Response, refreshToken: string, persistent = true) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // When "Remember Me" is unchecked, omit maxAge so the cookie is a browser-session
    // cookie (cleared on browser close) even though the underlying token stays valid
    // server-side until its natural expiry.
    ...(persistent ? { maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS } : {}),
  });
};

const toSanitizedUser = (user: { id: string; email: string; fullName: string; role: string; permissions: string[]; status: string }) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  permissions: user.permissions,
  status: user.status,
});

/**
 * Auth Controller
 *
 * Maps incoming HTTP routes to business service operations and constructs
 * standard REST responses.
 */
export class AuthController {
  /**
   * Handle Login requests against real user credentials.
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, rememberMe } = loginSchema.parse(req.body);
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const userRecord = await authRepository.findByEmailWithPassword(email);

      if (!userRecord) {
        await authRepository.writeAuditLog({
          email,
          action: 'LOGIN_FAILURE',
          ipAddress,
          userAgent,
        });
        throw new AppError('Invalid email or password', 401);
      }

      if (userRecord.status !== 'ACTIVE') {
        throw new AppError('This account is not active. Contact an administrator.', 403);
      }

      const isPasswordValid = await authService.comparePassword(password, userRecord.password);
      if (!isPasswordValid) {
        await authRepository.writeAuditLog({
          userId: userRecord.id,
          email,
          action: 'LOGIN_FAILURE',
          ipAddress,
          userAgent,
        });
        throw new AppError('Invalid email or password', 401);
      }

      const payload: UserJWTPayload = {
        id: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
        permissions: userRecord.permissions,
      };

      const accessToken = authService.signAccessToken(payload);
      const refreshToken = authService.signRefreshToken({ id: userRecord.id });

      await authRepository.createSession({
        userId: userRecord.id,
        token: refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE_MS),
      });

      await authRepository.updateLastLogin(userRecord.id);
      await authRepository.writeAuditLog({
        userId: userRecord.id,
        email,
        action: 'LOGIN_SUCCESS',
        ipAddress,
        userAgent,
      });

      setRefreshTokenCookie(res, refreshToken, rememberMe);

      return successResponse(res, 'Authentication successful.', {
        user: toSanitizedUser(userRecord),
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Token Refresh cycles with refresh-token rotation.
   */
  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = getCookieByName(req.headers.cookie, 'refreshToken');

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token missing.', null, 401);
      }

      try {
        authService.verifyRefreshToken(refreshToken);
      } catch {
        return errorResponse(res, 'Invalid or expired session token.', null, 401);
      }

      const session = await authRepository.findSessionByToken(refreshToken);

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        return errorResponse(res, 'Invalid or expired session token.', null, 401);
      }

      const sessionUser = session.user;
      const permissions = sessionUser.role.permissions.map(
        (rp: { permission: { code: string } }) => rp.permission.code
      );

      const payload: UserJWTPayload = {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role.name,
        permissions,
      };

      const accessToken = authService.signAccessToken(payload);
      const newRefreshToken = authService.signRefreshToken({ id: sessionUser.id });

      await authRepository.revokeSession(session.id);
      await authRepository.createSession({
        userId: sessionUser.id,
        token: newRefreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE_MS),
      });

      setRefreshTokenCookie(res, newRefreshToken);

      return successResponse(res, 'Session credentials refreshed.', {
        user: toSanitizedUser({
          id: sessionUser.id,
          email: sessionUser.email,
          fullName: sessionUser.fullName,
          role: sessionUser.role.name,
          permissions,
          status: sessionUser.status,
        }),
        accessToken,
      });
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
   * Terminate the current session, revoke its refresh token, and flush cookies.
   */
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = getCookieByName(req.headers.cookie, 'refreshToken');

      if (refreshToken) {
        const session = await authRepository.findSessionByToken(refreshToken);
        if (session && !session.isRevoked) {
          await authRepository.revokeSession(session.id);
          await authRepository.writeAuditLog({
            userId: session.userId,
            action: 'LOGOUT',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          });
        }
      }

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

  /**
   * Issue a password reset token and email it to the account owner.
   * Always responds with a generic success message to avoid leaking account existence.
   */
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await authRepository.findByEmail(email);

      if (user) {
        const { rawToken, tokenHash } = authService.generatePasswordResetToken();
        const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

        await authRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });
        await authRepository.writeAuditLog({
          userId: user.id,
          email,
          action: 'PASSWORD_RESET_REQUEST',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });

        const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${rawToken}`;
        await sendPasswordResetEmail(email, resetLink);
      }

      return successResponse(
        res,
        'If an account with that email exists, a password reset link has been sent.'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Consume a password reset token to set a new password, then revoke all active sessions.
   */
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      const tokenHash = authService.hashToken(token);

      const resetRecord = await authRepository.findValidPasswordResetToken(tokenHash);
      if (!resetRecord) {
        throw new AppError('This password reset link is invalid or has expired.', 400);
      }

      const hashedPassword = await authService.hashPassword(newPassword);
      await authRepository.updatePassword(resetRecord.userId, hashedPassword);
      await authRepository.markPasswordResetTokenUsed(resetRecord.id);
      await authRepository.revokeAllUserSessions(resetRecord.userId);
      await authRepository.writeAuditLog({
        userId: resetRecord.userId,
        action: 'PASSWORD_RESET_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, 'Password has been reset successfully. Please sign in again.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change the password of the currently authenticated user.
   */
  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication context missing.', null, 401);
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userRecord = await authRepository.findByEmailWithPassword(req.user.email);

      if (!userRecord) {
        throw new AppError('User not found', 404);
      }

      const isCurrentPasswordValid = await authService.comparePassword(
        currentPassword,
        userRecord.password
      );
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      const hashedPassword = await authService.hashPassword(newPassword);
      await authRepository.updatePassword(userRecord.id, hashedPassword);
      await authRepository.writeAuditLog({
        userId: userRecord.id,
        action: 'PASSWORD_CHANGE_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return successResponse(res, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  };
}
