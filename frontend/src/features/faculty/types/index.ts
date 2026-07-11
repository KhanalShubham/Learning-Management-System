export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
export type TeacherStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'RETIRED';
export type TeacherDocumentType =
  | 'CITIZENSHIP'
  | 'ACADEMIC_CERTIFICATE'
  | 'EXPERIENCE_LETTER'
  | 'APPOINTMENT_LETTER'
  | 'PAN_CARD'
  | 'PHOTO'
  | 'OTHER';

export type RecordStatus = 'ACTIVE' | 'ARCHIVED';

export interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  name: string;
  displayOrder: number;
  description: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code?: string;
  description?: string;
}
export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export interface CreateDesignationPayload {
  name: string;
  displayOrder: number;
  description?: string;
}
export type UpdateDesignationPayload = Partial<CreateDesignationPayload>;

export interface TeacherQualification {
  id: string;
  teacherId: string;
  degree: string;
  fieldOfStudy: string | null;
  institution: string;
  yearCompleted: number;
  createdAt: string;
}

export interface TeacherEmergencyContact {
  id: string;
  teacherId: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface TeacherDocument {
  id: string;
  teacherId: string;
  documentType: TeacherDocumentType;
  fileUrl: string;
  uploadedAt: string;
}

export interface TeacherLeaveBalance {
  teacherId: string;
  annualEntitlement: number;
  sickEntitlement: number;
  casualEntitlement: number;
  annualUsed: number;
  sickUsed: number;
  casualUsed: number;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  employeeId: string;

  firstName: string;
  middleName: string | null;
  lastName: string;

  dateOfBirth: string;
  gender: Gender;
  photoUrl: string | null;
  bloodGroup: string | null;

  phone: string;
  email: string | null;

  address: string | null;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;

  departmentId: string;
  designationId: string;
  employmentType: EmploymentType;
  joiningDate: string;
  leavingDate: string | null;
  status: TeacherStatus;

  basicSalary?: number | string | null;

  createdAt: string;
  updatedAt: string;
}

export type TeacherListItem = Teacher & {
  department: { id: string; name: string };
  designation: { id: string; name: string };
};

export type TeacherDetail = Teacher & {
  department: { id: string; name: string };
  designation: { id: string; name: string };
  qualifications: TeacherQualification[];
  emergencyContacts: TeacherEmergencyContact[];
  documents: TeacherDocument[];
  leaveBalance: TeacherLeaveBalance | null;
};

export interface QualificationInput {
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  yearCompleted: number;
}

export interface EmergencyContactInput {
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

export interface DocumentInput {
  documentType: TeacherDocumentType;
  fileUrl: string;
}

export interface RegisterTeacherPayload {
  departmentId: string;
  designationId: string;
  employmentType: EmploymentType;
  joiningDate: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  photoUrl?: string;
  bloodGroup?: string;

  phone: string;
  email?: string;

  address?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;

  basicSalary?: number;

  qualifications?: QualificationInput[];
  emergencyContacts: EmergencyContactInput[];
  documents?: DocumentInput[];
}

export type UpdateTeacherPayload = Partial<
  Omit<RegisterTeacherPayload, 'qualifications' | 'emergencyContacts' | 'documents'>
>;

export interface ListTeachersFilters {
  departmentId?: string;
  designationId?: string;
  status?: TeacherStatus;
  employmentType?: EmploymentType;
  search?: string;
  skip?: number;
  take?: number;
}

export interface ListTeachersResult {
  data: TeacherListItem[];
  total: number;
}

export interface TeacherSummary {
  total: number;
  active: number;
  onLeave: number;
  suspended: number;
  terminal: number;
  joinedThisMonth: number;
}

export type LeaveBalanceAdjustment = Partial<
  Pick<TeacherLeaveBalance, 'annualEntitlement' | 'sickEntitlement' | 'casualEntitlement' | 'annualUsed' | 'sickUsed' | 'casualUsed'>
>;
