import { z } from 'zod';

const GENDER = ['MALE', 'FEMALE', 'OTHER'] as const;
const EMPLOYMENT_TYPE = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING'] as const;
const TEACHER_STATUS = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED'] as const;
const DOCUMENT_TYPE = [
  'CITIZENSHIP',
  'ACADEMIC_CERTIFICATE',
  'EXPERIENCE_LETTER',
  'APPOINTMENT_LETTER',
  'PAN_CARD',
  'PHOTO',
  'OTHER',
] as const;

export const teacherIdParamSchema = z.object({
  id: z.string().uuid('Invalid Teacher ID'),
});

export const teacherQualificationParamSchema = z.object({
  id: z.string().uuid('Invalid Teacher ID'),
  qualificationId: z.string().uuid('Invalid Qualification ID'),
});

export const teacherContactParamSchema = z.object({
  id: z.string().uuid('Invalid Teacher ID'),
  contactId: z.string().uuid('Invalid Emergency Contact ID'),
});

export const teacherDocumentParamSchema = z.object({
  id: z.string().uuid('Invalid Teacher ID'),
  documentId: z.string().uuid('Invalid Document ID'),
});

export const listTeachersQuerySchema = z.object({
  departmentId: z.string().uuid('Invalid Department ID').optional(),
  designationId: z.string().uuid('Invalid Designation ID').optional(),
  status: z.enum(TEACHER_STATUS).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPE).optional(),
  search: z.string().optional(),
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const qualificationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  yearCompleted: z.coerce
    .number()
    .int()
    .min(1950, 'Year completed must be 1950 or later')
    .max(new Date().getFullYear(), 'Year completed cannot be in the future'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Contact phone is required'),
  isPrimary: z.coerce.boolean().optional().default(false),
});

const documentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE),
  fileUrl: z.string().url('Invalid file URL'),
});

export const registerTeacherSchema = z.object({
  departmentId: z.string().uuid('Invalid Department ID'),
  designationId: z.string().uuid('Invalid Designation ID'),
  employmentType: z.enum(EMPLOYMENT_TYPE),
  joiningDate: z.coerce.date(),

  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(GENDER),
  photoUrl: z.string().url('Invalid photo URL').optional(),
  bloodGroup: z.string().optional(),

  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional(),

  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  ward: z.string().optional(),

  // Only persisted if the caller holds teachers.salary — silently stripped
  // otherwise at the service layer, not rejected as a validation error (see
  // docs/architecture/faculty-engine-design-spec.md §7).
  basicSalary: z.coerce.number().nonnegative().optional(),

  qualifications: z.array(qualificationSchema).optional().default([]),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
  documents: z.array(documentSchema).optional().default([]),
});

export const updateTeacherSchema = registerTeacherSchema
  .omit({ qualifications: true, emergencyContacts: true, documents: true })
  .partial();

export const updateTeacherStatusSchema = z.object({
  status: z.enum(TEACHER_STATUS),
  // Only meaningful when transitioning into a terminal status; defaults to
  // today in the service if omitted. Ignored (and cleared) on a rehire
  // (terminal → ACTIVE) transition.
  leavingDate: z.coerce.date().optional(),
});

export const addQualificationSchema = qualificationSchema;

export const addEmergencyContactSchema = emergencyContactSchema;
export const updateEmergencyContactSchema = emergencyContactSchema.partial();

export const addDocumentSchema = documentSchema;

export const adjustLeaveBalanceSchema = z.object({
  annualEntitlement: z.coerce.number().int().min(0).optional(),
  sickEntitlement: z.coerce.number().int().min(0).optional(),
  casualEntitlement: z.coerce.number().int().min(0).optional(),
  annualUsed: z.coerce.number().int().min(0).optional(),
  sickUsed: z.coerce.number().int().min(0).optional(),
  casualUsed: z.coerce.number().int().min(0).optional(),
});
