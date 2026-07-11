import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';

export const useStudentDaily = (
  date: string,
  classId: string,
  sectionId: string,
  academicYearId: string
) => {
  return useQuery({
    queryKey: ['attendance', 'students', 'daily', date, classId, sectionId, academicYearId],
    queryFn: () => attendanceService.getStudentDaily(date, classId, sectionId, academicYearId),
    enabled: !!date && !!classId && !!sectionId && !!academicYearId,
  });
};

export const useMarkStudentAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.markStudentAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'students', 'daily', variables.date, variables.classId, variables.sectionId, variables.academicYearId],
      });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'students', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'students', 'monthly'] });
    },
  });
};

export const useTeacherDaily = (date: string) => {
  return useQuery({
    queryKey: ['attendance', 'teachers', 'daily', date],
    queryFn: () => attendanceService.getTeacherDaily(date),
    enabled: !!date,
  });
};

export const useMarkTeacherAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.markTeacherAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'teachers', 'daily', variables.date],
      });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'teachers', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'teachers', 'monthly'] });
    },
  });
};

export const useStudentMonthly = (
  academicYearId: string,
  classId: string,
  sectionId: string,
  month: number,
  year: number
) => {
  return useQuery({
    queryKey: ['attendance', 'students', 'monthly', academicYearId, classId, sectionId, month, year],
    queryFn: () => attendanceService.getStudentMonthlyRegister(academicYearId, classId, sectionId, month, year),
    enabled: !!academicYearId && !!classId && !!sectionId && !!month && !!year,
  });
};

export const useTeacherMonthly = (month: number, year: number) => {
  return useQuery({
    queryKey: ['attendance', 'teachers', 'monthly', month, year],
    queryFn: () => attendanceService.getTeacherMonthlyRegister(month, year),
    enabled: !!month && !!year,
  });
};

export const useStudentDashboardStats = () => {
  return useQuery({
    queryKey: ['attendance', 'students', 'dashboard'],
    queryFn: attendanceService.getStudentDashboardStats,
  });
};

export const useTeacherDashboardStats = () => {
  return useQuery({
    queryKey: ['attendance', 'teachers', 'dashboard'],
    queryFn: attendanceService.getTeacherDashboardStats,
  });
};

export const useHolidays = () => {
  return useQuery({
    queryKey: ['attendance', 'holidays'],
    queryFn: attendanceService.listHolidays,
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'holidays'] });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'holidays'] });
    },
  });
};

export const useToggleLock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.toggleLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};
