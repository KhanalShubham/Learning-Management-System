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
});

/**
 * Type inferred from the Login Validation Schema.
 */
export type LoginInput = z.infer<typeof loginSchema>;
