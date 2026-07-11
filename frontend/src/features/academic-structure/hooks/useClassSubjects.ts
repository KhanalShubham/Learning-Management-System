import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';
import type { CreateClassSubjectPayload, UpdateClassSubjectPayload } from '../types';

const classSubjectsQueryKey = (classId?: string) => ['class-subjects', classId ?? null];

export const useClassSubjects = (classId?: string) => {
  return useQuery({
    queryKey: classSubjectsQueryKey(classId),
    queryFn: () => academicStructureService.listClassSubjects(classId),
    enabled: !!classId,
  });
};

export const useCreateClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassSubjectPayload) =>
      academicStructureService.createClassSubject(payload),
    onSuccess: (classSubject) =>
      queryClient.invalidateQueries({ queryKey: classSubjectsQueryKey(classSubject.classId) }),
  });
};

export const useUpdateClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassSubjectPayload }) =>
      academicStructureService.updateClassSubject(id, payload),
    onSuccess: (classSubject) =>
      queryClient.invalidateQueries({ queryKey: classSubjectsQueryKey(classSubject.classId) }),
  });
};

export const useDeleteClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.deleteClassSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class-subjects'] }),
  });
};

export const useAssignTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teacherId }: { id: string; teacherId: string | null }) =>
      academicStructureService.assignTeacher(id, teacherId),
    onSuccess: (classSubject) =>
      queryClient.invalidateQueries({ queryKey: classSubjectsQueryKey(classSubject.classId) }),
  });
};
