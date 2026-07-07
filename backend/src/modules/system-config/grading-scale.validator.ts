import { z } from 'zod';

export const gradingScaleIdParamSchema = z.object({
  id: z.string().uuid('Invalid Grading Scale ID'),
});

const baseGradingScaleSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  minPercentage: z.coerce.number().min(0).max(100),
  maxPercentage: z.coerce.number().min(0).max(100),
  gpa: z.coerce.number().min(0).optional(),
  description: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
});

export const createGradingScaleSchema = baseGradingScaleSchema.refine(
  (data) => data.minPercentage < data.maxPercentage,
  { message: 'Minimum percentage must be less than maximum percentage', path: ['maxPercentage'] }
);

export const updateGradingScaleSchema = baseGradingScaleSchema.partial().refine(
  (data) =>
    data.minPercentage === undefined ||
    data.maxPercentage === undefined ||
    data.minPercentage < data.maxPercentage,
  { message: 'Minimum percentage must be less than maximum percentage', path: ['maxPercentage'] }
);
