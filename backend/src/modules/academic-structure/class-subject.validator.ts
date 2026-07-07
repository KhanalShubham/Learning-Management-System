import { z } from 'zod';

export const classSubjectIdParamSchema = z.object({
  id: z.string().uuid('Invalid Class Subject ID'),
});

export const listClassSubjectsQuerySchema = z.object({
  classId: z.string().uuid('Invalid Class ID').optional(),
});

interface MarksInput {
  fullMarks: number;
  passMarks: number;
  hasPractical: boolean;
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  practicalPassMarks?: number | null;
}

export const validateMarksConsistency = (data: MarksInput): { valid: boolean; message?: string } => {
  if (data.passMarks > data.fullMarks) {
    return { valid: false, message: 'Pass marks cannot exceed full marks' };
  }

  if (data.hasPractical) {
    if (data.theoryMarks == null || data.practicalMarks == null) {
      return {
        valid: false,
        message: 'Theory and practical marks are required when practical is enabled',
      };
    }
    if (data.theoryMarks + data.practicalMarks !== data.fullMarks) {
      return { valid: false, message: 'Theory + practical marks must equal full marks' };
    }
    if (data.passMarks > data.theoryMarks) {
      return { valid: false, message: 'Pass marks cannot exceed theory marks' };
    }
    if (data.practicalPassMarks == null) {
      return {
        valid: false,
        message: 'Practical pass marks is required when practical is enabled',
      };
    }
    if (data.practicalPassMarks < 1 || data.practicalPassMarks > data.practicalMarks) {
      return { valid: false, message: 'Practical pass marks must be between 1 and practical marks' };
    }
  } else {
    if (data.theoryMarks != null || data.practicalMarks != null || data.practicalPassMarks != null) {
      return {
        valid: false,
        message: 'Theory, practical, and practical pass marks must be left blank when practical is disabled',
      };
    }
  }

  return { valid: true };
};

export const createClassSubjectSchema = z
  .object({
    classId: z.string().uuid('Invalid Class ID'),
    subjectId: z.string().uuid('Invalid Subject ID'),
    fullMarks: z.coerce.number().int().positive(),
    passMarks: z.coerce.number().int().positive(),
    hasPractical: z.coerce.boolean().default(false),
    theoryMarks: z.coerce.number().int().positive().optional(),
    practicalMarks: z.coerce.number().int().positive().optional(),
    practicalPassMarks: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => validateMarksConsistency(data).valid, (data) => ({
    message: validateMarksConsistency(data).message,
    path: ['passMarks'],
  }));

export const updateClassSubjectSchema = z.object({
  fullMarks: z.coerce.number().int().positive().optional(),
  passMarks: z.coerce.number().int().positive().optional(),
  hasPractical: z.coerce.boolean().optional(),
  theoryMarks: z.coerce.number().int().positive().nullable().optional(),
  practicalMarks: z.coerce.number().int().positive().nullable().optional(),
  practicalPassMarks: z.coerce.number().int().positive().nullable().optional(),
});
