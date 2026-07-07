import { z } from 'zod';

const optionalUrl = z.string().url('Invalid URL').optional().or(z.literal(''));
const optionalEmail = z.string().email('Invalid email address').optional().or(z.literal(''));

export const updateSchoolProfileSchema = z.object({
  name: z.string().min(1, 'School name is required').optional(),
  shortName: z.string().optional().or(z.literal('')),
  motto: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: optionalEmail,
  website: optionalUrl,
  address: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  municipality: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  googleMapLink: optionalUrl,
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});
