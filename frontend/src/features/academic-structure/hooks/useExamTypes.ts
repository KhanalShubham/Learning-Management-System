import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';
import type { CreateExamTypePayload, UpdateExamTypePayload } from '../types';

const examTypesQueryKey = (academicYearId?: string) => ['examTypes', academicYearId ?? null];

export const useExamTypes = (academicYearId?: string, includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...examTypesQueryKey(academicYearId), includeArchived ?? false],
    queryFn: () => academicStructureService.listExamTypes(academicYearId, includeArchived),
    enabled: !!academicYearId,
  });
};

export const useCreateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamTypePayload) => academicStructureService.createExamType(payload),
    onSuccess: (examType) =>
      queryClient.invalidateQueries({ queryKey: examTypesQueryKey(examType.academicYearId) }),
  });
};

export const useUpdateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExamTypePayload }) =>
      academicStructureService.updateExamType(id, payload),
    onSuccess: (examType) =>
      queryClient.invalidateQueries({ queryKey: examTypesQueryKey(examType.academicYearId) }),
  });
};

export const useArchiveExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.archiveExamType(id),
    onSuccess: (examType) =>
      queryClient.invalidateQueries({ queryKey: examTypesQueryKey(examType.academicYearId) }),
  });
};

export const useDeleteExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.deleteExamType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['examTypes'] }),
  });
};
