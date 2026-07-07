import { z } from 'zod';

/**
 * Zod validation schema for login credentials.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required.' })
    .email('Please provide a valid email address format.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.'),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Type inferred from the Login Validation Schema.
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Zod validation schema for the Forgot Password request.
 */
export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email address is required.' }).email('Please provide a valid email address format.'),
});

/**
 * Zod validation schema for the Reset Password request.
 */
export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required.' }).min(1, 'Reset token is required.'),
  newPassword: z
    .string({ required_error: 'New password is required.' })
    .min(8, 'Password must be at least 8 characters long.'),
});

/**
 * Zod validation schema for the Change Password request.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required.' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required.' })
    .min(8, 'Password must be at least 8 characters long.'),
});
