import { useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';
import { teacherQueryKey } from './useTeacher';
import type {
  RegisterTeacherPayload,
  UpdateTeacherPayload,
  QualificationInput,
  EmergencyContactInput,
  DocumentInput,
  TeacherStatus,
  LeaveBalanceAdjustment,
} from '../types';

export const useRegisterTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterTeacherPayload) => facultyService.registerTeacher(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });
};

export const useUpdateTeacher = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTeacherPayload) => facultyService.updateTeacher(teacherId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useUpdateTeacherStatus = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, leavingDate }: { status: TeacherStatus; leavingDate?: string }) =>
      facultyService.updateTeacherStatus(teacherId, status, leavingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.deleteTeacher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });
};

export const useAddQualification = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QualificationInput) => facultyService.addQualification(teacherId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useDeleteQualification = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qualificationId: string) => facultyService.deleteQualification(teacherId, qualificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useAddEmergencyContact = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmergencyContactInput) => facultyService.addEmergencyContact(teacherId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useUpdateEmergencyContact = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: string; payload: Partial<EmergencyContactInput> }) =>
      facultyService.updateEmergencyContact(teacherId, contactId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useDeleteEmergencyContact = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => facultyService.deleteEmergencyContact(teacherId, contactId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useAddDocument = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentInput) => facultyService.addDocument(teacherId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useDeleteDocument = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => facultyService.deleteDocument(teacherId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useAdjustLeaveBalance = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeaveBalanceAdjustment) => facultyService.adjustLeaveBalance(teacherId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherQueryKey(teacherId) }),
  });
};

export const useUploadTeacherPhoto = () => {
  return useMutation({
    mutationFn: (file: File) => facultyService.uploadPhoto(file),
  });
};

export const useUploadTeacherDocumentFile = () => {
  return useMutation({
    mutationFn: (file: File) => facultyService.uploadDocumentFile(file),
  });
};
