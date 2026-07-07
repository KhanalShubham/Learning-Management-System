import { UserJWTPayload } from '@/modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: UserJWTPayload;
    }
  }
}
