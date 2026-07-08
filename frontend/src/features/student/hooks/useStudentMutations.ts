import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import { studentQueryKey } from './useStudent';
import type {
  AdmitStudentPayload,
  UpdateStudentPayload,
  GuardianInput,
  DocumentInput,
  StudentStatus,
} from '../types';

export const useAdmitStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdmitStudentPayload) => studentService.admitStudent(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudent = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentPayload) => studentService.updateStudent(studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudentStatus = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: StudentStatus) => studentService.updateStudentStatus(studentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useAddGuardian = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GuardianInput) => studentService.addGuardian(studentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }),
  });
};

export const useUpdateGuardian = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      guardianId,
      payload,
    }: {
      guardianId: string;
      payload: Partial<Omit<GuardianInput, 'relation'>>;
    }) => studentService.updateGuardian(studentId, guardianId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }),
  });
};

export const useDeleteGuardian = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (guardianId: string) => studentService.deleteGuardian(studentId, guardianId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }),
  });
};

export const useAddDocument = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentInput) => studentService.addDocument(studentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }),
  });
};

export const useDeleteDocument = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => studentService.deleteDocument(studentId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }),
  });
};

export const useUploadStudentPhoto = () => {
  return useMutation({
    mutationFn: (file: File) => studentService.uploadPhoto(file),
  });
};

export const useUploadStudentDocumentFile = () => {
  return useMutation({
    mutationFn: (file: File) => studentService.uploadDocumentFile(file),
  });
};
