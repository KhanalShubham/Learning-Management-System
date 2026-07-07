import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';
import type { CreateClassPayload, UpdateClassPayload } from '../types';

const classesQueryKey = (academicYearId?: string) => ['classes', academicYearId ?? null];

export const useClasses = (academicYearId?: string, includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...classesQueryKey(academicYearId), includeArchived ?? false],
    queryFn: () => academicStructureService.listClasses(academicYearId, includeArchived),
    enabled: !!academicYearId,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => academicStructureService.createClass(payload),
    onSuccess: (cls) => queryClient.invalidateQueries({ queryKey: classesQueryKey(cls.academicYearId) }),
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) =>
      academicStructureService.updateClass(id, payload),
    onSuccess: (cls) => queryClient.invalidateQueries({ queryKey: classesQueryKey(cls.academicYearId) }),
  });
};

export const useArchiveClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.archiveClass(id),
    onSuccess: (cls) => queryClient.invalidateQueries({ queryKey: classesQueryKey(cls.academicYearId) }),
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.deleteClass(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });
};
