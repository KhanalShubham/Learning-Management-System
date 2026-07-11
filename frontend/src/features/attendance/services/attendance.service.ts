import { api } from '@/services/api';
import type {
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  Holiday,
  AttendanceLock,
  StudentRegisterRow,
  TeacherRegisterRow,
} from '../types';

export const attendanceService = {
  // Student Attendance
  async getStudentDaily(
    date: string,
    classId: string,
    sectionId: string,
    academicYearId: string
  ): Promise<StudentAttendanceRecord[]> {
    const response = await api.get('/attendance/students', {
      params: { date, classId, sectionId, academicYearId },
    });
    return response.data.data.records;
  },

  async markStudentAttendance(payload: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    date: string;
    records: Array<{ studentId: string; status: string; remarks?: string | null }>;
  }): Promise<StudentAttendanceRecord[]> {
    const response = await api.post('/attendance/students', payload);
    return response.data.data.records;
  },

  async getStudentHistory(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<StudentAttendanceRecord[]> {
    const response = await api.get(`/attendance/students/${studentId}`, {
      params: { startDate, endDate },
    });
    return response.data.data.records;
  },

  async getStudentMonthlyRegister(
    academicYearId: string,
    classId: string,
    sectionId: string,
    month: number,
    year: number
  ): Promise<StudentRegisterRow[]> {
    const response = await api.get('/attendance/students/register', {
      params: { academicYearId, classId, sectionId, month, year },
    });
    return response.data.data.register;
  },

  async getStudentDashboardStats(): Promise<any> {
    const response = await api.get('/attendance/students/dashboard');
    return response.data.data.stats;
  },

  // Teacher Attendance
  async getTeacherDaily(date: string): Promise<TeacherAttendanceRecord[]> {
    const response = await api.get('/attendance/teachers', { params: { date } });
    return response.data.data.records;
  },

  async markTeacherAttendance(payload: {
    date: string;
    records: Array<{ teacherId: string; status: string; remarks?: string | null }>;
  }): Promise<TeacherAttendanceRecord[]> {
    const response = await api.post('/attendance/teachers', payload);
    return response.data.data.records;
  },

  async getTeacherHistory(
    teacherId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TeacherAttendanceRecord[]> {
    const response = await api.get(`/attendance/teachers/${teacherId}`, {
      params: { startDate, endDate },
    });
    return response.data.data.records;
  },

  async getTeacherMonthlyRegister(month: number, year: number): Promise<TeacherRegisterRow[]> {
    const response = await api.get('/attendance/teachers/register', {
      params: { month, year },
    });
    return response.data.data.register;
  },

  async getTeacherDashboardStats(): Promise<any> {
    const response = await api.get('/attendance/teachers/dashboard');
    return response.data.data.stats;
  },

  // Configuration & Locks
  async createHoliday(payload: { name: string; startDate: string; endDate: string }): Promise<Holiday> {
    const response = await api.post('/attendance/holidays', payload);
    return response.data.data.holiday;
  },

  async listHolidays(): Promise<Holiday[]> {
    const response = await api.get('/attendance/holidays');
    return response.data.data.holidays;
  },

  async deleteHoliday(id: string): Promise<void> {
    await api.delete(`/attendance/holidays/${id}`);
  },

  async toggleLock(payload: {
    date: string;
    sectionId?: string | null;
    isLocked: boolean;
  }): Promise<AttendanceLock> {
    const response = await api.post('/attendance/locks', payload);
    return response.data.data.lock;
  },
};
