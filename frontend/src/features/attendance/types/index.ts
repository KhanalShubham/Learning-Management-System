export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
export type TeacherAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  markedById: string;
  student?: {
    id: string;
    admissionNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  markedBy?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  date: string;
  status: TeacherAttendanceStatus;
  remarks: string | null;
  markedById: string;
  teacher?: {
    id: string;
    employeeId: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    status: string;
  };
  markedBy?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLock {
  id: string;
  date: string;
  sectionId: string | null;
  isLocked: boolean;
  lockedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRegisterRow {
  studentId: string;
  rollNumber: number | null;
  fullName: string;
  admissionNumber: string;
  days: Record<number, AttendanceStatus>;
  stats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    percentage: number;
  };
}

export interface TeacherRegisterRow {
  teacherId: string;
  employeeId: string;
  fullName: string;
  days: Record<number, TeacherAttendanceStatus>;
  stats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    leave: number;
    percentage: number;
  };
}
