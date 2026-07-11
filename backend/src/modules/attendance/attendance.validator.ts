import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateSchema = z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format');

export const markStudentAttendanceSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  classId: z.string().uuid('Invalid Class ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
  date: dateSchema,
  records: z.array(
    z.object({
      studentId: z.string().uuid('Invalid Student ID'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']),
      remarks: z.string().max(255, 'Remarks cannot exceed 255 characters').optional().nullable(),
    })
  ).min(1, 'At least one student record is required'),
});

export const queryStudentAttendanceSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID').optional(),
  classId: z.string().uuid('Invalid Class ID').optional(),
  sectionId: z.string().uuid('Invalid Section ID').optional(),
  date: dateSchema.optional(),
  studentId: z.string().uuid('Invalid Student ID').optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().positive().optional(),
});

export const markTeacherAttendanceSchema = z.object({
  date: dateSchema,
  records: z.array(
    z.object({
      teacherId: z.string().uuid('Invalid Teacher ID'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
      remarks: z.string().max(255, 'Remarks cannot exceed 255 characters').optional().nullable(),
    })
  ).min(1, 'At least one teacher record is required'),
});

export const queryTeacherAttendanceSchema = z.object({
  date: dateSchema.optional(),
  teacherId: z.string().uuid('Invalid Teacher ID').optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().positive().optional(),
});

export const createHolidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  startDate: dateSchema,
  endDate: dateSchema,
});

export const toggleLockSchema = z.object({
  date: dateSchema,
  sectionId: z.string().uuid('Invalid Section ID').optional().nullable(),
  isLocked: z.boolean(),
});
