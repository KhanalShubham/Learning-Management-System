import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { IAuthRepository } from './auth.repository';

/**
 * Token payload structure for Access Token JWTs.
 */
export interface UserJWTPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Token payload structure for Refresh Token JWTs.
 */
export interface RefreshJWTPayload {
  id: string;
  version?: number;
}

/**
 * Auth Service
 * 
 * Orchestrates business logcs for credentials checking, password encryption,
 * and JSON Web Token (JWT) authorization signatures.
 */
export class AuthService {
  private saltRounds = 12;

  constructor(private authRepository: IAuthRepository) {}

  /**
   * Securely hash a plain text password using bcrypt.
   */
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify if a plain text password matches a previously hashed version.
   */
  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a signed JSON Web Access Token (JWT) representing user privileges.
   */
  public signAccessToken(payload: UserJWTPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generate a signed JSON Web Refresh Token (JWT) representing session credentials.
   */
  public signRefreshToken(payload: RefreshJWTPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRATION as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Validate a client-provided Access Token (JWT).
   */
  public verifyAccessToken(token: string): UserJWTPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as UserJWTPayload;
  }

  /**
   * Validate a client-provided Refresh Token (JWT).
   */
  public verifyRefreshToken(token: string): RefreshJWTPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshJWTPayload;
  }
}
