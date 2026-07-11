export type RecordStatus = 'ACTIVE' | 'ARCHIVED';

export interface Class {
  id: string;
  academicYearId: string;
  name: string;
  displayOrder: number;
  description: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  academicYearId: string;
  name: string;
  displayOrder: number;
  description?: string;
}

export type UpdateClassPayload = Partial<Omit<CreateClassPayload, 'academicYearId'>>;

export interface Section {
  id: string;
  classId: string;
  name: string;
  capacity: number | null;
  roomNumber: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  classId: string;
  name: string;
  capacity?: number;
  roomNumber?: string;
}

export type UpdateSectionPayload = Partial<Omit<CreateSectionPayload, 'classId'>>;

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isOptional: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectPayload {
  name: string;
  code?: string;
  description?: string;
  isOptional?: boolean;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

export interface ClassSubjectTeacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  subject: Subject;
  class: Class;
  teacherId: string | null;
  teacher: ClassSubjectTeacher | null;
  fullMarks: number;
  passMarks: number;
  hasPractical: boolean;
  theoryMarks: number | null;
  practicalMarks: number | null;
  practicalPassMarks: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassSubjectPayload {
  classId: string;
  subjectId: string;
  fullMarks: number;
  passMarks: number;
  hasPractical: boolean;
  theoryMarks?: number;
  practicalMarks?: number;
  practicalPassMarks?: number;
}

export type UpdateClassSubjectPayload = Partial<
  Omit<CreateClassSubjectPayload, 'classId' | 'subjectId'>
>;

export interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: RecordStatus;
}

export interface ExamType {
  id: string;
  academicYearId: string;
  name: string;
  code: string | null;
  description: string | null;
  displayOrder: number;
  weightage: number;
  isPublished: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamTypePayload {
  academicYearId: string;
  name: string;
  code?: string;
  description?: string;
  displayOrder: number;
  weightage: number;
  isPublished?: boolean;
}

export type UpdateExamTypePayload = Partial<Omit<CreateExamTypePayload, 'academicYearId'>>;

export interface AcademicStructureSummary {
  classes: number;
  sections: number;
  subjects: number;
  classSubjects: number;
  examTypes: number;
}

export interface AcademicStructureTree {
  academicYear: AcademicYear;
  summary: AcademicStructureSummary;
  classes: Array<
    Class & {
      sections: Section[];
      subjects: Array<Omit<ClassSubject, 'subject'> & { subject: Subject }>;
    }
  >;
  subjects: Subject[];
  examTypes: ExamType[];
}
