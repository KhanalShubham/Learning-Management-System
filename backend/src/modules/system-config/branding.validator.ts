import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color')
  .optional()
  .or(z.literal(''));

export const updateBrandingSchema = z.object({
  primaryColor: hexColor,
  secondaryColor: hexColor,
});
