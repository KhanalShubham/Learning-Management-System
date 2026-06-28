import { UserJWTPayload } from '@/utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      user?: UserJWTPayload;
    }
  }
}
