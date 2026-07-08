export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type GuardianRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN';
export type DocumentType =
  | 'BIRTH_CERTIFICATE'
  | 'TRANSFER_CERTIFICATE'
  | 'CHARACTER_CERTIFICATE'
  | 'PHOTO'
  | 'OTHER';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'WITHDRAWN';

export interface EnrollmentPlacement {
  id: string;
  studentId: string;
  academicYearId: string;
  academicYear: { id: string; label: string };
  classId: string;
  class: { id: string; name: string };
  sectionId: string;
  section: { id: string; name: string };
  rollNumber: number | null;
  enrolledAt: string;
}

export interface Guardian {
  id: string;
  studentId: string;
  relation: GuardianRelation;
  fullName: string;
  phone: string;
  email: string | null;
  occupation: string | null;
  address: string | null;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  documentType: DocumentType;
  fileUrl: string;
  uploadedAt: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  photoUrl: string | null;

  address: string | null;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;
  temporaryAddress: string | null;
  temporaryProvince: string | null;
  temporaryDistrict: string | null;
  temporaryMunicipality: string | null;
  temporaryWard: string | null;

  bloodGroup: string | null;
  allergies: string | null;
  medicalConditions: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;

  previousSchoolName: string | null;
  previousSchoolBoard: string | null;
  lastClassCompleted: string | null;
  transferCertificateNumber: string | null;

  feeCategory: string | null;
  status: StudentStatus;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentListItem = Student & { enrollments: EnrollmentPlacement[] };

export type StudentDetail = Student & {
  enrollments: EnrollmentPlacement[];
  guardians: Guardian[];
  documents: StudentDocument[];
};

export interface GuardianInput {
  relation: GuardianRelation;
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
}

export interface DocumentInput {
  documentType: DocumentType;
  fileUrl: string;
}

export interface AdmitStudentPayload {
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber?: number;

  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  photoUrl?: string;

  address?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  temporaryAddress?: string;
  temporaryProvince?: string;
  temporaryDistrict?: string;
  temporaryMunicipality?: string;
  temporaryWard?: string;

  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  previousSchoolName?: string;
  previousSchoolBoard?: string;
  lastClassCompleted?: string;
  transferCertificateNumber?: string;

  feeCategory?: string;

  guardians: GuardianInput[];
  documents?: DocumentInput[];
}

export type UpdateStudentPayload = Partial<
  Omit<AdmitStudentPayload, 'academicYearId' | 'classId' | 'sectionId' | 'rollNumber' | 'guardians' | 'documents'>
>;

export interface ListStudentsFilters {
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  status?: StudentStatus;
  search?: string;
  skip?: number;
  take?: number;
}

export interface ListStudentsResult {
  data: StudentListItem[];
  total: number;
}

export interface StudentSummary {
  total: number;
  active: number;
  todayAdmissions: number;
  newThisMonth: number;
  archived: number;
}
