import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface UserJWTPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RefreshJWTPayload {
  id: string;
  version?: number;
}

export const signAccessToken = (payload: UserJWTPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION,
  });
};

export const signRefreshToken = (payload: RefreshJWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRATION,
  });
};

export const verifyAccessToken = (token: string): UserJWTPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as UserJWTPayload;
};

export const verifyRefreshToken = (token: string): RefreshJWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshJWTPayload;
};
