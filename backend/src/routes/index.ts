import { Router } from 'express';
import { successResponse, errorResponse } from '@/utils/api-response';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt.utils';
import { requireAuth } from '@/middleware/auth.middleware';

const router = Router();

// Helper to parse cookie strings manually
const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    if (name) {
      list[name] = decodeURIComponent(parts.slice(1).join('='));
    }
  });
  return list;
};

router.get('/health', (req, res) => {
  return successResponse(res, 'School ERP System API is running smoothly', {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Mock login route to generate credentials
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 'Email and password required', null, 400);
  }

  // Set mock role based on email keyword
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

  const user = { id: 'usr_mock123', email, role, permissions };
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken({ id: user.id });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, 'Login successful', { user, accessToken });
});

// Refresh token route
router.post('/auth/refresh', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token missing', null, 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    // Mock user matching
    const user = {
      id: decoded.id,
      email: 'admin@deukhuri.edu', // default mock
      role: 'ADMIN',
      permissions: ['*'],
    };

    const accessToken = signAccessToken(user);
    return successResponse(res, 'Token refreshed successfully', { user, accessToken });
  } catch (error) {
    return errorResponse(res, 'Invalid or expired refresh token', null, 401);
  }
});

// Protected identity profile route
router.get('/auth/me', requireAuth, (req, res) => {
  return successResponse(res, 'User session loaded', { user: req.user });
});

// Logout route to clear cookie
router.post('/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return successResponse(res, 'Logged out successfully');
});

export default router;
