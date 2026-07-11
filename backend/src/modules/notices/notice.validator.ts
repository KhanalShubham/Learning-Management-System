import { z } from 'zod';

const NOTICE_TAG = ['ADMISSIONS', 'EXAMINATION', 'EVENT', 'NOTICE'] as const;

export const noticeIdParamSchema = z.object({
  id: z.string().uuid('Invalid Notice ID'),
});

export const noticeSlugParamSchema = z.object({
  slug: z.string().min(1, 'Invalid Notice slug'),
});

export const listNoticesQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const listPublishedNoticesQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tag: z.enum(NOTICE_TAG).optional().default('NOTICE'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  body: z.array(z.string().min(1)).min(1, 'At least one body paragraph is required'),
  attachmentUrl: z.string().url('Invalid attachment URL').optional(),
  isPinned: z.coerce.boolean().optional().default(false),
  publishedAt: z.coerce.date().optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();
