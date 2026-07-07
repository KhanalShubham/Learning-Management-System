import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';
import type { CreateSubjectPayload, UpdateSubjectPayload } from '../types';

const SUBJECTS_QUERY_KEY = ['subjects'];

export const useSubjects = (includeArchived?: boolean) => {
  return useQuery({
    queryKey: [...SUBJECTS_QUERY_KEY, includeArchived ?? false],
    queryFn: () => academicStructureService.listSubjects(includeArchived),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => academicStructureService.createSubject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) =>
      academicStructureService.updateSubject(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
};

export const useArchiveSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.archiveSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicStructureService.deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
};
