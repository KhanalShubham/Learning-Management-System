import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateSchema = z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format');
const timeRegex = /^\d{2}:\d{2}$/;
const timeSchema = z.string().regex(timeRegex, 'Time must be in HH:MM format');

export const createExamTermSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be less than or equal to end date', path: ['endDate'] }
);

export const updateExamTermSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
}).partial();

export const createExamSchema = z.object({
  examTermId: z.string().uuid('Invalid Exam Term ID'),
  classSubjectId: z.string().uuid('Invalid Class Subject ID'),
  examDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  roomNumber: z.string().max(50, 'Room number cannot exceed 50 characters').optional().nullable(),
  theoryMaxMarks: z.coerce.number().positive('Theory max marks must be positive'),
  theoryPassMarks: z.coerce.number().positive('Theory pass marks must be positive'),
  practicalMaxMarks: z.coerce.number().nonnegative('Practical max marks cannot be negative').default(0),
  practicalPassMarks: z.coerce.number().nonnegative('Practical pass marks cannot be negative').default(0),
}).refine(
  (data) => data.theoryPassMarks <= data.theoryMaxMarks,
  { message: 'Theory pass marks cannot exceed max marks', path: ['theoryPassMarks'] }
).refine(
  (data) => data.practicalPassMarks <= data.practicalMaxMarks,
  { message: 'Practical pass marks cannot exceed max marks', path: ['practicalPassMarks'] }
);

export const submitExamMarksSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().uuid('Invalid Student ID'),
      status: z.enum(['PRESENT', 'ABSENT', 'DISQUALIFIED']),
      theoryObtained: z.coerce.number().nonnegative('Theory mark cannot be negative').optional().nullable(),
      practicalObtained: z.coerce.number().nonnegative('Practical mark cannot be negative').optional().nullable(),
      remarks: z.string().max(255, 'Remarks cannot exceed 255 characters').optional().nullable(),
    })
  ).min(1, 'At least one student mark record is required'),
});

export const queryExamsSchema = z.object({
  examTermId: z.string().uuid('Invalid Exam Term ID').optional(),
  classSubjectId: z.string().uuid('Invalid Class Subject ID').optional(),
  classId: z.string().uuid('Invalid Class ID').optional(),
});
