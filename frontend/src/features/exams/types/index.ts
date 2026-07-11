export type ExamStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type MarksEntryStatus = 'PRESENT' | 'ABSENT' | 'DISQUALIFIED';
export type ExamResultStatus = 'DRAFT' | 'PUBLISHED';
export type ResultStatus = 'PASS' | 'FAIL' | 'WITHHELD' | 'ABSENT' | 'INCOMPLETE';

export interface ExamTerm {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  weightage: number;
  status: ExamResultStatus;
  createdAt: string;
  updatedAt: string;
  academicYear?: {
    id: string;
    label: string;
  };
}

export interface Exam {
  id: string;
  examTermId: string;
  classSubjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string | null;
  theoryMaxMarks: number;
  theoryPassMarks: number;
  practicalMaxMarks: number;
  practicalPassMarks: number;
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
  classSubject?: {
    id: string;
    classId: string;
    subjectId: string;
    class: {
      id: string;
      name: string;
    };
    subject: {
      id: string;
      name: string;
      code: string | null;
    };
  };
  examTerm?: ExamTerm;
}

export interface ExamMark {
  id: string;
  examId: string;
  studentId: string;
  status: MarksEntryStatus;
  theoryObtained: number | null;
  practicalObtained: number | null;
  remarks: string | null;
  enteredById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamReportCardDetail {
  id: string;
  reportCardId: string;
  subjectId: string;
  theoryObtained: number | null;
  practicalObtained: number | null;
  totalObtained: number;
  percentage: number;
  gradePoint: number;
  letterGrade: string;
  status: ResultStatus;
  subjectRank: number | null;
  remarks: string | null;
  subject?: {
    id: string;
    name: string;
    code: string | null;
  };
}

export interface ExamReportCard {
  id: string;
  examTermId: string;
  studentId: string;
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  gpa: number;
  resultStatus: ResultStatus;
  division: string | null;
  classRank: number | null;
  sectionRank: number | null;
  attendanceRate: number | null;
  remarks: string | null;
  version: number;
  publishedAt: string | null;
  details?: ExamReportCardDetail[];
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    admissionNumber: string;
  };
}

export interface StudentLedgerItem {
  studentId: string;
  rollNumber: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  admissionNumber: string;
  marksEntry: {
    status: MarksEntryStatus;
    theoryObtained: number | null;
    practicalObtained: number | null;
    remarks: string | null;
  } | null;
}

export interface ExamRosterResult {
  exam: Exam;
  roster: StudentLedgerItem[];
}
