import { z } from 'zod';

const GENDER = ['MALE', 'FEMALE', 'OTHER'] as const;
const GUARDIAN_RELATION = ['FATHER', 'MOTHER', 'GUARDIAN'] as const;
const DOCUMENT_TYPE = [
  'BIRTH_CERTIFICATE',
  'TRANSFER_CERTIFICATE',
  'CHARACTER_CERTIFICATE',
  'PHOTO',
  'OTHER',
] as const;
const STUDENT_STATUS = ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED', 'WITHDRAWN'] as const;

export const studentIdParamSchema = z.object({
  id: z.string().uuid('Invalid Student ID'),
});

export const studentGuardianParamSchema = z.object({
  id: z.string().uuid('Invalid Student ID'),
  guardianId: z.string().uuid('Invalid Guardian ID'),
});

export const studentDocumentParamSchema = z.object({
  id: z.string().uuid('Invalid Student ID'),
  documentId: z.string().uuid('Invalid Document ID'),
});

export const listStudentsQuerySchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID').optional(),
  classId: z.string().uuid('Invalid Class ID').optional(),
  sectionId: z.string().uuid('Invalid Section ID').optional(),
  status: z.enum(STUDENT_STATUS).optional(),
  search: z.string().optional(),
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const guardianSchema = z.object({
  relation: z.enum(GUARDIAN_RELATION),
  fullName: z.string().min(1, 'Guardian name is required'),
  phone: z.string().min(1, 'Guardian phone is required'),
  email: z.string().email('Invalid guardian email').optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
});

const documentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE),
  fileUrl: z.string().url('Invalid file URL'),
});

export const admitStudentSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  classId: z.string().uuid('Invalid Class ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
  rollNumber: z.coerce.number().int().positive().optional(),

  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(GENDER),
  photoUrl: z.string().url('Invalid photo URL').optional(),

  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  ward: z.string().optional(),
  temporaryAddress: z.string().optional(),
  temporaryProvince: z.string().optional(),
  temporaryDistrict: z.string().optional(),
  temporaryMunicipality: z.string().optional(),
  temporaryWard: z.string().optional(),

  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  previousSchoolName: z.string().optional(),
  previousSchoolBoard: z.string().optional(),
  lastClassCompleted: z.string().optional(),
  transferCertificateNumber: z.string().optional(),

  feeCategory: z.string().optional(),

  guardians: z.array(guardianSchema).min(1, 'At least one guardian is required'),
  documents: z.array(documentSchema).optional().default([]),
});

export const updateStudentSchema = admitStudentSchema
  .omit({
    academicYearId: true,
    classId: true,
    sectionId: true,
    rollNumber: true,
    guardians: true,
    documents: true,
  })
  .partial();

export const updateStudentStatusSchema = z.object({
  status: z.enum(STUDENT_STATUS),
});

export const promoteStudentSchema = z.object({
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  classId: z.string().uuid('Invalid Class ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
  rollNumber: z.coerce.number().int().positive().optional(),
});

export const addGuardianSchema = guardianSchema;

export const updateGuardianSchema = guardianSchema.omit({ relation: true }).partial();

export const addDocumentSchema = documentSchema;
